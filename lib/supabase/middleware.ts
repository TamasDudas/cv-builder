// Supabase session kezelő + route védelem helper
// MIÉRT ide kerül a logika és nem a middleware.ts-be?
// Single Responsibility Principle: a middleware.ts feladata csak az, hogy
// meghívja ezt a függvényt. Az auth logika itt van egy helyen, könnyen tesztelhető.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Supabase kliens létrehozása — cookie-alapú session kezelés
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Cookie szinkronizálás: request → response irányba
          // Így a frissített token mindkét helyen érvényes lesz
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // FONTOS: Ne írj kódot a createServerClient és a getUser() közé!
  // getUser() validálja a tokent a Supabase szerveren — ez frissíti a sessiont
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // 🔧 PROJEKT-SPECIFIKUS: nyilvános útvonalak listája
  // Ezeket az útvonalakat bejelentkezés nélkül is el lehet érni
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth/')

  // Nincs session + védett oldal → login oldalra irányítás
  if (!user && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 🔧 PROJEKT-SPECIFIKUS: bejelentkezés utáni céloldal
  // Be van jelentkezve + auth oldalon van (kivéve callback) → átirányítás
  if (user && pathname.startsWith('/auth/') && !pathname.startsWith('/auth/callback')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
