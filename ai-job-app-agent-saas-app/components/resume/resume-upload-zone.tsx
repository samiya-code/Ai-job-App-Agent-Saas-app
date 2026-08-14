"use client"

import { useCallback, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileAttachmentIcon,
  Upload04Icon,
} from "@hugeicons/core-free-icons"

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

type UploadState = "idle" | "uploading" | "processing" | "error" | "done"

type ResumeUploadZoneProps = {
  onSuccess?: () => void
  className?: string
  compact?: boolean
}

export function ResumeUploadZone({
  onSuccess,
  className,
  compact = false,
}: ResumeUploadZoneProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null)
      setFileName(file.name)
      setState("uploading")

      const formData = new FormData()
      formData.append("file", file)

      try {
        setState("processing")
        const response = await fetch("/api/resumes/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error ?? "Upload failed")
        }

        setState("done")
        onSuccess?.()
        router.refresh()
      } catch (err) {
        setState("error")
        setError(err instanceof Error ? err.message : "Upload failed")
      }
    },
    [onSuccess, router]
  )

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      void uploadFile(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) {
      void uploadFile(file)
    }
  }

  const isBusy = state === "uploading" || state === "processing"

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            inputRef.current?.click()
          }
        }}
        onClick={() => !isBusy && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30",
          isBusy && "pointer-events-none opacity-70",
          compact && "p-6"
        )}
      >
        {isBusy ? (
          <Spinner className="mb-3 size-8" />
        ) : (
          <HugeiconsIcon
            icon={Upload04Icon}
            className="mb-3 size-8 text-muted-foreground"
            strokeWidth={1.5}
          />
        )}

        <p className="text-sm font-medium">
          {state === "uploading"
            ? "Uploading resume..."
            : state === "processing"
              ? "Analyzing with AI..."
              : "Drop your resume here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF or Word document, up to 5MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileChange}
          disabled={isBusy}
        />
      </div>

      {fileName && (
        <Attachment
          state={state === "idle" ? "done" : state}
          className="w-full max-w-full"
        >
          <AttachmentMedia>
            {isBusy ? (
              <Spinner />
            ) : (
              <HugeiconsIcon icon={FileAttachmentIcon} strokeWidth={2} />
            )}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{fileName}</AttachmentTitle>
            <AttachmentDescription>
              {state === "uploading" && "Uploading to storage..."}
              {state === "processing" && "Extracting profile information..."}
              {state === "done" && "Resume parsed successfully"}
              {state === "error" && (error ?? "Something went wrong")}
            </AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      )}

      {state === "error" && (
        <Button
          variant="outline"
          onClick={() => {
            setState("idle")
            setError(null)
            setFileName(null)
            inputRef.current?.click()
          }}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
