import type { SupabaseClient } from "@supabase/supabase-js"

import type { ParsedResume } from "@/lib/resume/schema"
import type { Database } from "@/lib/supabase/database.types"

type Supabase = SupabaseClient<Database>

export async function saveParsedResume(
  supabase: Supabase,
  userId: string,
  resumeId: string,
  parsed: ParsedResume
) {
  const now = new Date().toISOString()

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.fullName || undefined,
      headline: parsed.headline || null,
      professional_summary: parsed.professionalSummary || null,
      phone: parsed.phone || null,
      location: parsed.location || null,
      website: parsed.website || null,
      linkedin_url: parsed.linkedinUrl || null,
      github_url: parsed.githubUrl || null,
      other_links: parsed.otherLinks,
      onboarding_completed_at: now,
      updated_at: now,
    })
    .eq("id", userId)

  if (profileError) {
    throw new Error(`Failed to update profile: ${profileError.message}`)
  }

  await replaceChildRows(supabase, userId, parsed)

  const { error: resumeError } = await supabase
    .from("resumes")
    .update({
      parse_status: "completed",
      parse_error: null,
      updated_at: now,
    })
    .eq("id", resumeId)
    .eq("user_id", userId)

  if (resumeError) {
    throw new Error(`Failed to update resume: ${resumeError.message}`)
  }
}

async function replaceChildRows(
  supabase: Supabase,
  userId: string,
  parsed: ParsedResume
) {
  const tables = [
    "work_experiences",
    "education_entries",
    "skills",
    "projects",
    "certifications",
  ] as const

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId)
    if (error) {
      throw new Error(`Failed to clear ${table}: ${error.message}`)
    }
  }

  if (parsed.workExperiences.length > 0) {
    const { error } = await supabase.from("work_experiences").insert(
      parsed.workExperiences.map((exp, index) => ({
        user_id: userId,
        company: exp.company,
        job_title: exp.jobTitle,
        location: exp.location || null,
        start_date: exp.startDate || null,
        end_date: exp.endDate || null,
        is_current: exp.isCurrent,
        responsibilities: exp.responsibilities,
        display_order: index,
      }))
    )
    if (error) throw new Error(`Failed to save work experiences: ${error.message}`)
  }

  if (parsed.education.length > 0) {
    const { error } = await supabase.from("education_entries").insert(
      parsed.education.map((edu, index) => ({
        user_id: userId,
        institution: edu.institution,
        degree: edu.degree || null,
        field_of_study: edu.fieldOfStudy || null,
        start_date: edu.startDate || null,
        end_date: edu.endDate || null,
        display_order: index,
      }))
    )
    if (error) throw new Error(`Failed to save education: ${error.message}`)
  }

  if (parsed.skills.length > 0) {
    const { error } = await supabase.from("skills").insert(
      parsed.skills.map((skill, index) => ({
        user_id: userId,
        name: skill.name,
        category: skill.category || null,
        display_order: index,
      }))
    )
    if (error) throw new Error(`Failed to save skills: ${error.message}`)
  }

  if (parsed.projects.length > 0) {
    const { error } = await supabase.from("projects").insert(
      parsed.projects.map((project, index) => ({
        user_id: userId,
        name: project.name,
        description: project.description || null,
        url: project.url || null,
        technologies: project.technologies,
        display_order: index,
      }))
    )
    if (error) throw new Error(`Failed to save projects: ${error.message}`)
  }

  if (parsed.certifications.length > 0) {
    const { error } = await supabase.from("certifications").insert(
      parsed.certifications.map((cert, index) => ({
        user_id: userId,
        name: cert.name,
        issuer: cert.issuer || null,
        issue_date: cert.issueDate || null,
        url: cert.url || null,
        display_order: index,
      }))
    )
    if (error) throw new Error(`Failed to save certifications: ${error.message}`)
  }
}

export async function markResumeParseFailed(
  supabase: Supabase,
  userId: string,
  resumeId: string,
  errorMessage: string
) {
  await supabase
    .from("resumes")
    .update({
      parse_status: "failed",
      parse_error: errorMessage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId)
    .eq("user_id", userId)
}
