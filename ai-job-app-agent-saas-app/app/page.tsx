import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted via-background to-background"
      />

      <div className="relative z-10 mx-auto max-w-2xl space-y-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          AI-powered job search
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Find your next role with an intelligent job agent
          </h1>
          <p className="mx-auto max-w-lg text-base text-muted-foreground">
            Automate applications, tailor your resume, and track every
            opportunity from a single dashboard.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/sign-up">
            <Button size="lg" className="h-10 min-w-36 px-6">
              Get started
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button variant="outline" size="lg" className="h-10 min-w-36 px-6">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
