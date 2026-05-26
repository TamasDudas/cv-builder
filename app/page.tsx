// Nyitóoldal (Landing Page) — Server Component
// Ez az első oldal, amit a látogató lát; bemutatja az alkalmazás funkcióit
import Link from 'next/link';
import Navbar from '@/components/landing/navbar';
import { Button } from '@/components/ui/button';
import {
FileText,
Sparkles,
Download,
MousePointerClick,
Eye,
CloudUpload,
ArrowRight,
CheckCircle2,
} from 'lucide-react';

// ─── Funkciók adatai ───────────────────────────────────────────────
const features = [
{
icon: MousePointerClick,
title: 'Drag & Drop szerkesztő',
description: 'Húzd és ejtsd a szekciókat a kívánt helyre. Intuitív felület, nulla tanulási idő.',
},
{
icon: Eye,
title: 'Valós idejű előnézet',
description: 'A változtatások azonnal megjelennek az előnézetben — amit látsz, azt kapod.',
},
{
icon: Download,
title: 'PDF exportálás',
description:
'Töltsd le az önéletrajzod gyönyörű, nyomtatásra kész PDF formátumban egyetlen kattintással.',
},
{
icon: CloudUpload,
title: 'Felhőalapú mentés',
description:
'Az önéletrajzaid biztonságosan tárolódnak a felhőben — bármikor, bármely eszközről eléred.',
},
];

// ─── Hogyan működik? — lépések ────────────────────────────────────
const steps = [
{
number: '01',
title: 'Regisztrálj ingyen',
description: 'Hozz létre egy fiókot e-mail címeddel — pár másodperc az egész.',
},
{
number: '02',
title: 'Szerkeszd a CV-det',
description: 'Adj hozzá tapasztalatot, készségeket és egyéb szekciókat drag & drop-pal.',
},
{
number: '03',
title: 'Exportáld és oszd meg',
description: 'Töltsd le PDF-ként, és küldd el álomállásodhoz.',
},
];

