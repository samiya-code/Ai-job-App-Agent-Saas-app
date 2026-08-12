"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth/auth-layout"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

export function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedRedirect = searchParams.get("redirectTo")
  const redirectTo =
    requestedRedirect?.startsWith("/") && !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : "/dashboard"
  const message = searchParams.get("message")
  const callbackError = searchParams.get("error")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(redirectTo)
    router.refresh()
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to your dashboard"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldGroup>
          {message && (
            <p
              className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-300"
              role="status"
            >
              {message}
            </p>
          )}

          {callbackError && (
            <FieldError>
              We could not complete that sign-in. Please try again.
            </FieldError>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
            />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
            />
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" className="h-9 w-full" disabled={loading}>
            {loading ? <Spinner className="size-4" /> : "Sign in"}
          </Button>
        </FieldGroup>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            or
          </span>
        </div>

        <GoogleSignInButton />
      </form>
    </AuthLayout>
  )
}
