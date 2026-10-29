"use client";

import { useState } from "react";
import { VerifiedRequirement } from "@/lib/types";
import styles from "./ProofLedger.module.css";

interface ProofLedgerProps {
  requirements: VerifiedRequirement[];
  onHighlightSource: (sourceId: string) => void;
  onHighlightDoc: (docId: string) => void;
  onAddEvidenceForMissing?: (reqId: string, askUser: string) => void;
  flippedRowIds?: string[];
}

export function ProofLedger({
  requirements,
  onHighlightSource,
  onHighlightDoc,
  onAddEvidenceForMissing,
  flippedRowIds = [],
}: ProofLedgerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <section className={styles.ledgerSection} aria-label="Evidence Verification Ledger">
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.heroTitle}>Proof Ledger</h2>
          <p className={styles.heroSubtitle}>
            Requirements tested against policy. Verified by code; never trusted from model.
          </p>
        </div>
      </div>

      <div className={styles.ledgerList}>
        {requirements.map((req) => {
          const isExpanded = expandedId === req.id;
          const statusChangedByVerifier = req.model_status && req.model_status !== req.final_status;

          return (
            <article
              key={req.id}
              className={`${styles.row} ${isExpanded ? styles.rowExpanded : ""}`}
              tabIndex={0}
              role="button"
              aria-expanded={isExpanded}
              onClick={() => toggleExpand(req.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleExpand(req.id);
                }
              }}
            >
              <div className={styles.rowMain}>
                <div className={styles.rowContent}>
                  <div className={styles.reqHeader}>
                    <h4 className={styles.requirementName}>{req.requirement}</h4>
                  </div>
                  <p className={styles.evidenceLine}>{req.evidence}</p>

                  <div className={styles.chipRow}>
                    {req.doc_ids.map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={styles.chipDoc}
                        onClick={(e) => {
                          e.stopPropagation();
                          onHighlightDoc(id);
                        }}
                        title={`View Document ${id}`}
                      >
                        {id}
                      </button>
                    ))}

                    {req.source_ids.map((id) => (
                      <button
                        key={id}
                        type="button"
                        className={styles.chipSource}
                        onClick={(e) => {
                          e.stopPropagation();
                          onHighlightSource(id);
                        }}
                        title={`View Policy Source ${id}`}
                      >
                        {id}
                      </button>
                    ))}

                    {statusChangedByVerifier && (
                      <span className={styles.adjustedTag}>
                        Adjusted by verifier (was {req.model_status})
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.stampColumn}>
                  <div
                    className={`rubber-stamp landing ${req.final_status} ${
                      flippedRowIds.includes(req.id) ? "stamp-flip" : ""
                    }`}
                  >
                    {req.final_status.replace("_", " ")}
                  </div>

                  <div className={styles.quoteStatus}>
                    {req.quote_verified ? (
                      <span className={styles.quoteGood}>✓ Quote verified</span>
                    ) : (
                      <span className={styles.quoteMissing}>⚠ Quote not found</span>
                    )}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.drilldown} onClick={(e) => e.stopPropagation()}>
                  {req.policy_quote && (
                    <div className={styles.quoteBox}>
                      <span className={styles.quoteLabel}>VERBATIM POLICY QUOTE:</span>
                      <blockquote className={styles.quoteText}>
                        &ldquo;{req.policy_quote}&rdquo;
                      </blockquote>
                    </div>
                  )}

                  {req.verifier_notes.length > 0 && (
                    <div className={styles.notesBox}>
                      <span className={styles.notesLabel}>DETERMINISTIC VERIFIER AUDIT:</span>
                      <ul>
                        {req.verifier_notes.map((note, idx) => (
                          <li key={idx}>ℹ {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {req.ask_user && req.final_status === "missing" && onAddEvidenceForMissing && (
                    <div className={styles.coachNotice}>
                      <p>
                        <strong>Missing Proof Coach:</strong> {req.ask_user}
                      </p>
                      <button
                        type="button"
                        className={styles.addProofBtn}
                        onClick={() => onAddEvidenceForMissing(req.id, req.ask_user!)}
                      >
                        + Add evidence to resolve
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

