"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { SignOutButton } from "@/components/auth/sign-out-button"

export function DashboardHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-6 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-end">
        <SignOutButton />
      </div>
    </header>
  )
}
