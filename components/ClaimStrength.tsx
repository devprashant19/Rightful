"use client";

import { useEffect, useState } from "react";
import styles from "./ClaimStrength.module.css";

interface ClaimStrengthProps {
  score: number;
  verdict: string;
}

export function ClaimStrength({ score, verdict }: ClaimStrengthProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const duration = 750;
    const startTime = performance.now();
    const initialScore = displayScore;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(initialScore + (score - initialScore) * ease));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [score]);

  const getColorClass = () => {
    if (score >= 75) return styles.scoreHigh;
    if (score >= 50) return styles.scoreMid;
    return styles.scoreLow;
  };

  return (
    <section className={styles.strengthCard} aria-label="Claim Strength Assessment">
      <div className={styles.meterRow}>
        <div className={styles.scoreCircle}>
          <span className={`${styles.scoreNumber} ${getColorClass()}`}>{displayScore}</span>
          <span className={styles.scoreMax}>/100</span>
        </div>

        <div className={styles.verdictInfo}>
          <div className={styles.verdictTitle}>Claim Strength Evaluation</div>
          <div className={`${styles.verdictText} ${getColorClass()}`}>{verdict}</div>
          <p className={styles.verdictDesc}>
            {score >= 75
              ? "All critical eligibility, purchase, and window requirements are formally grounded in the seller's policy."
              : score >= 50
              ? "Valid foundation established, but addressing the outstanding missing or ambiguous rows is recommended."
              : "Substantial evidence gaps exist. Supply the missing documentation before formally approaching the merchant."}
          </p>
        </div>
      </div>

      <div className={styles.progressBarBg}>
        <div
          className={`${styles.progressBarFill} ${getColorClass()}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </section>
  );
}

