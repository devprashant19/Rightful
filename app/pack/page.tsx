"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { VerificationResult, Facts, ClaimDraft } from "@/lib/types";
import { MOCK_FACTS, MOCK_VERIFICATION, MOCK_DRAFT } from "@/lib/mock";
import styles from "./pack.module.css";

function ClaimPackContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("case") || "default";

  const [facts, setFacts] = useState<Facts>(MOCK_FACTS);
  const [verification, setVerification] = useState<VerificationResult>(MOCK_VERIFICATION);
  const [draft, setDraft] = useState<ClaimDraft>(MOCK_DRAFT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(`rightful_case_${caseId}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.facts) setFacts(parsed.facts);
        if (parsed.verification) setVerification(parsed.verification);
        if (parsed.claim) setDraft(parsed.claim);
      } catch (e) {
        console.error("Could not parse case data", e);
      }
    }
    setLoaded(true);
  }, [caseId]);

  if (!loaded) {
    return <div className={styles.loading}>Preparing print-ready claim pack...</div>;
  }

  return (
    <div className={styles.packContainer}>
      <div className={styles.noPrintActions}>
        <Link href="/" className={styles.backLink}>
          ← Back to Dashboard
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className={styles.printBtn}
          aria-label="Print or Save as PDF"
        >
          🖨️ Print or Save as PDF
        </button>
      </div>

      <header className={styles.packHeader}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <svg viewBox="0 0 40 40" fill="currentColor" style={{ width: "26px", height: "26px", color: "var(--ink-primary)" }}>
              <path d="M5 5h13v13H5zM22 22h13v13H22z" />
              <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
            </svg>
            <div className={styles.wordmark}>RIGHTFUL EVIDENCE DOSSIER</div>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--ink-muted)", marginTop: "2px", display: "block" }}>
            Consumer Claims Verification & Proof Summary
          </span>
        </div>
        <div className={styles.caseBadge}>Ref: {facts.order_id?.value || "VL-84920"}</div>
      </header>

      <section className={styles.summaryGrid}>
        <div>
          <strong>Seller:</strong> {facts.seller.value}
        </div>
        <div>
          <strong>Product:</strong> {facts.product.value}
        </div>
        <div>
          <strong>Purchase Date:</strong> {facts.purchase_date?.value || "Not stated"}
        </div>
        <div>
          <strong>Claim Type:</strong> {facts.claim_type.toUpperCase()}
        </div>
        <div>
          <strong>Claim Strength:</strong> {verification.strength_score}/100 ({verification.verdict})
        </div>
        <div>
          <strong>Return Deadline:</strong> {verification.deadline?.return_deadline || "N/A"}
        </div>
      </section>

      <section className={styles.ledgerSection}>
        <h3>Verified Evidence Matrix (Proof Ledger)</h3>
        <table className={styles.packTable}>
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Requirement</th>
              <th style={{ width: "20%" }}>Status</th>
              <th style={{ width: "45%" }}>Verified Policy Quote & Citation</th>
            </tr>
          </thead>
          <tbody>
            {verification.requirements.map((r) => (
              <tr key={r.id}>
                <td>
                  <strong>{r.requirement}</strong>
                  <br />
                  <small style={{ color: "var(--ink-muted)" }}>{r.evidence}</small>
                </td>
                <td>
                  <span className={`${styles.statusStamp} ${styles[r.final_status]}`}>
                    {r.final_status.replace("_", " ")}
                  </span>
                </td>
                <td>
                  {r.policy_quote ? (
                    <span className={styles.quoteMono}>"{r.policy_quote}"</span>
                  ) : (
                    <span style={{ color: "var(--ink-faint)", fontStyle: "italic" }}>
                      No quote required
                    </span>
                  )}
                  {r.source_ids.length > 0 && (
                    <div style={{ marginTop: 4, fontSize: "0.72rem" }}>
                      Source: {r.source_ids.join(", ")}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.draftSection}>
        <h3>Formal Claim Letter</h3>
        <div className={styles.letterBody}>
          <p>
            <strong>Subject:</strong> {draft.subject}
          </p>
          <pre>{draft.body}</pre>
        </div>
      </section>

      <footer className={styles.packFooter}>
        Prepared by Rightful • Verified with NVIDIA Nemotron on Nebius Token Factory • Retain for your records.
      </footer>
    </div>
  );
}

export default function ClaimPackPage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
      <ClaimPackContent />
    </Suspense>
  );
}

