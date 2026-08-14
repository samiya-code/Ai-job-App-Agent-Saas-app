import type { ProfileData } from "@/lib/supabase/database.types"

export type JobSearchProfile = {
  role: string
  location: string
  jobType: string
  skills: string[]
  experienceYears: number
}

export function buildSearchProfile(data: ProfileData): JobSearchProfile {
  const role =
    data.profile.headline?.trim() ||
    data.workExperiences[0]?.job_title?.trim() ||
    "Software Engineer"

  const skills = data.skills.map((skill) => skill.name.trim()).filter(Boolean)

  return {
    role,
    location: data.profile.location?.trim() ?? "",
    jobType: "Remote",
    skills,
    experienceYears: estimateExperienceYears(data),
  }
}

function estimateExperienceYears(data: ProfileData): number {
  let years = 0
  for (const experience of data.workExperiences) {
    const start = parseYear(experience.start_date)
    const end = experience.is_current
      ? new Date().getFullYear()
      : parseYear(experience.end_date)
    if (start && end && end >= start) {
      years += end - start
    }
  }
  return years
}

function parseYear(value: string | null): number | null {
  if (!value) return null
  const match = value.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : null
}

export function buildSearchQuery(
  siteFilter: string,
  profile: JobSearchProfile
): string {
  const terms = [
    profile.role,
    ...profile.skills.slice(0, 2),
    profile.jobType,
    profile.location,
  ]
    .filter(Boolean)
    .join(" ")

  return `${siteFilter} ${terms}`.trim()
}

export function computeMatchScore(
  profile: JobSearchProfile,
  title: string,
  description: string
): { score: number; matchedSkills: string[] } {
  const haystack = `${title} ${description}`.toLowerCase()

  const matchedSkills = profile.skills.filter((skill) =>
    haystack.includes(skill.toLowerCase())
  )

  const roleWords = profile.role
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2)
  const matchedRoleWords = roleWords.filter((word) => haystack.includes(word))

  const roleScore =
    roleWords.length > 0 ? (matchedRoleWords.length / roleWords.length) * 45 : 0
  const skillScore =
    profile.skills.length > 0
      ? (matchedSkills.length / Math.min(profile.skills.length, 8)) * 40
      : 0
  const locationScore =
    profile.location && haystack.includes(profile.location.toLowerCase())
      ? 15
      : haystack.includes("remote")
        ? 10
        : 0

  const score = Math.min(
    98,
    Math.max(35, Math.round(roleScore + skillScore + locationScore + 30))
  )

  return { score, matchedSkills }
}
