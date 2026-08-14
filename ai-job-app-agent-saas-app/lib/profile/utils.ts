import type { ProfileFormInput } from "@/app/dashboard/profile/actions"
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

export type CompletenessSection = {
  key: string
  label: string
  fraction: number
}

export type ProfileCompleteness = {
  percent: number
  sections: CompletenessSection[]
}

export function calculateProfileCompleteness(
  form: ProfileFormInput
): ProfileCompleteness {
  const personalFields = [form.fullName, form.headline, form.phone, form.location]
  const personalFraction =
    personalFields.filter((value) => value.trim()).length / personalFields.length

  const hasExperience = form.workExperiences.some(
    (exp) => exp.company.trim() && exp.jobTitle.trim()
  )
  const hasEducation = form.education.some((edu) => edu.institution.trim())
  const skillCount = form.skills.filter((skill) => skill.name.trim()).length
  const hasProjects = form.projects.some((project) => project.name.trim())
  const hasCertifications = form.certifications.some((cert) => cert.name.trim())
  const hasLinks =
    Boolean(
      form.website.trim() || form.linkedinUrl.trim() || form.githubUrl.trim()
    ) || form.otherLinks.some((link) => link.url.trim())

  const sections: (CompletenessSection & { weight: number })[] = [
    { key: "personal", label: "Personal", weight: 20, fraction: personalFraction },
    {
      key: "summary",
      label: "Summary",
      weight: 15,
      fraction: form.professionalSummary.trim() ? 1 : 0,
    },
    {
      key: "experience",
      label: "Experience",
      weight: 20,
      fraction: hasExperience ? 1 : 0,
    },
    {
      key: "education",
      label: "Education",
      weight: 10,
      fraction: hasEducation ? 1 : 0,
    },
    {
      key: "skills",
      label: "Skills",
      weight: 15,
      fraction: Math.min(skillCount / 3, 1),
    },
    { key: "projects", label: "Projects", weight: 5, fraction: hasProjects ? 1 : 0 },
    {
      key: "certifications",
      label: "Certifications",
      weight: 5,
      fraction: hasCertifications ? 1 : 0,
    },
    { key: "links", label: "Links", weight: 10, fraction: hasLinks ? 1 : 0 },
  ]

  const percent = Math.round(
    sections.reduce((total, section) => total + section.weight * section.fraction, 0)
  )

  return {
    percent,
    sections: sections.map(({ key, label, fraction }) => ({ key, label, fraction })),
  }
}
