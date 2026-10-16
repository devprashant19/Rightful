"use client";

import { DeadlineClock as DeadlineClockType } from "@/lib/types";
import styles from "./DeadlineClock.module.css";

interface DeadlineClockProps {
  deadline: DeadlineClockType;
  productName: string;
  sellerName: string;
  onDownloadCalendar: () => void;
}

export function DeadlineClock({ deadline, productName, sellerName, onDownloadCalendar }: DeadlineClockProps) {
  if (!deadline.is_confirmed || !deadline.return_deadline) {
    return (
      <div className={styles.clockCardUnconfirmed}>
        <span className={styles.unconfirmedTag}>⏳ Window not confirmed</span>
        <p className={styles.unconfirmedText}>
          Policy research did not locate an official return window yet.
        </p>
      </div>
    );
  }

  const daysLeft = deadline.days_left_return ?? 0;
  const isUrgent = daysLeft <= 3 && daysLeft >= 0;
  const isExpired = daysLeft < 0;

  return (
    <section className={`${styles.clockCard} ${isExpired ? styles.expired : isUrgent ? styles.urgent : styles.normal}`}>
      <div className={styles.clockHeader}>
        <div className={styles.countdownTitle}>
          {isExpired ? (
            <span className={styles.statusWord}>RETURN WINDOW EXPIRED</span>
          ) : (
            <>
              <span className={styles.daysNumber}>{daysLeft}</span>
              <span className={styles.daysLabel}>days left to return</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onDownloadCalendar}
          className={styles.calendarBtn}
          title="Download .ics calendar event"
        >
          📅 Add to calendar
        </button>
      </div>

      <div className={styles.metaRow}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Return Deadline:</span>
          <span className={styles.metaValue}>{deadline.return_deadline}</span>
          <span className={styles.metaBasis}>({deadline.return_window_days}d from {deadline.basis})</span>
        </div>

        {deadline.warranty_end && (
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>1-Year Warranty Until:</span>
            <span className={styles.metaValue}>{deadline.warranty_end}</span>
          </div>
        )}
      </div>
    </section>
  );
}

