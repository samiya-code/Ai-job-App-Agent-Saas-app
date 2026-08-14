"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ResumeUploadZone } from "@/components/resume/resume-upload-zone"

type OnboardingDialogProps = {
  open: boolean
}

export function OnboardingDialog({ open }: OnboardingDialogProps) {
  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={() => {
        // Non-closable: ignore dismiss attempts
      }}
    >
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome! Upload your resume to get started</DialogTitle>
          <DialogDescription>
            We&apos;ll analyze your resume with AI to build your profile
            automatically. You can review and edit everything afterward.
          </DialogDescription>
        </DialogHeader>

        <ResumeUploadZone />
      </DialogContent>
    </Dialog>
  )
}
