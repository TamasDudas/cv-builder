'use client';

// Fejléc szekció szerkesztő panel
// MIÉRT 'use client': onChange callback-eket hívunk és fájlolvasást végzünk —
// ez Browser API (FileReader), ami csak kliensen érhető el.

import { useRef } from 'react';
import { PersonalInfo } from '@/lib/types/cv';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MapPin, Camera, X } from 'lucide-react';

interface HeaderPanelProps {
// A jelenlegi személyes adatok
data: PersonalInfo;
// Callback: ha bármely mező változik, a szülő kapja meg az új értéket
onChange: (updated: PersonalInfo) => void;
}

export function HeaderPanel({ data, onChange }: HeaderPanelProps) {
// Rejtett fájl input ref — a saját styled gombra kattintáskor triggereljük
const fileInputRef = useRef<HTMLInputElement>(null);

// --- Szövegmező változás kezelő ---
// MIÉRT spread: az összes többi mezőt megtartjuk, csak a megadottat frissítjük
function handleChange(field: keyof PersonalInfo, value: string) {
onChange({ ...data, [field]: value });
}

// --- Fotó feltöltés kezelése ---
function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
const file = e.target.files?.[0];
if (!file) return;

// Méretkorlát: 2 MB
if (file.size > 2 * 1024 * 1024) {
alert('A fájl mérete maximum 2 MB lehet.');
return;
}

// FileReader API: a képet base64 Data URL-lé alakítja
// MIÉRT base64: azonnal megjeleníthető a preview-ban, nincs szükség feltöltésre
const reader = new FileReader();
reader.onload = (event) => {
const result = event.target?.result as string;
onChange({ ...data, photoUrl: result });
};
reader.readAsDataURL(file);
}

// --- Fotó eltávolítása ---
function handleRemovePhoto() {
onChange({ ...data, photoUrl: undefined });
// Az input értékét is töröljük, hogy ugyanazt a fájlt újra ki lehessen választani
if (fileInputRef.current) fileInputRef.current.value = '';
}

return (
<div className="space-y-5">
{/* Panel cím */}
<div className="pb-2 border-b">
<h2 className="text-sm font-semibold text-gray-700">Személyes adatok</h2>
<p className="text-xs text-gray-400 mt-0.5">Ezek jelennek meg a CV fejlécében</p>
</div>

{/* Teljes név */}
<div className="space-y-1.5">
<Label htmlFor="name" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
<User className="size-3.5" />
Teljes név <span className="text-red-500">*</span>
</Label>
<Input
id="name"
placeholder="pl. Kovács János"
value={data.name}
onChange={(e) => handleChange('name', e.target.value)}
className="text-sm"
/>
</div>

{/* Email cím */}
<div className="space-y-1.5">
<Label htmlFor="email" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
<Mail className="size-3.5" />
Email cím <span className="text-red-500">*</span>
</Label>
<Input
id="email"
type="email"
placeholder="pl. kovacs.janos@gmail.com"
value={data.email}
onChange={(e) => handleChange('email', e.target.value)}
className="text-sm"
/>
</div>

{/* Telefonszám */}
<div className="space-y-1.5">
<Label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
<Phone className="size-3.5" />
Telefonszám <span className="text-red-500">*</span>
</Label>
<Input
id="phone"
type="tel"
placeholder="pl. +36 30 123 4567"
value={data.phone}
onChange={(e) => handleChange('phone', e.target.value)}
className="text-sm"
/>
</div>

{/* Helyszín (nem kötelező) */}
<div className="space-y-1.5">
<Label htmlFor="location" className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
<MapPin className="size-3.5" />
Helyszín
<span className="text-gray-400 font-normal">(nem kötelező)</span>
</Label>
<Input
id="location"
placeholder="pl. Budapest, Magyarország"
value={data.location ?? ''}
onChange={(e) => handleChange('location', e.target.value)}
className="text-sm"
/>
</div>

{/* Rövid bemutatkozás (nem kötelező) */}
<div className="space-y-1.5">
<Label htmlFor="summary" className="text-xs font-medium text-gray-600">
Rövid bemutatkozás
<span className="text-gray-400 font-normal ml-1">(nem kötelező)</span>
</Label>
<Textarea
id="summary"
placeholder="2-3 mondat magadról, amit a toborzó először lát..."
value={data.summary ?? ''}
onChange={(e) => handleChange('summary', e.target.value)}
className="text-sm resize-none"
rows={3}
/>
</div>

{/* Profilfotó (nem kötelező) */}
<div className="space-y-1.5">
<Label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
<Camera className="size-3.5" />
Profilfotó
<span className="text-gray-400 font-normal">(nem kötelező)</span>
</Label>

{data.photoUrl ? (
/* Ha van feltöltött fotó: preview + törlés gomb */
<div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50">
{/* Kör alakú fotó előnézet */}
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
src={data.photoUrl}
alt="Profilfotó"
className="size-14 rounded-full object-cover border-2 border-gray-200 shrink-0"
/>
<div className="flex-1 min-w-0">
<p className="text-xs text-gray-600 font-medium">Fotó feltöltve</p>
<p className="text-xs text-gray-400">A jobb oldalon látod, hogyan jelenik meg</p>
</div>
{/* Törlés gomb */}
<Button
type="button"
variant="ghost"
size="sm"
className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-50"
onClick={handleRemovePhoto}
>
<X className="size-4" />
</Button>
</div>
) : (
/* Ha nincs fotó: feltöltés gomb */
<div
className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
onClick={() => fileInputRef.current?.click()}
>
<Camera className="size-8 text-gray-300 mx-auto mb-2" />
<p className="text-xs text-gray-500">Kattints a fotó feltöltéséhez</p>
<p className="text-xs text-gray-400 mt-0.5">JPG, PNG — max. 2 MB</p>
</div>
)}

{/* Rejtett fájl input — csak képeket engedünk */}
<input
ref={fileInputRef}
type="file"
accept="image/jpeg,image/png,image/webp"
className="hidden"
onChange={handlePhotoChange}
/>
</div>
</div>
);
}
