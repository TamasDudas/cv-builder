// Session frissítő helper — a proxy.ts (gyökér) importálja
// MIÉRT: A Supabase auth token-t minden kérésnél frissíteni kell,
// különben a session lejár. A getUser() hívás biztosítja ezt.
// Laravel analógia: mint egy middleware ami minden kérésnél refresheli a session-t
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Cookie-t először a request-re írjuk, majd az új response-ra is
          // Így mindkét irányban szinkronban marad a session
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

  // FONTOS: Ne írj semmit a createServerClient és az alábbi getUser() közé!
  // A getUser() szerver-oldalon validálja a tokent — ez a session frissítés lényege
  await supabase.auth.getUser()

  return supabaseResponse
}
