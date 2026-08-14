import { redirect } from "next/navigation"

import { PageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "@/components/profile/profile-form"
import { getProfileData } from "@/lib/profile/queries"
import { createClient } from "@/lib/supabase/server"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getClaims()
  const userId = authData?.claims?.sub

  if (!userId) {
    redirect("/sign-in")
  }

  const profileData = await getProfileData(userId)

  if (!profileData) {
    redirect("/sign-in")
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Your professional profile and preferences."
      />
      <div className="flex flex-1 flex-col px-6 py-8">
        <ProfileForm initialData={profileData} />
      </div>
    </>
  )
}
