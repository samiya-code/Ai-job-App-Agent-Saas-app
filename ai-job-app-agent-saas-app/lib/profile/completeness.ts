import type { ProfileFormInput } from "@/app/dashboard/profile/actions"

export type ProfileSectionKey =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "links"

export type SectionCompleteness = {
  key: ProfileSectionKey
  completed: number
  total: number
  isComplete: boolean
}

export type ProfileCompleteness = {
  percent: number
  sections: SectionCompleteness[]
}

function filled(value: string) {
  return value.trim().length > 0
}

export function calculateProfileCompleteness(
  form: ProfileFormInput
): ProfileCompleteness {
  const personalFields = [
    form.fullName,
    form.headline,
    form.phone,
    form.location,
  ]
  const hasLink =
    filled(form.website) ||
    filled(form.linkedinUrl) ||
    filled(form.githubUrl) ||
    form.otherLinks.some((link) => filled(link.url))

  const sections: SectionCompleteness[] = [
    section("personal", personalFields.filter(filled).length, personalFields.length),
    section("summary", filled(form.professionalSummary) ? 1 : 0, 1),
    section(
      "experience",
      form.workExperiences.some(
        (exp) => filled(exp.company) && filled(exp.jobTitle)
      )
        ? 1
        : 0,
      1
    ),
    section(
      "education",
      form.education.some((edu) => filled(edu.institution)) ? 1 : 0,
      1
    ),
    section("skills", form.skills.some((skill) => filled(skill.name)) ? 1 : 0, 1),
    section(
      "projects",
      form.projects.some((project) => filled(project.name)) ? 1 : 0,
      1
    ),
    section(
      "certifications",
      form.certifications.some((cert) => filled(cert.name)) ? 1 : 0,
      1
    ),
    section("links", hasLink ? 1 : 0, 1),
  ]

  const completed = sections.reduce((sum, s) => sum + s.completed, 0)
  const total = sections.reduce((sum, s) => sum + s.total, 0)
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  return { percent, sections }
}

function section(
  key: ProfileSectionKey,
  completed: number,
  total: number
): SectionCompleteness {
  return { key, completed, total, isComplete: completed >= total }
}
