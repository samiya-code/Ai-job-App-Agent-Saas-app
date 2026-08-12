"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? <Spinner className="size-3.5" /> : "Sign out"}
    </Button>
  )
}
