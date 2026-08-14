"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Briefcase01Icon,
  Coins01Icon,
  CreditCardIcon,
  File02Icon,
  Settings01Icon,
  TaskDone01Icon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const mainNavItems = [
  {
    title: "Jobs",
    href: "/dashboard/jobs",
    icon: Briefcase01Icon,
  },
  {
    title: "Resume",
    href: "/dashboard/resume",
    icon: File02Icon,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserAccountIcon,
  },
  {
    title: "Application Status",
    href: "/dashboard/application-status",
    icon: TaskDone01Icon,
  },
] as const

const footerNavItems = [
  {
    title: "Billing / Credits",
    href: "/dashboard/billing",
    icon: CreditCardIcon,
  },
  {
    title: "Profile Settings",
    href: "/dashboard/settings",
    icon: Settings01Icon,
  },
] as const

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

const navButtonClassName =
  "h-11 gap-3 px-3 text-sm font-medium group-data-[collapsible=icon]:size-10! [&_svg]:size-5"

function CreditsDisplay({ credits }: { credits: number }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-sidebar-border/80 bg-sidebar-accent/40 p-4",
        "group-data-[collapsible=icon]:hidden"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-sidebar-foreground/70">
          Credits
        </span>
        <HugeiconsIcon
          icon={Coins01Icon}
          strokeWidth={2}
          className="size-4 text-primary"
        />
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {credits.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-sidebar-foreground/60">
        Available balance
      </p>
    </div>
  )
}

export function AppSidebar({ credits = 100 }: { credits?: number }) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard/jobs" />}
              className="h-14 gap-3 px-3 group-data-[collapsible=icon]:size-11!"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
                AI
              </span>
              <div className="grid flex-1 text-left leading-snug">
                <span className="truncate text-base font-semibold">
                  JobBuddy AI
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  Job search assistant
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-2 px-1 py-2">
        <SidebarGroup className="py-2">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    tooltip={item.title}
                    isActive={isActiveRoute(pathname, item.href)}
                    className={navButtonClassName}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-3 p-3">
        <CreditsDisplay credits={credits} />
        <SidebarSeparator />
        <SidebarMenu className="gap-1.5">
          {footerNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                tooltip={item.title}
                isActive={isActiveRoute(pathname, item.href)}
                className={navButtonClassName}
              >
                <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
