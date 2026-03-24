import { APP_CONFIG } from "@/config";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const LISTING_RENEWAL_WINDOW_DAYS = 14;

export function cn(...values: Array<string | undefined | false | null>) {
  return values.filter(Boolean).join(" ");
}

export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return "TBD";
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function statusClasses(status: string) {
  switch (status) {
    case "approved":
      return "badge bg-emerald-50 text-emerald-700";
    case "pending":
      return "badge bg-amber-50 text-amber-700";
    case "active":
      return "badge bg-sky-50 text-sky-700";
    case "planning":
      return "badge bg-violet-50 text-violet-700";
    case "rejected":
    case "deactivated":
      return "badge bg-rose-50 text-rose-700";
    case "suspended":
    case "expired":
      return "badge bg-slate-100 text-slate-700";
    case "hot":
      return "badge bg-orange-100 text-orange-700";
    default:
      return "badge bg-slate-100 text-slate-700";
  }
}

export function initials(name?: string | null) {
  if (!name) return "DE";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getFullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName].filter(Boolean).join(" ").trim() || "Broker";
}

export function formatDealType(value: string | null | undefined) {
  switch (value) {
    case "off_plan":
      return "Off-Plan";
    case "secondary":
      return "Secondary";
    case "distressed":
      return "Distressed";
    case "urgent_sale":
      return "Urgent Sale";
    default:
      return value || "Unknown";
  }
}

export function getWhatsappLink(phone: string, text: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `${APP_CONFIG.whatsappPrefix}${digits}?text=${encodeURIComponent(text)}`;
}

export function getMailtoLink(email: string, subject: string, body: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getLastReconfirmedAt(renewalDueAt?: string | null, fallbackDate?: string | null) {
  if (renewalDueAt) {
    return new Date(new Date(renewalDueAt).getTime() - LISTING_RENEWAL_WINDOW_DAYS * DAY_IN_MS).toISOString();
  }
  return fallbackDate || null;
}

export function getRenewalMeta(renewalDueAt?: string | null) {
  if (!renewalDueAt) {
    return { label: "Renewal not scheduled", tone: "neutral" as const, daysUntilDue: null as number | null };
  }

  const dueAt = new Date(renewalDueAt);
  const daysUntilDue = Math.ceil((dueAt.getTime() - Date.now()) / DAY_IN_MS);

  if (daysUntilDue < 0) {
    return { label: `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? "" : "s"} overdue`, tone: "critical" as const, daysUntilDue };
  }

  if (daysUntilDue <= 7) {
    return { label: `Renew in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`, tone: "warning" as const, daysUntilDue };
  }

  return { label: `Renewal due in ${daysUntilDue} days`, tone: "healthy" as const, daysUntilDue };
}
