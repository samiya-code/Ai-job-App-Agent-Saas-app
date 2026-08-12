import Link from "next/link"

import { cn } from "@/lib/utils"

type AuthLayoutProps = {
  children: React.ReactNode
  title: string
  description: string
  footer?: React.ReactNode
}

export function AuthLayout({
  children,
  title,
  description,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-10 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-700/40 via-zinc-950 to-zinc-950"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-white/5 blur-3xl"
        />
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              AI
            </span>
            Job Agent
          </Link>
        </div>
        <div className="relative z-10 max-w-md space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Land your next role with an AI-powered job search agent.
          </h2>
          <p className="text-sm leading-relaxed text-zinc-400">
            Track applications, tailor resumes, and automate outreach — all from
            one dashboard built for modern job seekers.
          </p>
        </div>
        <p className="relative z-10 text-xs text-zinc-500">
          © {new Date().getFullYear()} Job Agent. All rights reserved.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-12 sm:px-10">
        <div className="mb-8 w-full max-w-sm lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              AI
            </span>
            Job Agent
          </Link>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center lg:text-left">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className={cn("rounded-xl border bg-card p-6 shadow-sm")}>
            {children}
          </div>

          {footer && (
            <p className="text-center text-sm text-muted-foreground">{footer}</p>
          )}
        </div>
      </div>
    </div>
  )
}
