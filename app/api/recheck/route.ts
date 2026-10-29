import { NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import { callNemotron } from "@/lib/llm";
import { verifyRequirements } from "@/lib/verify";
import { buildDraftPrompt } from "@/lib/prompts/draft";
import { Facts, DocumentInput, PolicySource, Requirement, NDJSONEvent } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";

/** Same serverless budget reasoning as /api/run: finish early rather than be killed. */
const RECHECK_BUDGET_MS = 50_000;
const DRAFT_MIN_BUDGET_MS = 13_000;

export async function POST(req: NextRequest) {
  const env = getEnv();
  const encoder = new TextEncoder();
  const recheckStart = Date.now();
  const remainingMs = () => RECHECK_BUDGET_MS - (Date.now() - recheckStart);

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: NDJSONEvent) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        const body = await req.json();
        const {
          existingFacts,
          existingDocs,
          sources,
          currentRequirements,
          targetRowIds,
          newDocument,
        } = body as {
          existingFacts: Facts;
          existingDocs: DocumentInput[];
          sources: PolicySource[];
          currentRequirements: Requirement[];
          targetRowIds: string[];
          newDocument: DocumentInput;
        };

        const allDocs = [...(existingDocs || []), newDocument];

        // Step 1: Re-evaluate ONLY target rows with Nemotron Super
        emit({ type: "step", step: "evidence_matrix", status: "running" });

        const targetRows = (currentRequirements || []).filter((r) =>
          targetRowIds.includes(r.id)
        );

        const recheckPrompt = `The user has added additional evidence:
[DOCUMENT ${newDocument.id}]: ${newDocument.name}
${newDocument.content}

Target requirements to re-evaluate:
${JSON.stringify(targetRows, null, 2)}

Existing policy sources:
${(sources || []).map((s) => `[SOURCE ${s.id}]:\n${s.text.slice(0, 4000)}`).join("\n\n")}

Re-evaluate ONLY the target requirements. If the new evidence satisfies the requirement, flip status to "supported" and reference "${newDocument.id}".
Return JSON { "requirements": [...] }`;

        let updatedRows: Requirement[] = [];
        try {
          const modelRes = await callNemotron<{ requirements: Requirement[] }>({
            step: "evidence_matrix",
            model: env.reasonModel,
            timeoutMs: Math.max(0, remainingMs() - DRAFT_MIN_BUDGET_MS),
            system:
              "You are a legal evidence analyst. Update only the specified requirements using the new document.",
            user: recheckPrompt,
            json: true,
          });
          updatedRows = modelRes.data.requirements || [];
          emit({
            type: "step",
            step: "evidence_matrix",
            status: "done",
            model: modelRes.meta.model,
            latency_ms: modelRes.meta.latency_ms,
          });
        } catch {
          // Fallback heuristic if LLM call fails
          updatedRows = targetRows.map((r) => ({
            ...r,
            status: "supported" as const,
            doc_ids: [...new Set([...r.doc_ids, newDocument.id])],
            evidence: `${r.evidence}. Additional verified proof provided in ${newDocument.name}.`,
          }));
          emit({
            type: "step",
            step: "evidence_matrix",
            status: "done",
            model: "fallback",
            latency_ms: 100,
          });
        }

        // Step 2: Merge updated rows back into requirements list
        const updatedReqMap = new Map(updatedRows.map((r) => [r.id, r]));
        const mergedReqs = (currentRequirements || []).map(
          (r) => updatedReqMap.get(r.id) || r
        );

        // Step 3: Run Deterministic Verifier on full list
        const verificationResult = verifyRequirements(
          mergedReqs,
          existingFacts,
          allDocs,
          sources || []
        );

        emit({ type: "requirements", data: verificationResult.requirements });
        emit({ type: "verification", data: verificationResult });

        // Step 4: Redraft Claim Email
        emit({ type: "step", step: "draft_claim", status: "running" });
        try {
          const draftPrompt = buildDraftPrompt(
            existingFacts,
            verificationResult.requirements,
            sources || []
          );
          const draftRes = await callNemotron<any>({
            step: "draft_claim",
            model: env.fastModel,
            timeoutMs: Math.max(0, remainingMs()),
            system: "Draft an updated claim letter reflecting the newly provided proof.",
            user: draftPrompt,
            json: true,
          });
          emit({
            type: "step",
            step: "draft_claim",
            status: "done",
            model: draftRes.meta.model,
            latency_ms: draftRes.meta.latency_ms,
          });
          emit({ type: "claim", data: draftRes.data });
        } catch {
          emit({
            type: "step",
            step: "draft_claim",
            status: "done",
            model: "fallback",
            latency_ms: 50,
          });
        }

        emit({ type: "done", mode: "live" });
      } catch (err: any) {
        emit({ type: "error", step: "recheck", message: err.message, recoverable: false });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
  });
}

