import { createClient } from "@/lib/supabase/server"
import type { ProfileData } from "@/lib/supabase/database.types"

export async function getProfileData(userId: string): Promise<ProfileData | null> {
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    return null
  }

  const [
    { data: workExperiences },
    { data: education },
    { data: skills },
    { data: projects },
    { data: certifications },
  ] = await Promise.all([
    supabase
      .from("work_experiences")
      .select("*")
      .eq("user_id", userId)
      .order("display_order"),
    supabase
      .from("education_entries")
      .select("*")
      .eq("user_id", userId)
      .order("display_order"),
    supabase.from("skills").select("*").eq("user_id", userId).order("display_order"),
    supabase.from("projects").select("*").eq("user_id", userId).order("display_order"),
    supabase
      .from("certifications")
      .select("*")
      .eq("user_id", userId)
      .order("display_order"),
  ])

  return {
    profile,
    workExperiences: workExperiences ?? [],
    education: education ?? [],
    skills: skills ?? [],
    projects: projects ?? [],
    certifications: certifications ?? [],
  }
}

export async function getUserResumes(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function needsOnboarding(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from("resumes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("parse_status", "completed")

  if (error) {
    return true
  }

  return (count ?? 0) === 0
}
