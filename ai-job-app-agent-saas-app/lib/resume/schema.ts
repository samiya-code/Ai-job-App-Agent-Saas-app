import { z } from "zod"

export const otherLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
})

export const parsedWorkExperienceSchema = z.object({
  company: z.string().default(""),
  jobTitle: z.string().default(""),
  location: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  isCurrent: z.boolean().default(false),
  responsibilities: z.array(z.string()).default([]),
})

export const parsedEducationSchema = z.object({
  institution: z.string().default(""),
  degree: z.string().optional().default(""),
  fieldOfStudy: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
})

export const parsedSkillSchema = z.object({
  name: z.string(),
  category: z.string().optional().default(""),
})

export const parsedProjectSchema = z.object({
  name: z.string().default(""),
  description: z.string().optional().default(""),
  url: z.string().optional().default(""),
  technologies: z.array(z.string()).default([]),
})

export const parsedCertificationSchema = z.object({
  name: z.string().default(""),
  issuer: z.string().optional().default(""),
  issueDate: z.string().optional().default(""),
  url: z.string().optional().default(""),
})

export const parsedResumeSchema = z.object({
  fullName: z.string().optional().default(""),
  headline: z.string().optional().default(""),
  professionalSummary: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  website: z.string().optional().default(""),
  linkedinUrl: z.string().optional().default(""),
  githubUrl: z.string().optional().default(""),
  otherLinks: z.array(otherLinkSchema).default([]),
  workExperiences: z.array(parsedWorkExperienceSchema).default([]),
  education: z.array(parsedEducationSchema).default([]),
  skills: z.array(parsedSkillSchema).default([]),
  projects: z.array(parsedProjectSchema).default([]),
  certifications: z.array(parsedCertificationSchema).default([]),
})

export type ParsedResume = z.infer<typeof parsedResumeSchema>
export type OtherLink = z.infer<typeof otherLinkSchema>
export type ParsedWorkExperience = z.infer<typeof parsedWorkExperienceSchema>
export type ParsedEducation = z.infer<typeof parsedEducationSchema>
export type ParsedSkill = z.infer<typeof parsedSkillSchema>
export type ParsedProject = z.infer<typeof parsedProjectSchema>
export type ParsedCertification = z.infer<typeof parsedCertificationSchema>

export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const

export const MAX_RESUME_FILE_SIZE = 5 * 1024 * 1024

export function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_")
}
