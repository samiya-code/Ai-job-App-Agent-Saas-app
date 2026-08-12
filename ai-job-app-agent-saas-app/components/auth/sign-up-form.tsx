"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { AuthLayout } from "@/components/auth/auth-layout"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"

export function SignUpForm() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push("/sign-in?message=Check your email to confirm your account")
  }

  return (
    <AuthLayout
      title="Create an account"
      description="Start your AI-powered job search journey"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fullName">Full name</FieldLabel>
            <Input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={loading}
            />
          </Field>

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
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={loading}
            />
            <FieldDescription>Use at least 6 characters.</FieldDescription>
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" className="h-9 w-full" disabled={loading}>
            {loading ? <Spinner className="size-4" /> : "Create account"}
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
