// Böngészőben futó Supabase kliens (Client Componentekben használandó)
// Laravel analógia: ez olyan mint a DB facade, csak client-side
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
