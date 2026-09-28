"use client";

import { PolicySource } from "@/lib/types";
import styles from "./PolicySources.module.css";

interface PolicySourcesProps {
  sources: PolicySource[];
  isLive: boolean;
  activeHighlightId?: string | null;
}

export function PolicySources({ sources, isLive, activeHighlightId }: PolicySourcesProps) {
  if (sources.length === 0) return null;

  return (
    <section className={styles.sourcesSection} aria-label="Retrieved official policies">
      <div className={styles.sectionHeader}>
        <h3>Retrieved Policy Sources</h3>
        <span className={styles.sourceCount}>{sources.length} sources analyzed</span>
      </div>

      <div className={styles.sourceList}>
        {sources.map((s) => (
          <article
            key={s.id}
            id={`source-${s.id}`}
            className={`${styles.sourceCard} ${activeHighlightId === s.id ? styles.highlighted : ""}`}
          >
            <div className={styles.sourceTop}>
              <span className={styles.sourceChip}>{s.id}</span>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceTitle}
              >
                {s.title || s.domain} ↗
              </a>
            </div>

            <div className={styles.badgeRow}>
              {s.is_official ? (
                <span className={styles.officialBadge}>Official Merchant Domain</span>
              ) : (
                <span className={styles.thirdPartyBadge}>Third-Party Source</span>
              )}

              <span className={styles.liveBadge}>
                {isLive ? "Retrieved Live (Tavily)" : "Cached Benchmark (Replay)"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

