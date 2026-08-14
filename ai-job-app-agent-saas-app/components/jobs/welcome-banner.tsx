import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"

export function WelcomeBanner({
  name,
  matchCount,
}: {
  name: string | null
  matchCount: number
}) {
  const firstName = name?.split(" ")[0]

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back{firstName ? `, ${firstName}` : ""} 
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            {matchCount > 0
              ? `We found ${matchCount} job ${matchCount === 1 ? "match" : "matches"} based on your profile. Select platforms below to refine your search.`
              : "Select job platforms below and we'll find matches based on your skills, experience, and preferences."}
          </p>
        </div>
        <div className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:flex">
          <HugeiconsIcon
            icon={SparklesIcon}
            strokeWidth={2}
            className="size-6 text-primary"
          />
        </div>
      </div>
    </div>
  )
}
