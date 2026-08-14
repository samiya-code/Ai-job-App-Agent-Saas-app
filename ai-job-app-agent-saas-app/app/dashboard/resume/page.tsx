import { redirect } from "next/navigation"

import { PageHeader } from "@/components/dashboard/page-header"
import { ResumeList } from "@/components/resume/resume-list"
import { getUserResumes } from "@/lib/profile/queries"
import { createClient } from "@/lib/supabase/server"

export default async function ResumePage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub

  if (!userId) {
    redirect("/sign-in")
  }

  const resumes = await getUserResumes(userId)

  return (
    <>
      <PageHeader
        title="Resume"
        description="Build and tailor your resume for each application."
      />
      <div className="flex flex-1 flex-col px-6 py-8">
        <ResumeList resumes={resumes} />
      </div>
    </>
  )
}
