// Next.js 16 Proxy — minden HTTP kérésnél lefut (korábbi neve: middleware)
// MIÉRT proxy.ts: Next.js 16.0.0-tól middleware.ts helyett proxy.ts a konvenció,
// a belépési függvény neve pedig proxy() lett.
// Ez a fájl szándékosan minimalista — az összes logika a lib/supabase/middleware.ts-ben van.
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

// Mely útvonalakon fusson a proxy — statikus fájlok és képek kizárva
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
