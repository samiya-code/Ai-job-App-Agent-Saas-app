import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { needsOnboarding } from "@/lib/profile/queries"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect("/sign-in")
  }

  const userId = data.claims.sub as string
  const showOnboarding = await needsOnboarding(userId)

  return (
    <DashboardShell needsOnboarding={showOnboarding}>{children}</DashboardShell>
  )
}
