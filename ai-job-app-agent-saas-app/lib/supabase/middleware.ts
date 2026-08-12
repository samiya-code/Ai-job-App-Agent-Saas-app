import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          )
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const user = data?.claims
  const { pathname } = request.nextUrl

  const isAuthRoute =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")
  const isProtectedRoute = pathname.startsWith("/dashboard")
  const isAuthCallback = pathname.startsWith("/auth")

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  if (!user && !isAuthRoute && !isAuthCallback && pathname !== "/") {
    // Allow public pages; only dashboard is protected.
  }

  return supabaseResponse
}
