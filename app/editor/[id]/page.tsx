// CV szerkesztő oldal — Server Component
// MIÉRT Server Component: az auth ellenőrzés és az adatbázis lekérés
// szerveroldalon történik → nem kerül ki szenzitív adat a kliensre.

import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CVEditor } from '@/components/editor/cv-editor';
import { CVData, defaultCVData } from '@/lib/types/cv';

interface EditorPageProps {
 params: Promise<{ id: string }>;
}

export default async function EditorPage({ params }: EditorPageProps) {
 const { id } = await params;
 const supabase = await createClient();

 // Auth ellenőrzés — a middleware már védi az oldalt,
 // de itt is dupla biztonsági réteg
 const {
  data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
  redirect('/auth/login');
 }

 // CV lekérése az adatbázisból
 // MIÉRT .eq('user_id', user.id): az RLS policy ugyan már szűr,
 // de explicit megadjuk, hogy csak a user saját CV-jét kapja meg
 // MIÉRT template is: a sablon választás az adatbázisban tárolódik,
 // az editor induláskor betölti és megmutatja az utoljára választott sablont
 const { data: cv, error } = await supabase
  .from('cvs')
  .select('id, title, data, template')
  .eq('id', id)
  .eq('user_id', user.id)
  .single();

 // Ha nem található a CV vagy nem a user-é → 404
 if (error || !cv) {
  notFound();
 }

 // Az adatbázisból JSONB-ként jön vissza, típusellenőrzés szükséges
 const cvData = (cv.data as CVData) ?? defaultCVData;

 return (
  <CVEditor
   cvId={cv.id}
   initialTitle={cv.title}
   initialData={cvData}
   initialTemplate={cv.template ?? 'modern'}
  />
 );
}

// Oldal metaadata — a tab-ban és Google-ben megjelenik
export async function generateMetadata({ params }: EditorPageProps) {
 const { id } = await params;
 return {
  title: `CV szerkesztő — ${id.slice(0, 8)}...`,
 };
}
