"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css";

interface HeaderProps {
  isLive: boolean;
  onOpenRunLog: () => void;
  runLogCount: number;
  onOpenHowItWorks?: () => void;
  activeView?: "landing" | "dashboard";
  onSwitchView?: (view: "landing" | "dashboard") => void;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
}

export function Header({
  isLive,
  onOpenRunLog,
  runLogCount,
  onOpenHowItWorks,
  activeView = "landing",
  onSwitchView,
  isDemoMode = false,
  onToggleDemoMode,
}: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("rightful_theme") as "light" | "dark" | null;
    const initial = savedTheme || "light";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("rightful_theme", next);
  };

  return (
    <header className={styles.header}>
      <div className={styles.brandGroup}>
        <div
          className={styles.logoMark}
          onClick={() => onSwitchView && onSwitchView("landing")}
          title="Rightful — Consumer Claims Agent"
        >
          <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="currentColor" aria-hidden="true">
            <path d="M5 5h13v13H5zM22 22h13v13H22z" />
            <path d="M22 5a13 13 0 0 1 13 13H22zM18 35A13 13 0 0 1 5 22h13z" />
          </svg>
          <div className={styles.brandTextGroup}>
            <span className={styles.brandTitle}>RIGHTFUL</span>
            <span className={styles.brandSubtitle}>Evidence Agent</span>
          </div>
        </div>

        {/* NAVIGATION PILLS */}
        {onSwitchView && (
          <nav className={styles.navPills} aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => onSwitchView("landing")}
              className={`${styles.pillLink} ${activeView === "landing" ? styles.pillLinkActive : ""}`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => onSwitchView("dashboard")}
              className={`${styles.pillLink} ${activeView === "dashboard" ? styles.pillLinkActive : ""}`}
            >
              Claims Engine
            </button>
            <Link href="/portal" className={styles.pillLink}>
              Portal Sandbox
            </Link>
            <Link href="/pack" className={styles.pillLink}>
              Claim Pack
            </Link>
          </nav>
        )}
      </div>

      <div className={styles.controlsGroup}>
        {/* DEMO / REPLAY MODE TOGGLE */}
        {onToggleDemoMode && (
          <button
            type="button"
            onClick={onToggleDemoMode}
            className={`${styles.demoToggle} ${isDemoMode ? styles.demoActive : styles.demoLive}`}
            title="Toggle between Live Nebius/Tavily API and Offline Safe Benchmark Replay"
          >
            <span className={styles.demoDot}></span>
            {isDemoMode ? "DEMO REPLAY (SAFE)" : "LIVE API"}
          </button>
        )}

        <div className={`${styles.badge} ${isLive && !isDemoMode ? styles.badgeLive : styles.badgeReplay}`}>
          <span className={styles.statusDot}></span>
          {isLive && !isDemoMode ? "ONLINE" : "REPLAY"}
        </div>

        {onOpenHowItWorks && (
          <button
            type="button"
            onClick={onOpenHowItWorks}
            className={styles.infoButton}
            aria-label="How Rightful works"
          >
            How It Works
          </button>
        )}

        <button
          type="button"
          onClick={onOpenRunLog}
          className={styles.logButton}
          aria-label="Open model run log drawer"
        >
          Run Log ({runLogCount})
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? "🌙 Dark" : "☀️ Light"}
        </button>
      </div>
    </header>
  );
}

