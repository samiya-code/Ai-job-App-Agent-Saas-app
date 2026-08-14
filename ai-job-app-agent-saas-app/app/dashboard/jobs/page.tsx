import { redirect } from "next/navigation"

import { PageHeader } from "@/components/dashboard/page-header"
import { JobsView } from "@/components/jobs/jobs-view"
import { getCachedJobs, getRecentActivity, isCacheFresh } from "@/lib/jobs/queries"
import { JOB_PLATFORM_IDS } from "@/lib/jobs/platforms"
import { getProfileData } from "@/lib/profile/queries"
import { computeProfileCompleteness } from "@/lib/profile/utils"
import { createClient } from "@/lib/supabase/server"

export default async function JobsPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub

  if (!userId) {
    redirect("/sign-in")
  }

  const profileData = await getProfileData(userId)

  if (!profileData) {
    redirect("/sign-in")
  }

  const [cached, activity] = await Promise.all([
    getCachedJobs(userId, [...JOB_PLATFORM_IDS]),
    getRecentActivity(userId),
  ])

  const cacheIsFresh =
    cached.jobs.length > 0 && isCacheFresh(cached.lastFetchedAt)

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Job matches from top platforms, tailored to your profile."
      />
      <div className="flex flex-1 flex-col px-6 py-8">
        <JobsView
          name={profileData.profile.full_name}
          initialJobs={cached.jobs}
          initialLastFetchedAt={cached.lastFetchedAt}
          shouldRefreshOnMount={!cacheIsFresh}
          completeness={computeProfileCompleteness(profileData)}
          activity={activity}
        />
      </div>
    </>
  )
}
