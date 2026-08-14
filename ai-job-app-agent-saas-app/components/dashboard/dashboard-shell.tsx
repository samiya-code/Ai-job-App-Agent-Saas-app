"use client"

import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function DashboardShell({
  children,
  needsOnboarding = false,
}: {
  children: React.ReactNode
  needsOnboarding?: boolean
}) {
  return (
    <TooltipProvider delay={0}>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset className="min-h-svh">
          <DashboardHeader />
          <div className="flex flex-1 flex-col">{children}</div>
        </SidebarInset>
      </SidebarProvider>
      <OnboardingDialog open={needsOnboarding} />
    </TooltipProvider>
  )
}
