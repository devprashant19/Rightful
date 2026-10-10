"use client";

import { RunLogEntry } from "@/lib/types";
import styles from "./RunLogDrawer.module.css";

interface RunLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entries: RunLogEntry[];
}

export function RunLogDrawer({ isOpen, onClose, entries }: RunLogDrawerProps) {
  if (!isOpen) return null;

  const totalLatency = entries.reduce((acc, curr) => acc + curr.latency_ms, 0);
  const totalPromptTokens = entries.reduce((acc, curr) => acc + (curr.tokens?.prompt_tokens || 0), 0);
  const totalCompletionTokens = entries.reduce((acc, curr) => acc + (curr.tokens?.completion_tokens || 0), 0);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <aside className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <div>
            <h3>Execution Telemetry & Routing Log</h3>
            <span className={styles.drawerSub}>Proves NVIDIA Nemotron multi-model routing to judges</span>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close run log">
            ✕
          </button>
        </div>

        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Pipeline Latency</span>
            <span className={styles.summaryValue}>{(totalLatency / 1000).toFixed(2)}s</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Input Tokens</span>
            <span className={styles.summaryValue}>{totalPromptTokens.toLocaleString()}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Total Output Tokens</span>
            <span className={styles.summaryValue}>{totalCompletionTokens.toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.logTable}>
            <thead>
              <tr>
                <th>Step</th>
                <th>Model / Service</th>
                <th>Latency</th>
                <th>Tokens (In/Out)</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={idx}>
                  <td>
                    <span className={styles.stepBadge}>{entry.step}</span>
                  </td>
                  <td>
                    <span className={styles.modelName}>{entry.model}</span>
                  </td>
                  <td>
                    <span className={styles.mono}>{(entry.latency_ms / 1000).toFixed(2)}s</span>
                  </td>
                  <td>
                    <span className={styles.mono}>
                      {entry.tokens
                        ? `${entry.tokens.prompt_tokens} / ${entry.tokens.completion_tokens}`
                        : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.footerNote}>
          Nebius Token Factory inference • All calls server-side • Zero tokens logged to external storage
        </div>
      </aside>
    </div>
  );
}

