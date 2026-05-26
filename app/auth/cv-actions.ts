'use server'

// CV-hez kapcsolódó Server Action-ök
// MIÉRT Server Action: az adatbázis műveletek szerveroldalon futnak,
// a Supabase kulcs nem kerül ki a kliensre, és az RLS policy érvényesül.

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { defaultCVData } from '@/lib/types/cv'

// --- Új CV létrehozása és az editor-ra irányítás ---
export async function createCV() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Alapértelmezett CV adatot szúrunk be
  const { data, error } = await supabase
    .from('cvs')
    .insert({
      user_id: user.id,
      title: 'Névtelen önéletrajz',
      data: defaultCVData,
      template: 'default',
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error('Nem sikerült létrehozni az önéletrajzot.')
  }

  // Dashboard cache frissítése és átirányítás az editorba
  revalidatePath('/dashboard')
  redirect(`/editor/${data.id}`)
}

// --- CV cím átnevezése ---
export async function renameCV(id: string, title: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('cvs')
    .update({ title })
    .eq('id', id)

  if (error) throw new Error('Átnevezés sikertelen.')

  revalidatePath('/dashboard')
}

// --- CV törlése ---
export async function deleteCV(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('cvs').delete().eq('id', id)

  if (error) throw new Error('Törlés sikertelen.')

  revalidatePath('/dashboard')
}
