"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

import { JOB_PLATFORMS, type JobPlatformId } from "@/lib/jobs/platforms"
import { cn } from "@/lib/utils"

const platformStyles: Record<
  JobPlatformId,
  { badge: string; monogram: string }
> = {
  greenhouse: {
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    monogram: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  },
  lever: {
    badge: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    monogram: "bg-slate-500/15 text-slate-600 dark:text-slate-300",
  },
  workable: {
    badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    monogram: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  },
  wellfound: {
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    monogram: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  },
}

export function platformBadgeClass(platformId: string): string {
  return (
    platformStyles[platformId as JobPlatformId]?.badge ??
    "bg-muted text-muted-foreground"
  )
}

export function PlatformCards({
  selected,
  onToggle,
  disabled = false,
}: {
  selected: JobPlatformId[]
  onToggle: (platform: JobPlatformId) => void
  disabled?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {JOB_PLATFORMS.map((platform) => {
        const isSelected = selected.includes(platform.id)
        return (
          <button
            key={platform.id}
            type="button"
            disabled={disabled}
            onClick={() => onToggle(platform.id)}
            aria-pressed={isSelected}
            className={cn(
              "relative flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
              "hover:border-primary/50 hover:shadow-sm disabled:pointer-events-none disabled:opacity-60",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "bg-card"
            )}
          >
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold",
                platformStyles[platform.id].monogram
              )}
            >
              {platform.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{platform.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {platform.domain}
              </p>
            </div>
            {isSelected ? (
              <span className="absolute top-2 right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <HugeiconsIcon
                  icon={Tick02Icon}
                  strokeWidth={3}
                  className="size-3"
                />
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
