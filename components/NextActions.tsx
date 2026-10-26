"use client";

import Link from "next/link";
import styles from "./NextActions.module.css";

interface NextActionsProps {
  caseId: string;
}

export function NextActions({ caseId }: NextActionsProps) {
  return (
    <section className={styles.actionCard} aria-label="Next Actions">
      <div className={styles.actionHeader}>
        <h3>Next Actions</h3>
        <span className={styles.subtext}>Take action or export case evidence</span>
      </div>

      <div className={styles.buttonGroup}>
        <Link
          href={`/portal?case=${caseId}`}
          id="open-sandbox-btn"
          className={styles.primaryActionBtn}
        >
          🚀 Prepare Support Form (Sandbox)
        </Link>

        <Link
          href={`/pack?case=${caseId}`}
          className={styles.secondaryActionBtn}
        >
          📄 Download Claim Pack (Print/PDF)
        </Link>
      </div>

      <p className={styles.disclaimer}>
        * Safe action guarantee: Rightful fills sandbox portals for approval only. Nothing is submitted without explicit human review.
      </p>
    </section>
  );
}

