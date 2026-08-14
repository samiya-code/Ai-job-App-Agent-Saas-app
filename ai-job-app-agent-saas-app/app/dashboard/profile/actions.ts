"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { ProfileLink } from "@/lib/supabase/database.types"

export type ProfileFormInput = {
  fullName: string
  headline: string
  professionalSummary: string
  phone: string
  location: string
  website: string
  linkedinUrl: string
  githubUrl: string
  otherLinks: ProfileLink[]
  workExperiences: {
    id?: string
    company: string
    jobTitle: string
    location: string
    startDate: string
    endDate: string
    isCurrent: boolean
    responsibilities: string[]
  }[]
  education: {
    id?: string
    institution: string
    degree: string
    fieldOfStudy: string
    startDate: string
    endDate: string
  }[]
  skills: { id?: string; name: string; category: string }[]
  projects: {
    id?: string
    name: string
    description: string
    url: string
    technologies: string[]
  }[]
  certifications: {
    id?: string
    name: string
    issuer: string
    issueDate: string
    url: string
  }[]
}

export async function updateProfile(data: ProfileFormInput) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const now = new Date().toISOString()

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName || null,
      headline: data.headline || null,
      professional_summary: data.professionalSummary || null,
      phone: data.phone || null,
      location: data.location || null,
      website: data.website || null,
      linkedin_url: data.linkedinUrl || null,
      github_url: data.githubUrl || null,
      other_links: data.otherLinks,
      updated_at: now,
    })
    .eq("id", userId)

  if (profileError) {
    return { error: profileError.message }
  }

  const childTables = [
    "work_experiences",
    "education_entries",
    "skills",
    "projects",
    "certifications",
  ] as const

  for (const table of childTables) {
    const { error } = await supabase.from(table).delete().eq("user_id", userId)
    if (error) {
      return { error: `Failed to update ${table}: ${error.message}` }
    }
  }

  if (data.workExperiences.length > 0) {
    const { error } = await supabase.from("work_experiences").insert(
      data.workExperiences.map((exp, index) => ({
        user_id: userId,
        company: exp.company,
        job_title: exp.jobTitle,
        location: exp.location || null,
        start_date: exp.startDate || null,
        end_date: exp.endDate || null,
        is_current: exp.isCurrent,
        responsibilities: exp.responsibilities.filter(Boolean),
        display_order: index,
      }))
    )
    if (error) return { error: error.message }
  }

  if (data.education.length > 0) {
    const { error } = await supabase.from("education_entries").insert(
      data.education.map((edu, index) => ({
        user_id: userId,
        institution: edu.institution,
        degree: edu.degree || null,
        field_of_study: edu.fieldOfStudy || null,
        start_date: edu.startDate || null,
        end_date: edu.endDate || null,
        display_order: index,
      }))
    )
    if (error) return { error: error.message }
  }

  if (data.skills.length > 0) {
    const { error } = await supabase.from("skills").insert(
      data.skills.map((skill, index) => ({
        user_id: userId,
        name: skill.name,
        category: skill.category || null,
        display_order: index,
      }))
    )
    if (error) return { error: error.message }
  }

  if (data.projects.length > 0) {
    const { error } = await supabase.from("projects").insert(
      data.projects.map((project, index) => ({
        user_id: userId,
        name: project.name,
        description: project.description || null,
        url: project.url || null,
        technologies: project.technologies.filter(Boolean),
        display_order: index,
      }))
    )
    if (error) return { error: error.message }
  }

  if (data.certifications.length > 0) {
    const { error } = await supabase.from("certifications").insert(
      data.certifications.map((cert, index) => ({
        user_id: userId,
        name: cert.name,
        issuer: cert.issuer || null,
        issue_date: cert.issueDate || null,
        url: cert.url || null,
        display_order: index,
      }))
    )
    if (error) return { error: error.message }
  }

  revalidatePath("/dashboard/profile")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function deleteResume(resumeId: string) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const { data: resume, error: fetchError } = await supabase
    .from("resumes")
    .select("storage_path")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single()

  if (fetchError || !resume) {
    return { error: "Resume not found" }
  }

  await supabase.storage.from("resumes").remove([resume.storage_path])

  const { error: deleteError } = await supabase
    .from("resumes")
    .delete()
    .eq("id", resumeId)
    .eq("user_id", userId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath("/dashboard/resume")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function getResumeDownloadUrl(resumeId: string) {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("storage_path")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .single()

  if (error || !resume) {
    return { error: "Resume not found" }
  }

  const { data: signed, error: signError } = await supabase.storage
    .from("resumes")
    .createSignedUrl(resume.storage_path, 60)

  if (signError || !signed) {
    return { error: signError?.message ?? "Failed to create download URL" }
  }

  return { url: signed.signedUrl }
}
