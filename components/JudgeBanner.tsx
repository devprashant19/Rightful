"use client";

import { useEffect, useState } from "react";
import styles from "./JudgeBanner.module.css";

const STORAGE_KEY = "rightful_judge_code";
const DISMISS_KEY = "rightful_judge_banner_dismissed";

/**
 * Surfaces the judge access code at the top of the page.
 *
 * The same input also lives in the footer, but a judge reviewing dozens of
 * submissions will not scroll to the bottom looking for one — and without the
 * code they hit the 10-runs-per-10-minutes limit and may conclude the app is
 * broken. This writes to the same sessionStorage key the footer uses, so
 * nothing downstream changes.
 */
export function JudgeBanner() {
  const [code, setCode] = useState("");
  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState(true); // hidden until hydrated

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      setCode(saved);
      setActive(true);
      setDismissed(false);
      return;
    }
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "true");
  }, []);

  const activate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    sessionStorage.setItem(STORAGE_KEY, trimmed);
    setActive(true);
  };

  const clear = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setCode("");
    setActive(false);
  };

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, "true");
    setDismissed(true);
  };

  if (dismissed) return null;

  if (active) {
    return (
      <div className={`${styles.banner} ${styles.active}`} role="status">
        <span className={styles.label}>
          <span className={styles.pip} aria-hidden="true" />
          <span className={styles.activeText}>Judge access active</span>
        </span>
        <span className={styles.hint}>
          Rate limits bypassed. Every run executes live against Nebius Token Factory and Tavily.
        </span>
        <button type="button" onClick={clear} className={styles.clear}>
          Clear
        </button>
      </div>
    );
  }

  return (
    <div className={styles.banner}>
      <span className={styles.label}>
        <span className={styles.pip} aria-hidden="true" />
        Hackathon judge?
      </span>
      <span className={styles.hint}>
        Enter your access code for unlimited live runs — no sign-in needed.
      </span>
      <form onSubmit={activate} className={styles.form}>
        <label htmlFor="judge-banner-input" className="sr-only">
          Judge access code
        </label>
        <input
          id="judge-banner-input"
          type="text"
          className={styles.input}
          placeholder="Judge access code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <button type="submit" className={styles.btn}>
          Activate
        </button>
      </form>
      <button
        type="button"
        onClick={dismiss}
        className={styles.dismiss}
        aria-label="Dismiss judge access banner"
      >
        ×
      </button>
    </div>
  );
}
