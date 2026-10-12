"use client";

import { Facts } from "@/lib/types";
import styles from "./ExtractedFacts.module.css";

interface ExtractedFactsProps {
  facts: Facts;
  onHighlightDoc: (docId: string) => void;
}

export function ExtractedFacts({ facts, onHighlightDoc }: ExtractedFactsProps) {
  return (
    <section className={styles.card} aria-label="Extracted purchase facts">
      <div className={styles.cardHeader}>
        <h3>Extracted Facts</h3>
        <span className={styles.provenanceNote}>Linked to source documents</span>
      </div>

      <dl className={styles.factsGrid}>
        <div className={styles.factItem}>
          <dt>Seller</dt>
          <dd>
            <span>{facts.seller.value}</span>
            <button
              type="button"
              className={styles.docChip}
              onClick={() => onHighlightDoc(facts.seller.doc_id)}
              title={`Source: Document ${facts.seller.doc_id}`}
            >
              {facts.seller.doc_id}
            </button>
          </dd>
        </div>

        <div className={styles.factItem}>
          <dt>Product</dt>
          <dd>
            <span>{facts.product.value}</span>
            <button
              type="button"
              className={styles.docChip}
              onClick={() => onHighlightDoc(facts.product.doc_id)}
              title={`Source: Document ${facts.product.doc_id}`}
            >
              {facts.product.doc_id}
            </button>
          </dd>
        </div>

        {facts.order_id && (
          <div className={styles.factItem}>
            <dt>Order Reference</dt>
            <dd>
              <span className={styles.mono}>{facts.order_id.value}</span>
              <button
                type="button"
                className={styles.docChip}
                onClick={() => onHighlightDoc(facts.order_id!.doc_id)}
                title={`Source: Document ${facts.order_id!.doc_id}`}
              >
                {facts.order_id.doc_id}
              </button>
            </dd>
          </div>
        )}

        <div className={styles.factItem}>
          <dt>Purchase Date</dt>
          <dd>
            <span className={styles.mono}>{facts.purchase_date?.value || "Not stated"}</span>
            {facts.purchase_date && (
              <button
                type="button"
                className={styles.docChip}
                onClick={() => onHighlightDoc(facts.purchase_date!.doc_id)}
                title={`Source: Document ${facts.purchase_date!.doc_id}`}
              >
                {facts.purchase_date.doc_id}
              </button>
            )}
          </dd>
        </div>

        <div className={styles.factItem}>
          <dt>Delivery Date</dt>
          <dd>
            <span className={styles.mono}>{facts.delivery_date?.value || "Not stated"}</span>
            {facts.delivery_date && (
              <button
                type="button"
                className={styles.docChip}
                onClick={() => onHighlightDoc(facts.delivery_date!.doc_id)}
                title={`Source: Document ${facts.delivery_date!.doc_id}`}
              >
                {facts.delivery_date.doc_id}
              </button>
            )}
          </dd>
        </div>

        <div className={styles.factItem}>
          <dt>Claim Type</dt>
          <dd>
            <span className={styles.typeBadge}>{facts.claim_type.toUpperCase()}</span>
          </dd>
        </div>
      </dl>
    </section>
  );
}

