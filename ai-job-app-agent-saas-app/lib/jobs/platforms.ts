export const JOB_PLATFORMS = [
  {
    id: "greenhouse",
    name: "Greenhouse",
    domain: "greenhouse.io",
    siteFilter: "site:greenhouse.io/jobs OR site:boards.greenhouse.io OR site:job-boards.greenhouse.io",
    description: "Jobs at companies hiring through Greenhouse",
  },
  {
    id: "lever",
    name: "Lever",
    domain: "lever.co",
    siteFilter: "site:jobs.lever.co",
    description: "Jobs at companies hiring through Lever",
  },
  {
    id: "workable",
    name: "Workable",
    domain: "workable.com",
    siteFilter: "site:apply.workable.com OR site:jobs.workable.com",
    description: "Jobs at companies hiring through Workable",
  },
  {
    id: "wellfound",
    name: "Wellfound",
    domain: "wellfound.com",
    siteFilter: "site:wellfound.com/jobs",
    description: "Startup jobs on Wellfound (AngelList)",
  },
] as const

export type JobPlatformId = (typeof JOB_PLATFORMS)[number]["id"]

export const JOB_PLATFORM_IDS = JOB_PLATFORMS.map(
  (platform) => platform.id
) as JobPlatformId[]

export function isJobPlatformId(value: string): value is JobPlatformId {
  return JOB_PLATFORM_IDS.includes(value as JobPlatformId)
}
