"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { CheckmarkCircle02Icon, CircleIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CircularProgress } from "@/components/ui/circular-progress"

export type CompletenessItem = {
  key: string
  label: string
  fraction: number
  icon?: IconSvgElement
}

type ProfileCompletenessCardProps = {
  percent: number
  items: CompletenessItem[]
  title?: string
  description?: string
  className?: string
}

export function ProfileCompletenessCard({
  percent,
  items,
  title = "Profile completeness",
  description = "Complete your profile to get better job matches and tailored resumes.",
  className,
}: ProfileCompletenessCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <CircularProgress value={percent} size={112} strokeWidth={9}>
            <span className="text-2xl font-semibold tabular-nums">
              {percent}%
            </span>
          </CircularProgress>
          <div className="grid flex-1 grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-4">
            {items.map((item) => {
              const complete = item.fraction >= 1
              return (
                <div
                  key={item.key}
                  className={cn(
                    "flex items-center gap-1.5 text-xs",
                    complete ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  <HugeiconsIcon
                    icon={complete ? CheckmarkCircle02Icon : CircleIcon}
                    strokeWidth={2}
                    className={cn(
                      "size-3.5 shrink-0",
                      complete ? "text-primary" : "text-muted-foreground/60"
                    )}
                  />
                  {item.icon ? (
                    <HugeiconsIcon
                      icon={item.icon}
                      strokeWidth={2}
                      className="size-3.5 shrink-0"
                    />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
