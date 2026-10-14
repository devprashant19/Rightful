"use client";

import { useState } from "react";
import { ClaimDraft } from "@/lib/types";
import styles from "./ClaimDraftCard.module.css";

interface ClaimDraftCardProps {
  draft: ClaimDraft;
}

export function ClaimDraftCard({ draft }: ClaimDraftCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const mailtoHref = `mailto:?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`;

  return (
    <section className={styles.draftCard} aria-label="Generated claim letter">
      <div className={styles.header}>
        <div>
          <h3>Claim Draft</h3>
          <span className={styles.subtext}>Cites only verified policy lines</span>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={handleCopy} className={styles.copyBtn}>
            {copied ? "✓ Copied" : "📋 Copy email"}
          </button>
          <a href={mailtoHref} className={styles.mailtoBtn}>
            ✉️ Open in email app
          </a>
        </div>
      </div>

      <div className={styles.emailPreview}>
        <div className={styles.subjectRow}>
          <span className={styles.label}>Subject:</span>
          <span className={styles.subjectText}>{draft.subject}</span>
        </div>

        <pre className={styles.emailBody}>{draft.body}</pre>
      </div>

      {draft.missing && draft.missing.length > 0 && (
        <div className={styles.missingChecklist}>
          <h4>What You Still Need</h4>
          <ul>
            {draft.missing.map((item, idx) => (
              <li key={idx}>⚠️ {item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

