"use client"

import { useState, useTransition } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Download04Icon,
  FileAttachmentIcon,
} from "@hugeicons/core-free-icons"

import {
  deleteResume,
  getResumeDownloadUrl,
} from "@/app/dashboard/profile/actions"
import type { Resume } from "@/lib/supabase/database.types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ResumeUploadZone } from "@/components/resume/resume-upload-zone"
import { Spinner } from "@/components/ui/spinner"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseStatusBadge(status: Resume["parse_status"]) {
  switch (status) {
    case "completed":
      return <Badge variant="secondary">Parsed</Badge>
    case "processing":
      return <Badge variant="outline">Processing</Badge>
    case "pending":
      return <Badge variant="outline">Pending</Badge>
    case "failed":
      return <Badge variant="destructive">Failed</Badge>
  }
}

type ResumeListProps = {
  resumes: Resume[]
}

export function ResumeList({ resumes }: ResumeListProps) {
  const [isPending, startTransition] = useTransition()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  const handleDownload = (resumeId: string) => {
    setDownloadingId(resumeId)
    startTransition(async () => {
      const result = await getResumeDownloadUrl(resumeId)
      setDownloadingId(null)

      if (result.error || !result.url) {
        toast.error(result.error ?? "Download failed")
        return
      }

      window.open(result.url, "_blank")
    })
  }

  const handleDelete = (resumeId: string) => {
    startTransition(async () => {
      const result = await deleteResume(resumeId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Resume deleted")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload a new resume</CardTitle>
          <CardDescription>
            Upload an updated resume to refresh your profile information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResumeUploadZone compact />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Your resumes</h2>

        {resumes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <HugeiconsIcon
                icon={FileAttachmentIcon}
                className="mb-3 size-10 text-muted-foreground"
                strokeWidth={1.5}
              />
              <p className="text-sm text-muted-foreground">
                No resumes uploaded yet. Upload your first resume above.
              </p>
            </CardContent>
          </Card>
        ) : (
          resumes.map((resume) => (
            <Card key={resume.id}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <HugeiconsIcon icon={FileAttachmentIcon} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">{resume.file_name}</p>
                      {parseStatusBadge(resume.parse_status)}
                      {resume.is_primary && (
                        <Badge variant="outline">Primary</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Uploaded {format(new Date(resume.created_at), "MMM d, yyyy")} ·{" "}
                      {formatFileSize(resume.file_size)}
                    </p>
                    {resume.parse_error && (
                      <p className="mt-1 text-xs text-destructive">{resume.parse_error}</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isPending || downloadingId === resume.id}
                    onClick={() => handleDownload(resume.id)}
                  >
                    {downloadingId === resume.id ? (
                      <Spinner />
                    ) : (
                      <HugeiconsIcon icon={Download04Icon} strokeWidth={2} />
                    )}
                    Download
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button variant="destructive" size="sm" disabled={isPending} />
                      }
                    >
                      <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                      Delete
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete resume?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete &quot;{resume.file_name}&quot; from
                          storage. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(resume.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
