import { VerifiedRequirement, Facts, DeadlineClock } from "@/lib/types";

export function computeDeadlineClock(
  requirements: VerifiedRequirement[],
  facts: Facts,
  now: Date = new Date()
): DeadlineClock {
  // Find verified window row
  const windowRow = requirements.find(
    (r) => r.window_days && r.window_days > 0 && r.quote_verified && r.final_status !== "ambiguous"
  );

  let return_deadline: string | null = null;
  let days_left_return: number | null = null;
  let basis: "delivery" | "purchase" | null = null;
  let source_ids: string[] = [];

  if (windowRow && windowRow.window_days) {
    const basisStr =
      windowRow.window_start === "delivery" && facts.delivery_date?.value
        ? facts.delivery_date.value
        : facts.purchase_date?.value;

    if (basisStr) {
      basis = windowRow.window_start === "delivery" && facts.delivery_date?.value ? "delivery" : "purchase";
      source_ids = windowRow.source_ids;

      const basisDate = new Date(basisStr);
      const deadlineDate = new Date(basisDate.getTime() + windowRow.window_days * 24 * 60 * 60 * 1000);
      return_deadline = deadlineDate.toISOString().split("T")[0];

      days_left_return = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  // Find warranty row
  let warranty_months: number | null = null;
  let warranty_end: string | null = null;

  const warrantyRow = requirements.find((r) => /warranty/i.test(r.requirement) && r.quote_verified);
  if (warrantyRow && facts.purchase_date?.value) {
    const pDate = new Date(facts.purchase_date.value);
    warranty_months = 12;
    pDate.setFullYear(pDate.getFullYear() + 1);
    warranty_end = pDate.toISOString().split("T")[0];
  }

  return {
    return_window_days: windowRow?.window_days ?? null,
    return_deadline,
    days_left_return,
    warranty_months,
    warranty_end,
    basis,
    source_ids,
    is_confirmed: Boolean(return_deadline),
  };
}

