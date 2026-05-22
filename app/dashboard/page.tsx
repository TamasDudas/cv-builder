// Dashboard oldal — Server Component
// Megmutatja a bejelentkezett felhasználó mentett CV-jeit
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/auth/actions';
import { FileText, Plus, LogOut } from 'lucide-react';

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
const { data: cvs } = await supabase
.from('cvs')
.select('id, title, updated_at')
.order('updated_at', { ascending: false });

return (
<div className="min-h-screen bg-background">
{/* Fejléc navigáció */}
<header className="border-b">
<div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
<div className="flex items-center gap-2">
<FileText className="size-6 text-primary" />
<span className="text-lg font-bold">CV Builder</span>
</div>

<div className="flex items-center gap-3">
{/* Felhasználó neve */}
{fullName && <span className="text-sm text-muted-foreground hidden sm:block">{fullName}</span>}
{/* Kijelentkezés — Server Action-t hívunk form-on keresztül */}
<form action={logout}>
<Button type="submit" variant="ghost" size="sm">
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
<h1 className="text-2xl font-bold">
{fullName ? `Szia, ${fullName.split(' ')[1]}!` : 'Dashboard'}
</h1>
<p className="text-muted-foreground text-sm mt-1">Kezeld és szerkeszd az önéletrajzaidat</p>
</div>

{/* Új CV gomb — hamarosan az /editor-ra visz */}
<Button size="sm" disabled>
<Plus className="size-4" />
Új CV
</Button>
</div>

{/* CV lista vagy üres állapot */}
{cvs && cvs.length > 0 ? (
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
{cvs.map((cv) => (
<div
key={cv.id}
className="rounded-xl border bg-card p-4 flex flex-col gap-3 hover:border-primary/50 transition-colors"
>
<div className="flex items-start justify-between gap-2">
<div className="flex items-center gap-2">
<FileText className="size-5 text-primary shrink-0" />
<span className="font-medium text-sm truncate">{cv.title}</span>
</div>
</div>
<p className="text-xs text-muted-foreground">
Módosítva: {new Date(cv.updated_at).toLocaleDateString('hu-HU')}
</p>
<Button variant="outline" size="sm" className="w-full mt-auto" disabled>
Szerkesztés
</Button>
</div>
))}
</div>
) : (
/* Üres állapot — még nincs egyetlen CV sem */
<div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
<FileText className="size-12 text-muted-foreground/40 mb-4" />
<h2 className="font-medium text-muted-foreground">Még nincs egyetlen önéletrajzod sem</h2>
<p className="text-sm text-muted-foreground/70 mt-1 mb-4">
Hozd létre az első CV-det, és indulj el!
</p>
<Button disabled>
<Plus className="size-4" />
Első CV létrehozása
</Button>
</div>
)}
</main>
</div>
);
}
