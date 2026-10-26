"use client";

import { useEffect, useState } from "react";
import styles from "./DocumentViewerModal.module.css";
import { DocumentInput } from "@/lib/types";

interface DocumentViewerModalProps {
  document: DocumentInput | null;
  onClose: () => void;
}

export function DocumentViewerModal({ document, onClose }: DocumentViewerModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (document) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [document, onClose]);

  if (!document) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(document.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-modal-title"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.titleGroup}>
            <span className={styles.docIdBadge}>{document.id}</span>
            <div>
              <h3 id="doc-modal-title" className={styles.docName}>
                {document.name}
              </h3>
              <span className={styles.docMeta}>
                Type: {document.type.toUpperCase()} • {document.content.length} characters
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Close document viewer"
          >
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.toolbar}>
            <span className={styles.sectionLabel}>RAW EVIDENCE DOCUMENT CONTENT:</span>
            <button
              type="button"
              onClick={handleCopy}
              className={styles.copyBtn}
              aria-label="Copy document text"
            >
              {copied ? "✓ Copied" : "Copy text"}
            </button>
          </div>

          <pre className={styles.docContent}>
            <code>{document.content}</code>
          </pre>
        </div>

        <div className={styles.modalFooter}>
          <span className={styles.footnote}>
            Provenance anchor: Nemotron Nano quotes are verified directly against this text.
          </span>
          <button type="button" onClick={onClose} className={styles.doneBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

