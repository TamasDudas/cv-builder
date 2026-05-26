// CV adatstruktúra típusdefiníciók
// MIÉRT külön fájl: TypeScript típusokat egy helyen tartjuk,
// így bármely komponens importálhatja anélkül, hogy körbefüggőség keletkezne.

// --- Személyes adatok (fejléc) ---
export interface PersonalInfo {
  name: string
  email: string
  phone: string
  location?: string
  summary?: string
  // Fotó: base64 Data URL vagy Supabase Storage URL lesz
  photoUrl?: string
}

// --- Tapasztalat egy bejegyzése ---
// MIÉRT type mező: ugyanaz a struktúra kell munkahelynek és iskolának is,
// csak a feliratok különböznek — így nem kell külön tömb az adatbázisban.
// Régi bejegyzéseknél type hiányozhat → ?? 'work' fallback-kel kezeljük.
export interface ExperienceEntry {
  id: string                        // egyedi azonosító (crypto.randomUUID)
  type: 'work' | 'education'        // munkahely vagy iskola/tanulmány
  company: string                   // cég neve (work) / intézmény neve (education)
  position: string                  // pozíció (work) / szak, diploma (education)
  startDate: string                 // pl. "2020-01"
  endDate: string                   // pl. "2023-06" — üres ha current = true
  current: boolean                  // jelenlegi munkahely / még itt tanul?
  location?: string                 // pl. "Budapest"
  // Leírás: minden sor egy bullet point lesz a preview-ban
  // MIÉRT string és nem string[]: könnyebb textarea-ban szerkeszteni,
  // a preview-ban split('\n')-nel alakítjuk bullet pointokká
  description: string
}

// --- Szabad szekció egy eleme (pl. "Angol" → "C1") ---
// MIÉRT value opcionális: hobbikhoz, jogosítványhoz elég csak a label
export interface CustomItem {
  id: string
  label: string   // pl. "Angol", "B kategória", "Fotózás"
  value?: string  // pl. "C1 – haladó", opcionális
}

// --- Szabad szekció (user nevezi el és tölti fel) ---
// MIÉRT rugalmas: ki-ki azt ír be amit akar — nyelvtudás, hobbi, jogosítvány stb.
export interface CustomSection {
  id: string
  title: string         // pl. "Nyelvtudás", "Hobbik", "Jogosítvány"
  items: CustomItem[]
}

// --- Egy szekció (tapasztalat, végzettség, stb.) ---
export type SectionType =
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'

export interface CVSection {
  id: string
  type: SectionType
  order: number
  // content rugalmasan JSONB-ben tárolódik, ezért unknown
  content: unknown
}

// --- A teljes CV adat (ez kerül a JSONB mezőbe) ---
export interface CVData {
  personalInfo: PersonalInfo
  sections: CVSection[]
  // Tapasztalatok külön tömbben — könnyebb kezelni mint CVSection content-ben
  // MIÉRT nem sections[].content: erősen típusos, TypeScript segít a szerkesztésnél
  experience: ExperienceEntry[]
  // Szabad szekciók — user által definiált, tetszőleges tartalom
  // MIÉRT külön tömb: rugalmas, nem kell séma migráció új szekció típushoz
  customSections: CustomSection[]
}

// --- Egy CV rekord az adatbázisból ---
export interface CV {
  id: string
  user_id: string
  title: string
  data: CVData
  template: string
  created_at: string
  updated_at: string
}

// --- Üres CV alapértelmezett értékei (új CV létrehozásakor) ---
export const defaultCVData: CVData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    photoUrl: undefined,
  },
  sections: [],
  experience: [],
  customSections: [],
}

// --- Üres szabad szekció (új hozzáadásakor) ---
export function createEmptyCustomSection(): CustomSection {
  return {
    id: crypto.randomUUID(),
    title: '',
    items: [],
  }
}

// --- Üres elem egy szabad szekción belül ---
export function createEmptyCustomItem(): CustomItem {
  return {
    id: crypto.randomUUID(),
    label: '',
    value: '',
  }
}

// --- Üres tapasztalat bejegyzés (új hozzáadásakor) ---
// MIÉRT type paraméter: a "Munkatapasztalat" és "Tanulmány" gombok
// ugyanezt a függvényt hívják, csak más type-pal
export function createEmptyExperience(type: 'work' | 'education' = 'work'): ExperienceEntry {
  return {
    // MIÉRT crypto.randomUUID: egyedi id kell a React key-hez és a törléshez
    id: crypto.randomUUID(),
    type,
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    description: '',
  }
}
