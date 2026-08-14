import type { ProfileData, ProfileLink } from "@/lib/supabase/database.types"

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

export type CompletenessSection = {
  label: string
  completed: boolean
}

export type ProfileCompleteness = {
  percent: number
  sections: CompletenessSection[]
}

export function computeProfileCompleteness(
  data: ProfileData
): ProfileCompleteness {
  const sections: CompletenessSection[] = [
    { label: "Basic info", completed: Boolean(data.profile.full_name) },
    { label: "Headline", completed: Boolean(data.profile.headline) },
    { label: "Location", completed: Boolean(data.profile.location) },
    {
      label: "Summary",
      completed: Boolean(data.profile.professional_summary),
    },
    { label: "Work experience", completed: data.workExperiences.length > 0 },
    { label: "Education", completed: data.education.length > 0 },
    { label: "Skills", completed: data.skills.length > 0 },
  ]

  const completedCount = sections.filter((section) => section.completed).length
  const percent = Math.round((completedCount / sections.length) * 100)

  return { percent, sections }
}
