"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert01Icon,
  JobSearchIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"

import { fetchJobs } from "@/app/dashboard/jobs/actions"
import { JobCard } from "@/components/jobs/job-card"
import { JobsListSkeleton } from "@/components/jobs/jobs-skeleton"
import { PlatformCards } from "@/components/jobs/platform-cards"
import { ProfileCompletenessCard } from "@/components/jobs/profile-completeness-card"
import { RecentActivityCard } from "@/components/jobs/recent-activity-card"
import { WelcomeBanner } from "@/components/jobs/welcome-banner"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { JOB_PLATFORM_IDS, type JobPlatformId } from "@/lib/jobs/platforms"
import type { Job } from "@/lib/supabase/database.types"
import type { ProfileCompleteness } from "@/lib/profile/utils"

type JobsViewProps = {
  name: string | null
  initialJobs: Job[]
  initialLastFetchedAt: string | null
  shouldRefreshOnMount: boolean
  completeness: ProfileCompleteness
  activity: Job[]
}

export function JobsView({
  name,
  initialJobs,
  initialLastFetchedAt,
  shouldRefreshOnMount,
  completeness,
  activity,
}: JobsViewProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<JobPlatformId[]>([
    ...JOB_PLATFORM_IDS,
  ])
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [lastFetchedAt, setLastFetchedAt] = useState(initialLastFetchedAt)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const didAutoRefresh = useRef(false)

  const loadJobs = useCallback(
    (platforms: JobPlatformId[], forceRefresh = false) => {
      if (platforms.length === 0) {
        setJobs([])
        setError(null)
        return
      }
      startTransition(async () => {
        setError(null)
        const result = await fetchJobs(platforms, { forceRefresh })
        if ("error" in result) {
          setError(result.error)
          return
        }
        setJobs(result.jobs)
        setLastFetchedAt(result.lastFetchedAt)
      })
    },
    []
  )

  useEffect(() => {
    if (shouldRefreshOnMount && !didAutoRefresh.current) {
      didAutoRefresh.current = true
      loadJobs([...JOB_PLATFORM_IDS])
    }
  }, [shouldRefreshOnMount, loadJobs])

  function handleTogglePlatform(platform: JobPlatformId) {
    const next = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((id) => id !== platform)
      : [...selectedPlatforms, platform]
    setSelectedPlatforms(next)
    loadJobs(next)
  }

  const visibleJobs = jobs.filter((job) =>
    selectedPlatforms.includes(job.platform as JobPlatformId)
  )

  return (
    <div className="flex flex-col gap-6">
      <WelcomeBanner name={name} matchCount={visibleJobs.length} />

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Job platforms
        </h2>
        <PlatformCards
          selected={selectedPlatforms}
          onToggle={handleTogglePlatform}
          disabled={isPending}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Top job matches
              {!isPending && visibleJobs.length > 0 ? (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {visibleJobs.length} found
                </span>
              ) : null}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadJobs(selectedPlatforms, true)}
              disabled={isPending || selectedPlatforms.length === 0}
            >
              <HugeiconsIcon
                icon={RefreshIcon}
                strokeWidth={2}
                className="size-4"
              />
              Refresh
            </Button>
          </div>

          {isPending ? (
            <JobsListSkeleton />
          ) : error ? (
            <Empty className="border py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon
                    icon={Alert01Icon}
                    strokeWidth={2}
                    className="size-5 text-destructive"
                  />
                </EmptyMedia>
                <EmptyTitle>Couldn&apos;t load jobs</EmptyTitle>
                <EmptyDescription>{error}</EmptyDescription>
              </EmptyHeader>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadJobs(selectedPlatforms)}
              >
                Try again
              </Button>
            </Empty>
          ) : visibleJobs.length === 0 ? (
            <Empty className="border py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon
                    icon={JobSearchIcon}
                    strokeWidth={2}
                    className="size-5"
                  />
                </EmptyMedia>
                <EmptyTitle>No job matches found</EmptyTitle>
                <EmptyDescription>
                  {selectedPlatforms.length === 0
                    ? "Select at least one platform above to search for jobs."
                    : "Try selecting more platforms, refreshing, or completing your profile so we can match you better."}
                </EmptyDescription>
              </EmptyHeader>
              {selectedPlatforms.length > 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadJobs(selectedPlatforms, true)}
                >
                  Refresh jobs
                </Button>
              ) : null}
            </Empty>
          ) : (
            <div className="flex flex-col gap-4">
              {visibleJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
          <ProfileCompletenessCard completeness={completeness} />
          <RecentActivityCard activity={activity} lastFetchedAt={lastFetchedAt} />
        </aside>
      </div>
    </div>
  )
}
