'use client';

// CV live preview komponens — modern kétoszlopos elrendezés
// MIÉRT 'use client': az adatok valós időben változnak a form alapján,
// ezért React state-et kap prop-ként — csak kliens oldalon tud re-renderelni.

import { PersonalInfo, ExperienceEntry, CustomSection } from '@/lib/types/cv';
import { Mail, Phone, MapPin } from 'lucide-react';
import Image from 'next/image';

interface CVPreviewProps {
personalInfo: PersonalInfo;
experience: ExperienceEntry[];
customSections: CustomSection[];
}

// --- Dátum formázó segédfüggvény ---
// "2020-01" → "2020. jan." formátumra alakítja
function formatDate(dateStr: string): string {
if (!dateStr) return '';
const [year, month] = dateStr.split('-');
const date = new Date(Number(year), Number(month) - 1);
return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' });
}

// --- Tapasztalat szekció megjelenítő (újrahasználható) ---
// MIÉRT külön komponens: ugyanolyan struktúrában jelenik meg a munkahely és az iskola,
// csak a szekció fejléce különbözik — nem kell megkettőzni a JSX-et.
function ExperienceSection({ title, entries }: { title: string; entries: ExperienceEntry[] }) {
if (entries.length === 0) return null;

return (
<section>
<h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-800 pb-1 mb-4">
{title}
</h2>

<div className="space-y-5">
{entries.map((entry) => (
<div key={entry.id}>
{/* Pozíció / Szak + dátum sor */}
<div className="flex items-start justify-between gap-4 mb-0.5">
<p className="text-sm font-bold text-slate-800">{entry.position || '—'}</p>
{/* Dátum csak akkor jelenik meg, ha van befejezés vagy jelenlegi jelölő —
                  MIÉRT: üres endDate esetén ne maradjon lógó kötőjel a preview-ban */}
{entry.startDate && (entry.current || entry.endDate) && (
<p className="text-[11px] text-slate-600 shrink-0 mt-0.5">
{formatDate(entry.startDate)}
{' – '}
{entry.current ? 'jelenleg' : formatDate(entry.endDate)}
</p>
)}
</div>

{/* Cég / Intézmény + helyszín */}
<p className="text-xs text-slate-800 mb-1">
{entry.company}
{entry.location && <span className="text-slate-500"> · {entry.location}</span>}
</p>

{/* Bullet pontok */}
{entry.description && (
<ul className="mt-1.5 space-y-0.5">
{entry.description
.split('\n')
.filter((line) => line.trim() !== '')
.map((line, i) => (
<li key={i} className="text-xs text-slate-600 flex items-start gap-2">
<span className="text-slate-600 shrink-0 mt-0.5">•</span>
<span>{line.trim()}</span>
</li>
))}
</ul>
)}
</div>
))}
</div>
</section>
);
}

