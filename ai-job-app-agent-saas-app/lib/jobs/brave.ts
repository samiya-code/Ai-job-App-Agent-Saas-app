import type { JobInsert } from "@/lib/supabase/database.types"
import { JOB_PLATFORMS, type JobPlatformId } from "@/lib/jobs/platforms"
import {
  buildSearchQuery,
  computeMatchScore,
  type JobSearchProfile,
} from "@/lib/jobs/matching"

const BRAVE_SEARCH_ENDPOINT = "https://api.search.brave.com/res/v1/web/search"

type BraveWebResult = {
  title?: string
  url?: string
  description?: string
  meta_url?: { favicon?: string }
  profile?: { img?: string }
}

type BraveSearchResponse = {
  web?: { results?: BraveWebResult[] }
}

export async function searchPlatformJobs(
  platformId: JobPlatformId,
  profile: JobSearchProfile,
  userId: string
): Promise<Omit<JobInsert, "id">[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY
  if (!apiKey) {
    throw new Error(
      "BRAVE_SEARCH_API_KEY is not configured. Add it to .env.local."
    )
  }

  const platform = JOB_PLATFORMS.find((entry) => entry.id === platformId)
  if (!platform) {
    return []
  }

  const query = buildSearchQuery(platform.siteFilter, profile)
  const params = new URLSearchParams({ q: query, count: "20" })

  const response = await fetch(`${BRAVE_SEARCH_ENDPOINT}?${params}`, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Brave Search request failed (${response.status})`)
  }

  const payload = (await response.json()) as BraveSearchResponse
  const results = payload.web?.results ?? []
  const fetchedAt = new Date().toISOString()

  const jobs: Omit<JobInsert, "id">[] = []
  const seenUrls = new Set<string>()

  for (const result of results) {
    if (!result.url || !result.title) continue
    if (seenUrls.has(result.url)) continue
    seenUrls.add(result.url)

    const normalized = normalizeResult(result, platformId)
    if (!normalized) continue

    const description = result.description ? stripHtml(result.description) : ""
    const { score, matchedSkills } = computeMatchScore(
      profile,
      normalized.title,
      description
    )

    jobs.push({
      user_id: userId,
      platform: platformId,
      title: normalized.title,
      company: normalized.company,
      company_logo:
        result.profile?.img ??
        result.meta_url?.favicon ??
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostnameOf(result.url) ?? platform.domain)}&sz=64`,
      location: extractLocation(description, profile.location),
      salary: extractSalary(description),
      job_type: extractJobType(`${normalized.title} ${description}`),
      experience_level: extractExperienceLevel(
        `${normalized.title} ${description}`
      ),
      description: description || null,
      tags: matchedSkills.slice(0, 6),
      match_score: score,
      job_url: result.url,
      source_url: result.url,
      fetched_at: fetchedAt,
    })
  }

  return jobs
}

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
}

function normalizeResult(
  result: BraveWebResult,
  platformId: JobPlatformId
): { title: string; company: string } | null {
  const rawTitle = stripHtml(result.title ?? "")
  if (!rawTitle) return null

  const companyFromUrl = extractCompanyFromUrl(result.url ?? "", platformId)

  // Titles are commonly "Job Title - Company" or "Company - Job Title"
  const separators = [" - ", " – ", " | ", " at "]
  for (const separator of separators) {
    if (rawTitle.includes(separator)) {
      const [first, ...rest] = rawTitle.split(separator)
      const second = rest.join(separator)
      if (separator === " at ") {
        return { title: first.trim(), company: second.trim() }
      }
      return {
        title: first.trim(),
        company: companyFromUrl ?? second.trim(),
      }
    }
  }

  return { title: rawTitle, company: companyFromUrl ?? "Unknown company" }
}

function extractCompanyFromUrl(
  url: string,
  platformId: JobPlatformId
): string | null {
  try {
    const parsed = new URL(url)
    const segments = parsed.pathname.split("/").filter(Boolean)

    let slug: string | undefined
    switch (platformId) {
      case "greenhouse":
        // boards.greenhouse.io/<company>/jobs/<id>
        slug = segments[0] === "jobs" ? undefined : segments[0]
        break
      case "lever":
        // jobs.lever.co/<company>/<id>
        slug = segments[0]
        break
      case "workable":
        // apply.workable.com/<company>/j/<id>
        slug = segments[0]
        break
      case "wellfound":
        // wellfound.com/company/<company>/jobs or wellfound.com/jobs/<id>-<slug>
        slug = segments[0] === "company" ? segments[1] : undefined
        break
    }

    if (!slug || slug === "jobs" || slug === "j") return null
    return slug
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  } catch {
    return null
  }
}

function extractSalary(text: string): string | null {
  const range = text.match(
    /\$\s?\d{2,3}(?:,\d{3})?(?:k|K)?\s?(?:-|–|to)\s?\$?\s?\d{2,3}(?:,\d{3})?(?:k|K)?/
  )
  if (range) return range[0].replace(/\s+/g, " ").trim()

  const single = text.match(/\$\s?\d{2,3}(?:,\d{3})+(?:\s?(?:per year|\/yr|\/year|annually))?/)
  return single ? single[0].replace(/\s+/g, " ").trim() : null
}

function extractJobType(text: string): string | null {
  const lowered = text.toLowerCase()
  if (/\bpart[\s-]?time\b/.test(lowered)) return "Part-time"
  if (/\bcontract(or)?\b/.test(lowered)) return "Contract"
  if (/\bintern(ship)?\b/.test(lowered)) return "Internship"
  if (/\bfreelance\b/.test(lowered)) return "Freelance"
  if (/\bfull[\s-]?time\b/.test(lowered)) return "Full-time"
  if (/\bremote\b/.test(lowered)) return "Full-time"
  return null
}

function extractExperienceLevel(text: string): string | null {
  const lowered = text.toLowerCase()
  if (/\b(principal|staff)\b/.test(lowered)) return "Staff+"
  if (/\b(senior|sr\.?)\b/.test(lowered)) return "Senior"
  if (/\b(junior|jr\.?|entry[\s-]?level|graduate)\b/.test(lowered))
    return "Entry level"
  if (/\bmid[\s-]?level\b/.test(lowered)) return "Mid level"
  if (/\blead\b/.test(lowered)) return "Lead"
  return null
}

function extractLocation(
  description: string,
  preferredLocation: string
): string | null {
  const lowered = description.toLowerCase()
  if (
    preferredLocation &&
    lowered.includes(preferredLocation.toLowerCase())
  ) {
    return preferredLocation
  }
  if (lowered.includes("remote")) return "Remote"
  return null
}
