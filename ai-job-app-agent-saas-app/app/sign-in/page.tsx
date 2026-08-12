import { Suspense } from "react"
import { SignInForm } from "@/components/auth/sign-in-form"
import { Spinner } from "@/components/ui/spinner"

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Spinner className="size-6" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  )
}
