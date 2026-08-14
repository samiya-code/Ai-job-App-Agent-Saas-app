import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ProfileCompleteness } from "@/lib/profile/utils"
import { cn } from "@/lib/utils"

export function ProfileCompletenessCard({
  completeness,
}: {
  completeness: ProfileCompleteness
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completeness</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Progress
            value={completeness.percent}
            className="flex-1 gap-0"
            aria-label="Profile completeness"
          />
          <span className="text-sm font-semibold tabular-nums">
            {completeness.percent}%
          </span>
        </div>
        <ul className="flex flex-col gap-2">
          {completeness.sections.map((section) => (
            <li
              key={section.label}
              className="flex items-center gap-2 text-xs"
            >
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                className={cn(
                  "size-4",
                  section.completed
                    ? "text-primary"
                    : "text-muted-foreground/40"
                )}
              />
              <span
                className={
                  section.completed ? undefined : "text-muted-foreground"
                }
              >
                {section.label}
              </span>
            </li>
          ))}
        </ul>
        {completeness.percent < 100 ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            render={<Link href="/dashboard/profile" />}
          >
            Complete your profile
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
