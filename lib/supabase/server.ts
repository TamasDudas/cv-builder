// Szerver-oldali Supabase kliens (Server Components, Server Actions, Route Handlers)
// A cookies() aszinkron Next.js 15+ óta — mindig await-elni kell
// Laravel analógia: ez olyan mint a DB facade szerver-oldalon, session-aware
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            // Cookie írás Server Componentből nem lehetséges — csak Server Actionből
            // A try/catch azért kell, hogy ne dobjon hibát, ha Server Componentből hívják
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Szándékos: Server Component nem tud cookie-t írni
          }
        },
      },
    }
  )
}
