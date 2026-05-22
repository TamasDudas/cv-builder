'use server'

// Server Actions az auth műveletekhez
// MIÉRT Server Action és nem API route?
// Server Action-ök közvetlenül a szerveren futnak, nincs szükség külön fetch hívásra.
// Biztonságosabb (nem kerül ki a logika kliens-oldalra) és egyszerűbb form kezelés.

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ---------- Bejelentkezés ----------
// useActionState miatt az első paraméter a prevState (nem használjuk, de kell)
export async function login(_prevState: null | void, formData: FormData) {
  const supabase = await createClient()

  // FormData-ból kiolvassuk az értékeket
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Hibakódot query param-ként adjuk vissza — az oldal ebből jeleníti meg az üzenetet
    redirect(`/auth/login?error=${encodeURIComponent(mapAuthError(error.message))}`)
  }

  // Sikeres bejelentkezés után frissítjük a cache-t és átirányítunk
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ---------- Regisztráció ----------
// useActionState miatt az első paraméter a prevState (nem használjuk, de kell)
export async function register(_prevState: null | void, formData: FormData) {
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
    redirect(`/auth/register?error=${encodeURIComponent(mapAuthError(error.message))}`)
  }

  // Ha az e-mail megerősítés be van kapcsolva Supabase-ben,
  // erről tájékoztatjuk a felhasználót
  redirect('/auth/login?message=Erősítsd+meg+az+e-mail+címedet+a+bejelentkezés+előtt.')
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
