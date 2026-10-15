export function generateIcsCalendar(
  productName: string,
  deadlineStr: string, // "YYYY-MM-DD"
  sellerName: string
): string {
  const targetDate = new Date(deadlineStr);
  // Schedule reminder 2 days before deadline
  const reminderDate = new Date(targetDate.getTime() - 2 * 24 * 60 * 60 * 1000);

  const formatDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const dtStamp = formatDate(new Date());
  const dtStart = reminderDate.toISOString().split("T")[0].replace(/-/g, "");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Rightful//Consumer Claim Reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:rightful-${Date.now()}@rightful.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `SUMMARY:Return Deadline Alert: ${productName}`,
    `DESCRIPTION:Reminder: 2 days remaining to return your ${productName} to ${sellerName} under their official return policy window.`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT9H",
    "ACTION:DISPLAY",
    `DESCRIPTION:Return deadline for ${productName} is approaching!`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadCalendarFile(productName: string, deadlineStr: string, sellerName: string) {
  if (typeof window === "undefined") return;
  const icsContent = generateIcsCalendar(productName, deadlineStr, sellerName);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Return_Deadline_${productName.replace(/[^a-zA-Z0-9]/g, "_")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

