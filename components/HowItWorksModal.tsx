"use client";

import styles from "./HowItWorksModal.module.css";

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 id="modal-title">How Rightful Works</h3>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.leadText}>
            Rightful turns an order receipt and a one-line complaint into an evidence-backed consumer claim in seconds.
          </p>

          <div className={styles.stepGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNum}>1</div>
              <h4>Fast Fact Extraction</h4>
              <p>NVIDIA Nemotron 3 Nano reads your receipt or email and extracts facts (dates, order ID, product) tied to document citations (D1, D2).</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNum}>2</div>
              <h4>Live Policy Research</h4>
              <p>Tavily Search & Extract finds the seller’s official return/warranty policy on the live web, ranking official domains first.</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNum}>3</div>
              <h4>Proof Ledger & Verifier</h4>
              <p>Nemotron Super maps requirements, while deterministic code verifies every quote verbatim and recalculates date math.</p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNum}>4</div>
              <h4>Human-Approved Action</h4>
              <p>Rightful prepares the claim email and fills our sandbox support portal field-by-field, stopping for your explicit sign-off.</p>
            </div>
          </div>

          <div className={styles.diagramBox}>
            <div className={styles.diagramTitle}>SYSTEM DATAFLOW</div>
            <div className={styles.flowChain}>
              <span className={styles.flowNode}>Your Evidence</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowNode}>Nemotron Nano</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowNode}>Tavily Search</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowNode}>Nemotron Super</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowNodeHighlight}>Code Verifier</span>
              <span className={styles.flowArrow}>→</span>
              <span className={styles.flowNode}>Claim Pack</span>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" onClick={onClose} className={styles.gotItBtn}>
            Got it, take me back
          </button>
        </div>
      </div>
    </div>
  );
}

