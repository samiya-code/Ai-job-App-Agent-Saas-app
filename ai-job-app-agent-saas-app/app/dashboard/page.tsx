import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (!data?.claims) {
    redirect("/sign-in")
  }

  const userId = data.claims.sub as string
  const email = (data.claims.email as string | undefined) ?? "User"

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, created_at")
    .eq("id", userId)
    .single()

  const displayName = profile?.full_name ?? email.split("@")[0]

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-medium">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
              AI
            </span>
            Job Agent
          </Link>
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">
            Your AI job search dashboard is ready.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>Track jobs you&apos;ve applied to</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interviews</CardTitle>
              <CardDescription>Upcoming and completed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent runs</CardTitle>
              <CardDescription>Automated outreach this week</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">0</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Signed in as {profile?.email ?? email}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" disabled>
              Settings coming soon
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
