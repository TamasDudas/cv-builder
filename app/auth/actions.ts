'use server'

// Server Actions az auth műveletekhez
// MIÉRT Server Action és nem API route?
// Server Action-ök közvetlenül a szerveren futnak, nincs szükség külön fetch hívásra.
// Biztonságosabb (nem kerül ki a logika kliens-oldalra) és egyszerűbb form kezelés.

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// A Server Action visszatérési típusa — MIÉRT: useActionState megköveteli,
// hogy az action state-et adjon vissza redirect() helyett, különben
// "unexpected response" hibát dob Next.js-ben
export type AuthActionState = {
  error?: string
  message?: string
} | null

// ---------- Bejelentkezés ----------
export async function login(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: mapAuthError(error.message) }
  }

  // Sikeres bejelentkezés után frissítjük a cache-t és átirányítunk
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ---------- Regisztráció ----------
export async function register(_prevState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Felhasználói metaadatok — a profiles táblába kerül trigger által
      data: { full_name: fullName },
    },
  })

  if (error) {
    return { error: mapAuthError(error.message) }
  }

  // MIÉRT return és nem redirect: useActionState-ben a redirect() hibát okoz,
  // ezért state-ként adjuk vissza a sikerüzenetet, amit a form jelenít meg
  return { message: 'Erősítsd meg az e-mail címedet a bejelentkezés előtt.' }
}

// ---------- Kijelentkezés ----------
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

// ---------- Hibaüzenet fordítás ----------
// MIÉRT: A Supabase angol üzeneteket ad vissza — ezt fordítjuk magyarra
function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return 'Hibás e-mail cím vagy jelszó.'
  }
  if (message.includes('Email not confirmed')) {
    return 'Az e-mail cím még nincs megerősítve. Ellenőrizd a postaládádat.'
  }
  if (message.includes('User already registered')) {
    return 'Ez az e-mail cím már regisztrálva van.'
  }
  if (message.includes('Password should be at least')) {
    return 'A jelszónak legalább 6 karakter hosszúnak kell lennie.'
  }
  if (message.includes('rate limit')) {
    return 'Túl sok próbálkozás. Kérjük, várj egy kicsit.'
  }
  // Ismeretlen hiba esetén az eredeti üzenetet adjuk vissza
  return message
}
