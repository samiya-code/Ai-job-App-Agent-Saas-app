import { createClient } from "@/lib/supabase/server"
import type { Job, ProfileData } from "@/lib/supabase/database.types"
import { searchPlatformJobs } from "@/lib/jobs/brave"
import { buildSearchProfile } from "@/lib/jobs/matching"
import type { JobPlatformId } from "@/lib/jobs/platforms"

export const JOBS_CACHE_TTL_MS = 6 * 60 * 60 * 1000

export type JobsResult = {
  jobs: Job[]
  fromCache: boolean
  lastFetchedAt: string | null
}

export async function getCachedJobs(
  userId: string,
  platforms: JobPlatformId[]
): Promise<{ jobs: Job[]; lastFetchedAt: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .in("platform", platforms)
    .order("match_score", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const jobs = data ?? []
  const lastFetchedAt = jobs.reduce<string | null>(
    (latest, job) =>
      !latest || job.fetched_at > latest ? job.fetched_at : latest,
    null
  )

  return { jobs, lastFetchedAt }
}

export function isCacheFresh(lastFetchedAt: string | null): boolean {
  if (!lastFetchedAt) return false
  return Date.now() - new Date(lastFetchedAt).getTime() < JOBS_CACHE_TTL_MS
}

export async function getJobsForUser(
  userId: string,
  profileData: ProfileData,
  platforms: JobPlatformId[],
  { forceRefresh = false }: { forceRefresh?: boolean } = {}
): Promise<JobsResult> {
  const cached = await getCachedJobs(userId, platforms)

  if (!forceRefresh && cached.jobs.length > 0 && isCacheFresh(cached.lastFetchedAt)) {
    return { jobs: cached.jobs, fromCache: true, lastFetchedAt: cached.lastFetchedAt }
  }

  const searchProfile = buildSearchProfile(profileData)

  const results = await Promise.allSettled(
    platforms.map((platform) =>
      searchPlatformJobs(platform, searchProfile, userId)
    )
  )

  const fetchedJobs = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  )

  const failures = results.filter(
    (result) => result.status === "rejected"
  ) as PromiseRejectedResult[]

  if (fetchedJobs.length === 0 && failures.length > 0) {
    if (cached.jobs.length > 0) {
      return {
        jobs: cached.jobs,
        fromCache: true,
        lastFetchedAt: cached.lastFetchedAt,
      }
    }
    throw new Error(
      failures[0].reason instanceof Error
        ? failures[0].reason.message
        : "Failed to fetch jobs"
    )
  }

  const supabase = await createClient()

  if (fetchedJobs.length > 0) {
    const { error: upsertError } = await supabase
      .from("jobs")
      .upsert(fetchedJobs, {
        onConflict: "user_id,job_url",
        ignoreDuplicates: false,
      })

    if (upsertError) {
      throw new Error(upsertError.message)
    }

    // Drop stale, non-saved, non-applied jobs from refreshed platforms
    const freshUrls = fetchedJobs.map((job) => job.job_url)
    await supabase
      .from("jobs")
      .delete()
      .eq("user_id", userId)
      .in("platform", platforms)
      .eq("saved_status", false)
      .eq("applied_status", false)
      .not("job_url", "in", `(${freshUrls.map((url) => `"${url}"`).join(",")})`)
  }

  const refreshed = await getCachedJobs(userId, platforms)
  return {
    jobs: refreshed.jobs,
    fromCache: false,
    lastFetchedAt: refreshed.lastFetchedAt,
  }
}

export async function getRecentActivity(userId: string): Promise<Job[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .or("saved_status.eq.true,applied_status.eq.true")
    .order("created_at", { ascending: false })
    .limit(5)

  return data ?? []
}
