"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import styles from "./portal.module.css";

function PortalContent() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("case") || "default";

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    order_id: "",
    product: "",
    purchase_date: "",
    issue_category: "Hardware Defect / Failure to Charge",
    requested_resolution: "refund",
    description: "",
  });

  const [isTyping, setIsTyping] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isReviewed, setIsReviewed] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    // Load case data from localStorage
    const saved = localStorage.getItem(`rightful_draft_${caseId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.form_fields) {
          autofillFields(parsed.form_fields);
        }
      } catch (err) {
        console.error("Could not load case data", err);
      }
    } else {
      // Default fallback if no draft saved
      autofillFields({
        full_name: "[Your Name]",
        email: "[Your Email]",
        order_id: "DEMO-VL-89412",
        product: "AeroSound Pro Wireless Earbuds",
        purchase_date: "2026-10-09",
        issue_category: "Hardware Defect / Failure to Charge",
        requested_resolution: "replacement",
        description: "Right earbud stopped charging after 19 days of normal use. Per policy: 1-year limited warranty applies.",
      });
    }
  }, [caseId]);

  const autofillFields = async (targetFields: typeof formData) => {
    setIsTyping(true);
    const keys = Object.keys(targetFields) as (keyof typeof formData)[];

    for (const key of keys) {
      setActiveField(key);
      const fullValue = String(targetFields[key]);
      let currentVal = "";

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReduced) {
        setFormData((prev) => ({ ...prev, [key]: fullValue }));
      } else {
        for (let i = 0; i < fullValue.length; i++) {
          currentVal += fullValue[i];
          setFormData((prev) => ({ ...prev, [key]: currentVal }));
          await new Promise((r) => setTimeout(r, 10));
        }
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    setActiveField(null);
    setIsTyping(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReviewed) return;
    const refNum = `SANDBOX-VL-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedRef(refNum);
  };

  return (
    <main className={styles.portalContainer}>
      <div className={styles.sandboxBanner}>
        ⚠️ <strong>SANDBOX ENVIRONMENT</strong> — Fictional Support Portal (Voltline Electronics). No external network requests are made.
      </div>

      <header className={styles.portalHeader}>
        <div className={styles.brandBadge}>VOLTLINE ELECTRONICS</div>
        <h2>Customer Resolution & Warranty Portal</h2>
      </header>

      {submittedRef ? (
        <div className={styles.successCard}>
          <h3>Claim Filed Successfully (Sandbox Simulation)</h3>
          <p className={styles.refLine}>
            Reference Ticket: <code>{submittedRef}</code>
          </p>
          <p className={styles.refDesc}>
            This was a safe sandbox simulation. No real email, customer service ticket, or external transmission occurred.
          </p>
          <Link href="/" className={styles.returnButton}>
            ← Return to Rightful Dashboard
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.portalForm}>
          <div className={styles.formRow}>
            <label>Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              className={activeField === "full_name" ? styles.typingField : ""}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Order Reference #</label>
            <input
              type="text"
              value={formData.order_id}
              className={activeField === "order_id" ? styles.typingField : ""}
              onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Product</label>
            <input
              type="text"
              value={formData.product}
              className={activeField === "product" ? styles.typingField : ""}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              required
            />
          </div>

          <div className={styles.formRow}>
            <label>Requested Resolution</label>
            <select
              value={formData.requested_resolution}
              onChange={(e) => setFormData({ ...formData, requested_resolution: e.target.value as any })}
            >
              <option value="refund">Full Refund</option>
              <option value="replacement">Replacement Product</option>
              <option value="repair">Warranty Repair</option>
            </select>
          </div>

          <div className={styles.formRow}>
            <label>Detailed Problem Description</label>
            <textarea
              rows={4}
              value={formData.description}
              className={activeField === "description" ? styles.typingField : ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          {/* Strict Human-in-the-Loop Safety Gate */}
          <div className={styles.safetyGate}>
            <input
              type="checkbox"
              id="approval-gate"
              checked={isReviewed}
              onChange={(e) => setIsReviewed(e.target.checked)}
              disabled={isTyping}
            />
            <label htmlFor="approval-gate">
              <strong>Human Verification:</strong> I reviewed this claim and confirm all details are accurate.
            </label>
          </div>

          <div className={styles.actionRow}>
            <button
              type="submit"
              disabled={!isReviewed || isTyping}
              className={styles.submitBtn}
            >
              {isTyping ? "Agent Typing..." : "Submit Claim to Voltline (Sandbox)"}
            </button>
            <Link href="/" className={styles.cancelLink}>
              Cancel & Return
            </Link>
          </div>
        </form>
      )}
    </main>
  );
}

export default function SandboxPortalPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px", textAlign: "center" }}>Loading Sandbox Portal...</div>}>
      <PortalContent />
    </Suspense>
  );
}