export function CVPreview({ personalInfo, experience, customSections }: CVPreviewProps) {
const { name, email, phone, location, summary, photoUrl } = personalInfo;

// MIÉRT ?? []: régi CV-k még nem tartalmaznak experience/customSections mezőt
const safeExperience = experience ?? [];
const safeCustomSections = customSections ?? [];

// MIÉRT ?? 'work': régi bejegyzéseknek még nincs type mezőjük — biztonságos fallback
const workEntries = safeExperience.filter((e) => (e.type ?? 'work') === 'work');
const educationEntries = safeExperience.filter((e) => e.type === 'education');

// Csak azok a szekciók jelennek meg ahol van cím és legalább egy elem
const visibleSections = safeCustomSections.filter((s) => s.title && s.items.some((i) => i.label));

const isEmpty =
!name &&
!email &&
!phone &&
!location &&
!summary &&
!photoUrl &&
safeExperience.length === 0 &&
visibleSections.length === 0;

return (
// Külső konténer: szürke háttér, görgethetű, középre igazított
<div className="h-full overflow-y-auto bg-gray-100 flex items-start justify-center p-6">
{/* A4 arányú "papír" — kétoszlopos flex elrendezés */}
<div
className="bg-white shadow-lg w-full max-w-198.5 min-h-280.75 rounded-sm flex overflow-hidden"
style={{ fontFamily: 'Georgia, serif' }}
>
{isEmpty ? (
<div className="flex items-center justify-center w-full h-64 text-gray-400 text-sm">
Töltsd ki az adatokat a bal oldalon, és itt élőben látod az eredményt.
</div>
) : (
<>
{/* ===================== BAL OLDALSÁV ===================== */}
{/* Sötét háttér, itt van: fotó, elérhetőség, profil szekciók */}
<aside className="w-55 shrink-0 bg-cyan-900 text-white flex flex-col">
{/* Profilfotó */}
<div className="flex justify-center pt-8 pb-5">
{photoUrl ? (
<div className="relative size-28 rounded-full overflow-hidden border-4 border-slate-600 shrink-0">
<Image
src={photoUrl}
alt={name || 'Profilfotó'}
fill
className="object-cover"
unoptimized={photoUrl.startsWith('data:')}
/>
</div>
) : (
// Ha nincs fotó, egy üres kör placeholder
<div className="size-28 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center">
<span className="text-slate-500 text-3xl font-bold select-none">
{name ? name.charAt(0).toUpperCase() : '?'}
</span>
</div>
)}
</div>

{/* Elérhetőség szekció */}
{(email || phone || location) && (
<div className="px-5 pb-6">
<h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-200 border-b border-slate-100 pb-1 mb-3">
Elérhetőség
</h3>
<div className="space-y-2">
{phone && (
<div className="flex items-start gap-2">
<Phone className="size-3 text-slate-200 shrink-0 mt-0.5" />
<span className="text-[11px] text-slate-300 break-all">{phone}</span>
</div>
)}
{email && (
<div className="flex items-start gap-2">
<Mail className="size-3 text-slate-200 shrink-0 mt-0.5" />
<span className="text-[11px] text-slate-300 break-all">{email}</span>
</div>
)}
{location && (
<div className="flex items-start gap-2">
<MapPin className="size-3 text-slate-200 shrink-0 mt-0.5" />
<span className="text-[11px] text-slate-300">{location}</span>
</div>
)}
</div>
</div>
)}

{/* Profil szekciók (Nyelvtudás, Hobbik, stb.) */}
{visibleSections.map((section) => (
<div key={section.id} className="px-5 pb-6">
<h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-200 border-b border-slate-600 pb-1 mb-3">
{section.title}
</h3>
<div className="space-y-1.5">
{section.items
.filter((item) => item.label)
.map((item) => (
<div key={item.id} className="flex items-center justify-between gap-2">
<span className="text-[11px] text-slate-300">{item.label}</span>
{item.value && <span className="text-[11px] text-slate-200 shrink-0">{item.value}</span>}
</div>
))}
</div>
</div>
))}
</aside>

{/* ===================== JOB OLDAL (fő tartalom) ===================== */}
<main className="flex-1 flex flex-col min-w-0">
{/* Fejléc: név + összefoglalás */}
<header className="px-8 pt-8 pb-6 border-b border-gray-200">
{name && (
<h1 className="text-2xl font-bold text-slate-900 tracking-wide uppercase leading-tight mb-1">
{name}
</h1>
)}
{summary && <p className="text-xs text-slate-500 leading-relaxed italic mt-2">{summary}</p>}
</header>

{/* Tapasztalat + Tanulmányok szekciók */}
<div className="px-8 py-6 space-y-6 flex-1">
{/* Munkatapasztalat — csak work típusú bejegyzések */}
<ExperienceSection title="Munkatapasztalat" entries={workEntries} />

{/* Tanulmányok — csak education típusú bejegyzések */}
<ExperienceSection title="Tanulmányok" entries={educationEntries} />
</div>
</main>
</>
)}
</div>
</div>
);
}
