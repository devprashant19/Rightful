"use client";

import { useState, useEffect } from "react";
import styles from "./Footer.module.css";

export function Footer() {
  const [judgeCode, setJudgeCode] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem("rightful_judge_code");
    if (saved) {
      setJudgeCode(saved);
      setIsSaved(true);
    }
  }, []);

  const handleSaveCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (judgeCode.trim()) {
      sessionStorage.setItem("rightful_judge_code", judgeCode.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.attribution}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <svg viewBox="0 0 40 40" fill="currentColor" style={{ width: "20px", height: "20px", color: "var(--ink-primary)" }}>
                <path d="M5 5h13v13H5zM22 22h13v13H22z" />
                <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
              </svg>
              <strong>Rightful</strong> — Evidence-backed consumer claims agent.
            </div>
            <div className={styles.stackNote}>
              Built with NVIDIA Nemotron on Nebius Token Factory and Tavily Search & Extract.
            </div>
          </div>

          <div className={styles.links}>
            <a
              href="https://github.com/devprashant19/Rightful"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              GitHub Repository ↗
            </a>
            <span className={styles.separator}>•</span>
            <span className={styles.license}>MIT License</span>
          </div>
        </div>

        <div className={styles.judgeRow}>
          <form onSubmit={handleSaveCode} className={styles.judgeForm}>
            <label htmlFor="judge-code-input" className={styles.judgeLabel}>
              Judge Access Code:
            </label>
            <input
              id="judge-code-input"
              type="password"
              placeholder="Enter code to bypass rate limits"
              value={judgeCode}
              onChange={(e) => setJudgeCode(e.target.value)}
              className={styles.judgeInput}
            />
            <button type="submit" className={styles.judgeBtn}>
              {isSaved ? "✓ Active" : "Apply"}
            </button>
          </form>

          <span className={styles.judgeHelp}>
            Hackathon judges: code bypasses all IP rate limits and force-replay modes.
          </span>
        </div>
      </div>
    </footer>
  );
}

