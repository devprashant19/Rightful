"use client";

import { useState } from "react";
import { DocumentInput } from "@/lib/types";
import { SAMPLE_CASES, TestCase } from "@/lib/cases";
import styles from "./CaseIntake.module.css";

interface CaseIntakeProps {
  documents: DocumentInput[];
  problem: string;
  seller: string;
  policyUrl: string;
  isLoading: boolean;
  onUpdateProblem: (val: string) => void;
  onUpdateSeller: (val: string) => void;
  onUpdatePolicyUrl: (val: string) => void;
  onAddDocument: (doc: DocumentInput) => void;
  onRemoveDocument: (docId: string) => void;
  onSelectSampleCase: (c: TestCase) => void;
  onSubmitClaim: () => void;
}

export function CaseIntake({
  documents,
  problem,
  seller,
  policyUrl,
  isLoading,
  onUpdateProblem,
  onUpdateSeller,
  onUpdatePolicyUrl,
  onAddDocument,
  onRemoveDocument,
  onSelectSampleCase,
  onSubmitClaim,
}: CaseIntakeProps) {
  const [pastedText, setPastedText] = useState("");
  const [showPasteArea, setShowPasteArea] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const docIndex = documents.length + i;
      const text = await file.text();

      onAddDocument({
        id: `D${docIndex + 1}`,
        name: file.name,
        type: file.name.endsWith(".pdf") ? "pdf" : file.name.endsWith(".eml") ? "eml" : "text",
        content: text.slice(0, 12000),
        sizeBytes: file.size,
      });
    }
  };

  const handleAddPastedText = () => {
    if (!pastedText.trim()) return;
    const docIndex = documents.length;
    onAddDocument({
      id: `D${docIndex + 1}`,
      name: `Pasted Receipt ${docIndex + 1}`,
      type: "text",
      content: pastedText.trim().slice(0, 12000),
    });
    setPastedText("");
    setShowPasteArea(false);
  };

  const isSubmitDisabled = (!problem.trim() && documents.length === 0) || isLoading;

  return (
    <section className={styles.intakeCard} aria-label="Submit case details">
      <div className={styles.header}>
        <h2>Your Case</h2>
        <span className={styles.intakeSub}>Evidence intake & document analysis</span>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="sample-select" className={styles.label}>
          Try a Benchmark Sample Case:
        </label>
        <select
          id="sample-select"
          className={styles.select}
          onChange={(e) => {
            const found = SAMPLE_CASES.find((c) => c.id === e.target.value);
            if (found) onSelectSampleCase(found);
          }}
          defaultValue="voltline-earbuds"
        >
          {SAMPLE_CASES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="problem-input" className={styles.label}>
          What went wrong? <span className={styles.required}>*</span>
        </label>
        <textarea
          id="problem-input"
          className={styles.textarea}
          rows={3}
          placeholder="e.g. Right earbud stopped charging after 19 days of normal use..."
          value={problem}
          onChange={(e) => onUpdateProblem(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="seller-input" className={styles.label}>
          Seller Name (Optional):
        </label>
        <input
          id="seller-input"
          type="text"
          className={styles.input}
          placeholder="e.g. Voltline Electronics, Apple, Best Buy"
          value={seller}
          onChange={(e) => onUpdateSeller(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="policy-url-input" className={styles.label}>
          Policy Link (Optional Override):
        </label>
        <input
          id="policy-url-input"
          type="url"
          className={styles.input}
          placeholder="https://example.com/return-policy"
          value={policyUrl}
          onChange={(e) => onUpdatePolicyUrl(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Purchase Documents & Receipts:</label>
        <div className={styles.dropzone}>
          <input
            type="file"
            id="file-upload"
            className={styles.fileInput}
            multiple
            accept=".txt,.text,.eml,.pdf,image/png,image/jpeg"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload" className={styles.dropzoneLabel}>
            📄 Drop order email (.eml), PDF receipt, or text file
            <span className={styles.dropzoneSub}>or click to browse from device</span>
          </label>
        </div>

        <button
          type="button"
          className={styles.pasteToggleBtn}
          onClick={() => setShowPasteArea(!showPasteArea)}
        >
          {showPasteArea ? "— Hide paste text area" : "+ Or paste receipt text directly"}
        </button>

        {showPasteArea && (
          <div className={styles.pasteAreaContainer}>
            <textarea
              className={styles.textarea}
              rows={4}
              placeholder="Paste raw email confirmation, invoice lines, or order text here..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
            />
            <button
              type="button"
              className={styles.addPastedBtn}
              onClick={handleAddPastedText}
              disabled={!pastedText.trim()}
            >
              Add Document to Case
            </button>
          </div>
        )}

        {documents.length > 0 && (
          <div className={styles.docList}>
            <span className={styles.docListTitle}>Attached Evidence:</span>
            {documents.map((doc) => (
              <div key={doc.id} className={styles.docItem}>
                <span className={styles.docBadge}>{doc.id}</span>
                <span className={styles.docName}>{doc.name}</span>
                <button
                  type="button"
                  className={styles.removeDocBtn}
                  onClick={() => onRemoveDocument(doc.id)}
                  aria-label={`Remove document ${doc.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        id="build-claim-btn"
        className={styles.submitBtn}
        disabled={isSubmitDisabled}
        onClick={onSubmitClaim}
      >
        {isLoading ? "⚡ Analyzing Evidence..." : "Build My Claim →"}
      </button>

      {isSubmitDisabled && !isLoading && (
        <span className={styles.helpText}>
          Provide a description or attach at least one purchase document to proceed.
        </span>
      )}
    </section>
  );
}

