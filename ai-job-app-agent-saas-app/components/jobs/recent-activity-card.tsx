import { formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Bookmark01Icon,
  Clock01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Job } from "@/lib/supabase/database.types"

export function RecentActivityCard({
  activity,
  lastFetchedAt,
}: {
  activity: Job[]
  lastFetchedAt: string | null
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {lastFetchedAt ? (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={Clock01Icon}
              strokeWidth={2}
              className="mt-0.5 size-4 shrink-0"
            />
            <span>
              Jobs refreshed{" "}
              {formatDistanceToNow(new Date(lastFetchedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
        ) : null}
        {activity.length === 0 && !lastFetchedAt ? (
          <p className="text-xs text-muted-foreground">
            No activity yet. Save or apply to jobs to see them here.
          </p>
        ) : null}
        {activity.map((job) => (
          <div key={job.id} className="flex items-start gap-2 text-xs">
            <HugeiconsIcon
              icon={job.applied_status ? SentIcon : Bookmark01Icon}
              strokeWidth={2}
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <div className="min-w-0">
              <p className="truncate font-medium">
                {job.applied_status ? "Applied to" : "Saved"} {job.title}
              </p>
              <p className="truncate text-muted-foreground">
                {job.company} ·{" "}
                {formatDistanceToNow(new Date(job.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
