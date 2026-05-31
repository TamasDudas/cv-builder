// OAuth / Magic Link callback kezelő — Route Handler
// MIÉRT: A Supabase OAuth flow egy "code" paramétert küld vissza erre az URL-re.
// Ezt a kódot kell PKCE flow keretében "beváltani" egy valódi sessionre.
// Magic Link és Social Login (Google, GitHub stb.) esetén is ide irányít a Supabase.
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  // A Supabase az auth code-ot és az opcionális next paramétert adja át
  const code = searchParams.get('code')
  const nextParam = searchParams.get('next') ?? '/dashboard'

  // MIÉRT: A "next" paramétert validálni kell, különben open redirect támadás lehetséges.
  // Csak az alkalmazáson belüli (relatív) útvonalakat engedjük meg.
  const isSafeRedirect = nextParam.startsWith('/') && !nextParam.startsWith('//')
  const next = isSafeRedirect ? nextParam : '/dashboard'

  if (code) {
    const supabase = await createClient()

    // PKCE (Proof Key for Code Exchange): a code-ot beváltjuk sessionre
    // MIÉRT: Ez biztonságosabb mint az implicit flow — a token csak szerver-oldalon cserélődik
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Sikeres bejelentkezés — átirányítás a dashboard-ra (vagy a validált "next" értékre)
      return NextResponse.redirect(new URL(next, origin))
    }
  }

  // Hiba esetén visszairányítjuk a login oldalra hibaüzenettel
  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent('A hitelesítés nem sikerült. Kérjük, próbáld újra.')}`
  )
}
