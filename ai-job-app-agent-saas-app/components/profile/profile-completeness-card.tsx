"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import type { ProfileFormInput } from "@/app/dashboard/profile/actions"
import { calculateProfileCompleteness } from "@/lib/profile/completeness"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circular-progress"
import { PROFILE_SECTIONS } from "@/components/profile/profile-sections"

type ProfileCompletenessCardProps = {
  form: ProfileFormInput
  className?: string
}

export function ProfileCompletenessCard({
  form,
  className,
}: ProfileCompletenessCardProps) {
  const { percent, sections } = calculateProfileCompleteness(form)
  const completeSections = sections.filter((s) => s.isComplete).length

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Profile completeness</CardTitle>
        <CardDescription>
          {completeSections} of {sections.length} sections complete. A complete
          profile improves your job matches.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6 sm:flex-row">
        <CircularProgress value={percent} size={104} strokeWidth={9}>
          <span className="text-xl font-semibold tabular-nums">
            {percent}%
          </span>
        </CircularProgress>
        <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
          {PROFILE_SECTIONS.map((meta) => {
            const status = sections.find((s) => s.key === meta.value)
            const isComplete = status?.isComplete ?? false
            return (
              <div
                key={meta.value}
                className={cn(
                  "flex items-center gap-1.5 text-xs",
                  isComplete ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <HugeiconsIcon
                  icon={isComplete ? CheckmarkCircle02Icon : meta.icon}
                  strokeWidth={2}
                  className={cn(
                    "size-3.5 shrink-0",
                    isComplete && "text-primary"
                  )}
                />
                <span className="truncate">{meta.label}</span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
