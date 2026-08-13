import { siteConfig } from "@/lib/site-config";

export function resolveMediaUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;

  const source = value.trim();

  if (!source) return null;

  if (
    /^https?:\/\//i.test(source) ||
    source.startsWith("data:")
  ) {
    return source;
  }

  const baseUrl = siteConfig.apiUrl.replace(/\/$/, "");
  const path = source.startsWith("/") ? source : `/${source}`;

  return `${baseUrl}${path}`;
}

export function getInitials(
  name: string | null | undefined,
): string {
  const safeName = name?.trim() || "FixItNow User";

  const initials = safeName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "FI";
}