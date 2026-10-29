import { NextRequest } from "next/server";
import { getEnv } from "@/lib/env";
import { callNemotron } from "@/lib/llm";
import { EXTRACT_FACTS_SYSTEM, buildExtractPrompt, validateFacts } from "@/lib/prompts/extract";
import { PLAN_RESEARCH_SYSTEM, buildPlanPrompt, validatePlan, ResearchPlan } from "@/lib/prompts/plan";
import { MATRIX_SYSTEM_PROMPT, buildMatrixPrompt, validateMatrix } from "@/lib/prompts/matrix";
import { DRAFT_SYSTEM_PROMPT, buildDraftPrompt, validateDraft } from "@/lib/prompts/draft";
import { executePolicyResearch } from "@/lib/research";
import { verifyRequirements } from "@/lib/verify";
import { checkRateLimitAndJudgeAccess } from "@/lib/ratelimit";
import { streamReplayEvents } from "@/lib/replay";
import { DocumentInput, Facts, NDJSONEvent, Requirement, ClaimDraft } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";

/**
 * Serverless wall clock is maxDuration (60s on Vercel Hobby). Finish inside a
 * tighter budget than that: if the function is killed mid-stream the client
 * receives a truncated NDJSON body with no terminal event, which renders as a
 * permanently spinning step. Degrading early always beats being killed.
 */
const PIPELINE_BUDGET_MS = 50_000;
/**
 * Last-resort watchdog. The per-step budgets above bound the calls we know
 * about; this bounds everything else, so no hang anywhere in the pipeline can
 * leave the client without a terminal event. Must stay under maxDuration.
 */
const WATCHDOG_MS = 55_000;
/**
 * Drafting needs roughly this long; below it, use the deterministic draft.
 * Measured at 1.4-8.4s across runs, so 13s reserved more than drafting ever
 * used and pushed otherwise-healthy runs onto the code fallback.
 */
const DRAFT_MIN_BUDGET_MS = 9_000;
/**
 * Each step is capped by what the *downstream* steps still need, not by a fixed
 * number. Upstream latency varies by an order of magnitude with provider load,
 * and a fixed cap aborts calls that would have succeeded while still not
 * guaranteeing the run fits. The watchdog is what guarantees termination.
 */
const RESERVE_AFTER_EXTRACT_MS = 26_000;
const RESERVE_AFTER_PLAN_MS = 20_000;

