"use client";

import { useState } from "react";
import { getEscalationLadder } from "@/lib/escalation";
import styles from "./EscalationLadder.module.css";

interface EscalationLadderProps {
  claimType: string;
}

export function EscalationLadder({ claimType }: EscalationLadderProps) {
  const [isIndia, setIsIndia] = useState(false);
  const ladder = getEscalationLadder(claimType, isIndia);

  return (
    <section className={styles.ladderSection} aria-label="Claim Escalation Ladder">
      <div className={styles.sectionHeader}>
        <h3>
          <span>⚖️</span> Legal & Redressal Escalation Ladder
        </h3>

        <div className={styles.toggleGroup} role="group" aria-label="Jurisdiction Selector">
          <button
            type="button"
            className={`${styles.toggleBtn} ${!isIndia ? styles.active : ""}`}
            onClick={() => setIsIndia(false)}
            aria-pressed={!isIndia}
          >
            Global / US / UK
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${isIndia ? styles.active : ""}`}
            onClick={() => setIsIndia(true)}
            aria-pressed={isIndia}
          >
            🇮🇳 India (CPA 2019 / NCH)
          </button>
        </div>
      </div>

      <p className={styles.subtext}>
        If the merchant fails to respond before your deadline or unlawfully rejects the claim, follow these sequential escalation tiers:
      </p>

      <div className={styles.tierGrid}>
        {ladder.map((opt) => (
          <article key={opt.tier} className={styles.tierCard}>
            <div className={styles.tierIndicator}>
              <div className={styles.tierNumber}>{opt.tier}</div>
              <span className={styles.tierLabel}>Tier {opt.tier}</span>
            </div>

            <div className={styles.tierBody}>
              <div className={styles.tierTop}>
                <h4 className={styles.tierChannel}>{opt.channel}</h4>
                <span className={styles.tierBadge}>{opt.badge}</span>
              </div>

              <div className={styles.tierAuthority}>{opt.authority}</div>
              <p className={styles.tierGuidance}>{opt.guidance}</p>

              {opt.formalCitation && (
                <div>
                  <span className={styles.citationBox}>📜 {opt.formalCitation}</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      <p className={styles.disclaimerFootnote}>
        * Tip: Always cite your verified Proof Ledger and include your generated Rightful Claim Pack PDF as documentary evidence in any Tier 2–4 dispute.
      </p>
    </section>
  );
}