// ─── Főoldal ──────────────────────────────────────────────────────
export default function HomePage() {
return (
<div className="flex min-h-screen flex-col">
{/* Navigációs sáv — async Server Component, lekéri a session-t */}
<Navbar />

<main className="flex-1">
{/* ── Hero szekció ── */}
{/* A látogató által először látott rész — erős headline és CTA gombok */}
<section className="relative overflow-hidden border-b">
{/* Háttér dekoráció — finom rácsozat */}
<div
className="pointer-events-none absolute inset-0 opacity-[0.03]"
style={{
backgroundImage:
'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
backgroundSize: '40px 40px',
}}
/>

<div className="mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-36 text-center">
{/* Kis badge a héro felett */}
<div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground mb-8">
<Sparkles className="size-3" />
Ingyenes önéletrajz-készítő
</div>

{/* Főcím */}
<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
Készítsd el az önéletrajzod{' '}
<span className="relative inline-block">
<span className="relative z-10">percek alatt</span>
{/* Kiemelő vonal a szó alatt */}
<span className="absolute bottom-1 left-0 right-0 h-3 -z-0 bg-primary/10 rounded" />
</span>
</h1>

{/* Alcím */}
<p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
Drag &amp; drop szerkesztő, valós idejű előnézet és PDF exportálás — minden, amire szükséged van az
álomálláshoz.
</p>

{/* CTA gombok */}
<div className="flex flex-col sm:flex-row items-center justify-center gap-3">
<Link href="/auth/register">
<Button size="lg" className="h-11 px-6 text-base gap-2">
Kezdés — Ingyenes
<ArrowRight className="size-4" />
</Button>
</Link>
<Link href="/auth/login">
<Button variant="outline" size="lg" className="h-11 px-6 text-base">
Bejelentkezés
</Button>
</Link>
</div>

{/* Apró bizalmi jelek */}
<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
{['Nincs hitelkártya', 'Korlátlan CV', 'PDF export'].map((item) => (
<span key={item} className="flex items-center gap-1.5">
<CheckCircle2 className="size-4 text-primary" />
{item}
</span>
))}
</div>
</div>
</section>

{/* ── Funkciók szekció ── */}
{/* 4 kártyán bemutatjuk a főbb képességeket */}
<section id="features" className="py-20 sm:py-28">
<div className="mx-auto max-w-6xl px-4 sm:px-6">
{/* Szekció fejléc */}
<div className="text-center mb-16">
<h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Minden, amire szükséged van</h2>
<p className="text-muted-foreground text-lg max-w-xl mx-auto">
Egy helyen, egyszerűen — hogy az önéletrajz-írás ne legyen stressz.
</p>
</div>

{/* Feature kártyák rácsban */}
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
{features.map(({ icon: Icon, title, description }) => (
<div
key={title}
className="group rounded-2xl border bg-card p-6 hover:border-primary/30 hover:shadow-md transition-all duration-200"
>
{/* Ikon kör */}
<div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/8 group-hover:bg-primary/12 transition-colors">
<Icon className="size-5 text-primary" />
</div>
<h3 className="font-semibold mb-2">{title}</h3>
<p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
</div>
))}
</div>
</div>
</section>

{/* ── Hogyan működik? szekció ── */}
{/* 3 lépéses folyamat bemutatása */}
<section id="how-it-works" className="py-20 sm:py-28 border-t bg-muted/30">
<div className="mx-auto max-w-6xl px-4 sm:px-6">
<div className="text-center mb-16">
<h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Hogyan működik?</h2>
<p className="text-muted-foreground text-lg max-w-xl mx-auto">
Három egyszerű lépés, és már kész is az önéletrajzod.
</p>
</div>

{/* Lépések */}
<div className="grid gap-8 sm:grid-cols-3 relative">
{/* Összekötő vonal a lépések között (csak asztali nézeten) */}
<div className="hidden sm:block absolute top-8 left-1/6 right-1/6 h-px bg-border" />

{steps.map(({ number, title, description }) => (
<div key={number} className="relative text-center">
{/* Lépésszám kör */}
<div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border-2 border-border bg-background text-xl font-bold relative z-10">
{number}
</div>
<h3 className="font-semibold text-lg mb-2">{title}</h3>
<p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{description}</p>
</div>
))}
</div>
</div>
</section>

{/* ── CTA (felhívás cselekvésre) szekció ── */}
{/* Utolsó lehetőség a regisztrációra való ösztönzésre */}
<section className="py-20 sm:py-28 border-t">
<div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
<div className="rounded-3xl border bg-card p-10 sm:p-14 shadow-sm">
<div className="flex justify-center mb-6">
<div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
<FileText className="size-7" />
</div>
</div>
<h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Készen állsz?</h2>
<p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
Hozd létre az önéletrajzodat még ma — teljesen ingyenesen, regisztráció után azonnal.
</p>
<Link href="/auth/register">
<Button size="lg" className="h-11 px-8 text-base gap-2">
Ingyenes fiók létrehozása
<ArrowRight className="size-4" />
</Button>
</Link>
</div>
</div>
</section>
</main>

{/* ── Lábléc ── */}
{/* Egyszerű footer az alkalmazás nevével és egy apró megjegyzéssel */}
<footer className="border-t py-8">
<div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
<div className="flex items-center gap-2 font-medium text-foreground">
<FileText className="size-4" />
CV Builder
</div>
<p>© {new Date().getFullYear()} CV Builder — Tanulási projekt</p>
<div className="flex gap-4">
<Link href="/auth/login" className="hover:text-foreground transition-colors">
Bejelentkezés
</Link>
<Link href="/auth/register" className="hover:text-foreground transition-colors">
Regisztráció
</Link>
</div>
</div>
</footer>
</div>
);
}
