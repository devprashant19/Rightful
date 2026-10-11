"use client";

import styles from "./StepTracker.module.css";

export interface StepStatus {
  id: string;
  label: string;
  status: "pending" | "running" | "done" | "failed";
  model?: string;
  latency_ms?: number;
}

interface StepTrackerProps {
  steps: StepStatus[];
}

export function StepTracker({ steps }: StepTrackerProps) {
  const completedCount = steps.filter((s) => s.status === "done").length;
  const runningIndex = steps.findIndex((s) => s.status === "running");
  const progressRatio = Math.min(
    1,
    (completedCount + (runningIndex !== -1 ? 0.5 : 0)) / Math.max(1, steps.length)
  );

  return (
    <nav className={styles.trackerContainer} aria-label="Investigation progress" aria-live="polite">
      <div className={styles.progressTrackBg}>
        <div
          className={styles.progressTrackFill}
          style={{ width: `${progressRatio * 100}%` }}
        />
      </div>

      <ol className={styles.stepList}>
        {steps.map((step, idx) => (
          <li
            key={step.id}
            className={`${styles.stepItem} ${styles[step.status]}`}
          >
            <div className={styles.stepNumber}>
              {step.status === "done" ? (
                <span className={styles.checkIcon}>✓</span>
              ) : (
                idx + 1
              )}
            </div>
            <div className={styles.stepInfo}>
              <span className={styles.stepLabel}>{step.label}</span>
              {step.status === "done" && (
                <span className={styles.stepMeta}>
                  {step.model ? step.model.split("/").pop() : "Complete"}
                  {step.latency_ms ? ` • ${(step.latency_ms / 1000).toFixed(1)}s` : ""}
                </span>
              )}
              {step.status === "running" && (
                <span className={styles.stepRunningText}>Analyzing...</span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