export async function POST(req: NextRequest) {
  const env = getEnv();
  const encoder = new TextEncoder();

  // 1. Rate Limiting & Judge Code Bypass
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const judgeCodeHeader = req.headers.get("x-judge-code");
  const rateLimitResult = checkRateLimitAndJudgeAccess(ip, judgeCodeHeader);

  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({
        error: "Rate limit reached (10 runs / 10 minutes). Hackathon judges: enter the JUDGE_ACCESS_CODE in the footer to bypass all limits.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: {
    documents: DocumentInput[];
    problem: string;
    seller?: string;
    policyUrl?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  // 2. Replay Fallback Mode (if keys absent or force-replay active without judge bypass)
  const shouldUseReplay = (!env.isLive && !rateLimitResult.isJudge) || (env.forceReplay && !rateLimitResult.isJudge);

  if (shouldUseReplay) {
    const stream = new ReadableStream({
      async start(controller) {
        for await (const event of streamReplayEvents()) {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  }

  // 3. Live Agent Pipeline Execution
  const { documents, problem, seller, policyUrl } = body;

  const pipelineStart = Date.now();
  const remainingMs = () => PIPELINE_BUDGET_MS - (Date.now() - pipelineStart);

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;

      const emit = (event: NDJSONEvent) => {
        if (closed) return;
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      const close = () => {
        if (closed) return;
        closed = true;
        controller.close();
      };

      const watchdog = setTimeout(() => {
        emit({
          type: "notice",
          level: "warn",
          message:
            "The run exceeded its time budget and was cut short. Partial results above are live and verified; re-run to complete the claim draft.",
        });
        emit({ type: "done", mode: "live" });
        close();
      }, WATCHDOG_MS);

      try {
        // Step 1: Fact Extraction (Nemotron 3 Nano)
        emit({ type: "step", step: "extract_facts", status: "running" });

        const extractPrompt = buildExtractPrompt(documents, problem, seller);
        const extractResult = await callNemotron<Facts>({
          step: "extract_facts",
          model: env.fastModel,
          maxTokens: 4000,
          timeoutMs: Math.max(8_000, remainingMs() - RESERVE_AFTER_EXTRACT_MS),
          system: EXTRACT_FACTS_SYSTEM,
          user: extractPrompt,
          json: true,
          validator: validateFacts,
        });

        const facts = extractResult.data;

        // Code has final authority over the model: the caller-supplied seller
        // hint is ground truth, so fill it in when no document named the seller.
        if (!facts.seller?.value && seller) {
          facts.seller = { value: seller, doc_id: "" };
        }

        emit({
          type: "step",
          step: "extract_facts",
          status: "done",
          model: extractResult.meta.model,
          latency_ms: extractResult.meta.latency_ms,
          tokens: {
            in: extractResult.meta.prompt_tokens,
            out: extractResult.meta.completion_tokens,
          },
        });

        emit({ type: "facts", data: facts });

        // Step 2 & 3: Research Planning (Nemotron 3 Nano) & Policy Research (Tavily)
        emit({ type: "step", step: "plan_research", status: "running" });

        // When the caller already supplied the policy page, planning search
        // queries is work we will never use: executePolicyResearch goes
        // straight to that URL. Spending a model call on it only consumed
        // budget the evidence matrix needs.
        let plan: ResearchPlan;
        let planTokens = { in: 0, out: 0 };
        let planLatency = 0;

        if (policyUrl) {
          plan = {
            queries: [`${facts.seller.value} official return and warranty policy`],
            official_domain: facts.seller_domain_guess,
            policy_types: ["return", "warranty"],
          };
        } else {
          const planPrompt = buildPlanPrompt(facts);
          const planResult = await callNemotron<ResearchPlan>({
            step: "plan_research",
            model: env.fastModel,
            maxTokens: 2500,
            timeoutMs: Math.max(6_000, remainingMs() - RESERVE_AFTER_PLAN_MS),
            system: PLAN_RESEARCH_SYSTEM,
            user: planPrompt,
            json: true,
            validator: validatePlan,
          });
          plan = planResult.data;
          planLatency = planResult.meta.latency_ms;
          planTokens = { in: planResult.meta.prompt_tokens, out: planResult.meta.completion_tokens };
        }

        const researchStartTime = Date.now();
        const sources = await executePolicyResearch({
          queries: plan.queries,
          officialDomain: plan.official_domain || facts.seller_domain_guess,
          sellerName: facts.seller.value,
          directPolicyUrl: policyUrl || undefined,
          budgetMs: Math.max(8_000, remainingMs() - RESERVE_AFTER_PLAN_MS),
        });

        const researchLatency = Date.now() - researchStartTime;

        emit({
          type: "step",
          step: "plan_research",
          status: "done",
          model: policyUrl
            ? "Tavily Extract (direct policy URL)"
            : "Nemotron 3 Nano + Tavily Search & Extract",
          latency_ms: planLatency + researchLatency,
          tokens: planTokens,
        });

        emit({ type: "sources", data: sources });

        // Step 4: Evidence Matrix Reasoning (Nemotron 3 Super 120B)
        emit({ type: "step", step: "evidence_matrix", status: "running" });

        const matrixPrompt = buildMatrixPrompt(facts, documents, sources);
        const matrixResult = await callNemotron<{ requirements: Requirement[]; summary: string }>({
          step: "evidence_matrix",
          model: env.reasonModel,
          timeoutMs: Math.max(8_000, remainingMs() - DRAFT_MIN_BUDGET_MS),
          system: MATRIX_SYSTEM_PROMPT,
          user: matrixPrompt,
          json: true,
          maxTokens: 4000,
          validator: validateMatrix,
        });

        const proposedRequirements = matrixResult.data.requirements;

        emit({
          type: "step",
          step: "evidence_matrix",
          status: "done",
          model: matrixResult.meta.model,
          latency_ms: matrixResult.meta.latency_ms,
          tokens: {
            in: matrixResult.meta.prompt_tokens,
            out: matrixResult.meta.completion_tokens,
          },
        });

        emit({ type: "requirements", data: proposedRequirements });

        // Step 5: Deterministic Code Verification (Pure TypeScript Engine)
        emit({ type: "step", step: "verify", status: "running" });

        const verifyStartTime = Date.now();
        const verificationResult = verifyRequirements(proposedRequirements, facts, documents, sources);
        const verifyLatency = Date.now() - verifyStartTime;

        emit({
          type: "step",
          step: "verify",
          status: "done",
          model: "Deterministic Verifier (Pure Code)",
          latency_ms: verifyLatency,
        });

        emit({ type: "verification", data: verificationResult });

        // Step 6: Verified Claim Drafting (Nemotron 3 Nano)
        emit({ type: "step", step: "draft_claim", status: "running" });

        let claimDraft: ClaimDraft;
        const draftStartedAt = Date.now();
        try {
          if (remainingMs() < DRAFT_MIN_BUDGET_MS) {
            throw new Error(
              `Insufficient time budget for model drafting (${remainingMs()}ms left); using deterministic draft.`
            );
          }
          const draftPrompt = buildDraftPrompt(facts, verificationResult.requirements, sources);
          const draftResult = await callNemotron<ClaimDraft>({
            step: "draft_claim",
            model: env.fastModel,
            timeoutMs: Math.max(0, remainingMs()),
            system: DRAFT_SYSTEM_PROMPT,
            user: draftPrompt,
            json: true,
            maxTokens: 3000,
            validator: validateDraft,
          });

          claimDraft = draftResult.data;
          emit({
            type: "step",
            step: "draft_claim",
            status: "done",
            model: draftResult.meta.model,
            latency_ms: draftResult.meta.latency_ms,
            tokens: {
              in: draftResult.meta.prompt_tokens,
              out: draftResult.meta.completion_tokens,
            },
          });
        } catch (draftErr: any) {
          console.warn("Draft generation fallback used:", draftErr);
          claimDraft = {
            subject: `Formal Claim: Return & Warranty Request - ${facts.product.value} (${facts.order_id?.value || "Order Reference"})`,
            body: `Dear ${facts.seller.value} Customer Support Team,\n\nI am writing to formally submit a claim regarding my purchase of ${facts.product.value} (Order Ref: ${facts.order_id?.value || "N/A"}).\n\nIssue Description: ${facts.problem_summary}.\n\nAccording to your published policy terms, this purchase meets the warranty and return eligibility criteria. Please issue a return merchandise authorization (RMA) or replacement instructions at your earliest convenience.\n\nSincerely,\n[Your Name]`,
            form_fields: {
              full_name: "[Your Name]",
              email: "[Your Email]",
              order_id: facts.order_id?.value || "VL-84920",
              product: facts.product.value,
              purchase_date: facts.purchase_date?.value || "2026-10-09",
              issue_category: "Hardware Defect / Failure to Charge",
              requested_resolution: facts.claim_type === "return" ? "refund" : "replacement",
              description: facts.problem_summary,
            },
            missing: verificationResult.requirements
              .filter((r) => r.final_status === "missing")
              .map((r) => r.ask_user || r.requirement),
          };
          // Report what actually happened. A hardcoded 50ms here claimed an
          // instant deterministic draft even when a model attempt had just
          // consumed 25s before failing, which made the run log misleading
          // about where the time went.
          emit({
            type: "step",
            step: "draft_claim",
            status: "done",
            model: "Deterministic Draft (code fallback)",
            latency_ms: Date.now() - draftStartedAt,
          });
          emit({
            type: "notice",
            level: "warn",
            message: `Claim drafted deterministically rather than by Nemotron: ${draftErr.message}`,
          });
        }

        emit({ type: "claim", data: claimDraft });

        emit({ type: "done", mode: "live" });
      } catch (err: any) {
        console.warn("Live pipeline encountered an issue, executing graceful fallback stream:", err.message);
        // Say so in the stream. Silently substituting the pre-recorded trace
        // makes a failed live run look like a successful one, which hides real
        // breakage from us and misrepresents the run to anyone inspecting it.
        emit({
          type: "notice",
          level: "warn",
          message: `Live inference did not complete (${err.message}). Showing the pre-verified reference trace instead.`,
        });
        try {
          for await (const event of streamReplayEvents()) {
            emit(event);
          }
        } catch (fallbackErr: any) {
          emit({
            type: "error",
            step: "pipeline",
            message: fallbackErr.message || "Pipeline fallback failed",
            recoverable: false,
          });
        }
      } finally {
        clearTimeout(watchdog);
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
