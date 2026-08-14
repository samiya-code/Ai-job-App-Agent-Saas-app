"use client"

import { useState, useTransition } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Bookmark01Icon,
  BookmarkCheck01Icon,
  Briefcase01Icon,
  ChartLineData01Icon,
  LinkSquare02Icon,
  Location01Icon,
  Money01Icon,
} from "@hugeicons/core-free-icons"

import { toggleSaveJob } from "@/app/dashboard/jobs/actions"
import { platformBadgeClass } from "@/components/jobs/platform-cards"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Job } from "@/lib/supabase/database.types"
import { cn } from "@/lib/utils"

function jobTags(job: Job): string[] {
  if (!Array.isArray(job.tags)) return []
  return job.tags.filter((tag): tag is string => typeof tag === "string")
}

export function JobCard({ job }: { job: Job }) {
  const [saved, setSaved] = useState(job.saved_status)
  const [isPending, startTransition] = useTransition()

  const tags = jobTags(job)

  function handleSave() {
    const next = !saved
    setSaved(next)
    startTransition(async () => {
      const result = await toggleSaveJob(job.id, next)
      if (result.error) {
        setSaved(!next)
      }
    })
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="size-12 rounded-lg border">
            {job.company_logo ? (
              <AvatarImage
                src={job.company_logo}
                alt={job.company}
                className="rounded-lg object-contain"
              />
            ) : null}
            <AvatarFallback className="rounded-lg text-sm font-semibold">
              {job.company.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight">
                {job.title}
              </h3>
              <Badge className={cn("capitalize", platformBadgeClass(job.platform))}>
                {job.platform}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{job.company}</p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {job.location ? (
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  {job.location}
                </span>
              ) : null}
              {job.salary ? (
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Money01Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  {job.salary}
                </span>
              ) : null}
              {job.job_type ? (
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Briefcase01Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  {job.job_type}
                </span>
              ) : null}
              {job.experience_level ? (
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon
                    icon={ChartLineData01Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                  {job.experience_level}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {job.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {job.description}
          </p>
        ) : null}

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-56">
            <Progress
              value={job.match_score}
              className="flex-1 gap-0"
              aria-label="Match score"
            />
            <span className="text-sm font-semibold whitespace-nowrap text-primary tabular-nums">
              {job.match_score}% match
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={saved ? "secondary" : "outline"}
              size="sm"
              onClick={handleSave}
              disabled={isPending}
            >
              <HugeiconsIcon
                icon={saved ? BookmarkCheck01Icon : Bookmark01Icon}
                strokeWidth={2}
                className="size-4"
              />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button
              size="sm"
              render={
                <a
                  href={job.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Apply Now
              <HugeiconsIcon
                icon={LinkSquare02Icon}
                strokeWidth={2}
                className="size-4"
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
