// Next.js 16 Proxy (korábbi neve: middleware) — minden kérésnél lefut
// MIÉRT proxy.ts és nem middleware.ts: Next.js 16.0.0-tól a middleware.ts deprecated,
// az új neve proxy.ts, a függvény neve proxy(). Ugyanaz a funkció, csak átnevezve.
// Laravel analógia: mint a globális HTTP middleware (Kernel.php-ban regisztrált)
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

// A matcher megmondja, mely útvonalakon fusson le a proxy
// Kizárjuk a statikus fájlokat és képeket a felesleges feldolgozás elkerülésére
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
