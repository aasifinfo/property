import { APP_CONFIG } from "@/config";

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

export function getWhatsappLink(phone: string, text: string) {
  const digits = phone.replace(/[^\\d]/g, "");
  return `${APP_CONFIG.whatsappPrefix}${digits}?text=${encodeURIComponent(text)}`;
}

export function parseNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

