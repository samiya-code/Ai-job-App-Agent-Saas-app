import type { ProfileLink } from "@/lib/supabase/database.types"

export function parseOtherLinks(value: unknown): ProfileLink[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is ProfileLink =>
      typeof item === "object" &&
      item !== null &&
      "label" in item &&
      "url" in item &&
      typeof item.label === "string" &&
      typeof item.url === "string"
  )
}
