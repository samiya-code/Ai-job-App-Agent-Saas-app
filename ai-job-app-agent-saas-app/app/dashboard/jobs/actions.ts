"use server"

import { revalidatePath } from "next/cache"

import { getJobsForUser } from "@/lib/jobs/queries"
import { isJobPlatformId, type JobPlatformId } from "@/lib/jobs/platforms"
import { getProfileData } from "@/lib/profile/queries"
import { createClient } from "@/lib/supabase/server"
import type { Job } from "@/lib/supabase/database.types"

export type FetchJobsResult =
  | { jobs: Job[]; fromCache: boolean; lastFetchedAt: string | null }
  | { error: string }

export async function fetchJobs(
  platforms: string[],
  options: { forceRefresh?: boolean } = {}
): Promise<FetchJobsResult> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const validPlatforms = platforms.filter(isJobPlatformId) as JobPlatformId[]
  if (validPlatforms.length === 0) {
    return { jobs: [], fromCache: true, lastFetchedAt: null }
  }

  const profileData = await getProfileData(userId)
  if (!profileData) {
    return { error: "Complete your profile to get job matches." }
  }

  try {
    return await getJobsForUser(userId, profileData, validPlatforms, options)
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to fetch jobs",
    }
  }
}

export async function toggleSaveJob(
  jobId: string,
  saved: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub

  if (!userId) {
    return { error: "Unauthorized" }
  }

  const { error } = await supabase
    .from("jobs")
    .update({ saved_status: saved })
    .eq("id", jobId)
    .eq("user_id", userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/jobs")
  return {}
}
