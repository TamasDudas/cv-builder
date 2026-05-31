// Dashboard oldal — Server Component
// Megmutatja a bejelentkezett felhasználó mentett CV-jeit
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/auth/actions';
import { createCV } from '@/app/auth/cv-actions';
import { FileText, Plus, LogOut, Pencil } from 'lucide-react';
import Link from 'next/link';
import { CVCardActions } from '@/components/dashboard/cv-card-actions';

export default async function DashboardPage() {
 const supabase = await createClient();

 // Bejelentkezett user lekérése — ha nincs session, a proxy már átirányít,
 // de dupla ellenőrzésként itt is vizsgáljuk
 const {
  data: { user },
 } = await supabase.auth.getUser();

 if (!user) {
  redirect('/auth/login');
 }

 // A felhasználó neve a metaadatokból (regisztrációnál mentettük el)
 const fullName = user.user_metadata?.full_name as string | undefined;

 // CV-k lekérése az adatbázisból
 // MIÉRT szerver oldalon: az RLS policy csak a user saját CV-jeit adja vissza,
 // és nem kell client-side fetch — a szerver közvetlenül lekéri
 // MIÉRT .eq('user_id', user.id): az RLS policy önmagában is szűr,
 // de explicit feltétel nélkül egy jövőbeli konfigurációs hiba az összes CV-t visszaadhatná.
 const { data: cvs } = await supabase
  .from('cvs')
  .select('id, title, updated_at')
  .eq('user_id', user.id)
  .order('updated_at', { ascending: false });

 return (
  <div className="min-h-screen bg-slate-100">
   {/* Fejléc navigáció */}
   <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
    <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
     <Link
      href="/"
      className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
     >
      {/* Logo ikon — slate gradiens háttér */}
      <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-r from-slate-800 to-slate-400 text-white">
       <FileText className="size-4" />
      </div>
      {/* "CV Builder" szöveg — slate gradiens */}
      <span className="bg-linear-to-r from-slate-800 to-slate-400 bg-clip-text text-transparent">
       CV Builder
      </span>
     </Link>

     <div className="flex items-center gap-3">
      {/* Felhasználó neve */}
      {fullName && (
       <span className="text-sm text-muted-foreground hidden sm:block">
        {fullName}
       </span>
      )}
      {/* Kijelentkezés — Server Action-t hívunk form-on keresztül */}
      <form action={logout}>
       <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-slate-600 hover:text-slate-900"
       >
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Kijelentkezés</span>
       </Button>
      </form>
     </div>
    </div>
   </header>

   {/* Főtartalom */}
   <main className="mx-auto max-w-5xl px-4 py-8">
    <div className="flex items-center justify-between mb-6">
     <div>
      {/* Üdvözlő cím — slate gradiens */}
      <h1 className="text-2xl font-bold bg-linear-to-r from-sky-800 to-sky-500 bg-clip-text text-transparent">
       {fullName ? `Szia, ${fullName.split(' ')[1]}!` : 'Dashboard'}
      </h1>
      <p className="text-chart-3 text-sm mt-1">
       Kezeld és szerkeszd az önéletrajzaidat
      </p>
     </div>

     {/* Új CV gomb — Server Action hívja a createCV függvényt */}
     {/* MIÉRT form + action: Server Action-t nem lehet egyszerű href-ként hívni,
              form-on keresztül kell, ami a szerveren fut */}
     <form action={createCV}>
      <Button
       size="sm"
       type="submit"
       className="bg-linear-to-r! from-slate-800 to-slate-400 border-0 hover:opacity-90 transition-opacity text-white"
      >
       <Plus className="size-4" />
       Új CV
      </Button>
     </form>
    </div>

    {/* CV lista vagy üres állapot */}
    {cvs && cvs.length > 0 ? (
     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cvs.map((cv) => (
       <div
        key={cv.id}
        className="rounded-xl border bg-slate-100 p-4 flex flex-col gap-3 shadow-xl hover:border-chart-3 transition-all duration-200 "
       >
        <div className="flex items-start justify-between gap-2">
         <div className="flex items-center gap-2 min-w-0">
          <FileText className="size-5 text-slate-600 shrink-0" />
          <span className="font-medium text-sm truncate text-slate-800">
           {cv.title}
          </span>
         </div>
         {/* Törlés gomb — megerősítő dialoggal és toast visszajelzéssel */}
         <CVCardActions cvId={cv.id} cvTitle={cv.title} />
        </div>
        {/* MIÉRT timeZone 'UTC': a Vercel szerver UTC-ben fut, a böngésző más
                    időzónában lehet → ha nem rögzítjük, a szerver és kliens különböző
                    dátumot formázhat, ami React hydration mismatch-et okoz */}
        <p className="text-xs text-muted-foreground">
         Módosítva:{' '}
         {new Date(cv.updated_at).toLocaleDateString('hu-HU', {
          timeZone: 'UTC',
         })}
        </p>
        {/* Link az editor oldalra — a CV id-jével */}
        <Link href={`/editor/${cv.id}`} className="mt-auto">
         <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 border-chart-3/40 text-slate-700 bg-slate-50 hover:text-slate-900"
         >
          <Pencil className="size-3.5" />
          Szerkesztés
         </Button>
        </Link>
       </div>
      ))}
     </div>
    ) : (
     /* Üres állapot — még nincs egyetlen CV sem */
     <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
      <FileText className="size-12 text-slate-400/60 mb-4" />
      <h2 className="font-medium text-slate-600">
       Még nincs egyetlen önéletrajzod sem
      </h2>
      <p className="text-sm text-chart-3/70 mt-1 mb-4">
       Hozd létre az első CV-det, és indulj el!
      </p>
      <form action={createCV}>
       <Button
        type="submit"
        className="bg-linear-to-r from-slate-800 to-slate-400 border-0 hover:opacity-90 transition-opacity"
       >
        <Plus className="size-4" />
        Első CV létrehozása
       </Button>
      </form>
     </div>
    )}
   </main>
  </div>
 );
}
