const dateFormatter = new Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const timeFormatter = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return dateFormatter.format(d);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return dateTimeFormatter.format(d);
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "—";
  return timeFormatter.format(new Date(`1970-01-01T${value}`));
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("es-CO").format(value);
}

export function formatPercent(value: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function fullName(firstName?: string | null, lastName?: string | null): string {
  return [firstName ?? "", lastName ?? ""].filter(Boolean).join(" ").trim() || "—";
}

export function fileNameFromContentDisposition(value: string | null): string | null {
  if (!value) return null;
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(value);
  if (utf8?.[1]) return decodeURIComponent(utf8[1]);
  const plain = /filename="?([^";]+)"?/i.exec(value);
  return plain?.[1] ?? null;
}
