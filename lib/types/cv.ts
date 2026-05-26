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
export interface ExperienceEntry {
  id: string          // egyedi azonosító (crypto.randomUUID)
  company: string     // cég neve
  position: string    // pozíció / munkakör
  startDate: string   // pl. "2020-01"
  endDate: string     // pl. "2023-06" — üres ha current = true
  current: boolean    // jelenlegi munkahely?
  location?: string   // pl. "Budapest"
  // Leírás: minden sor egy bullet point lesz a preview-ban
  // MIÉRT string és nem string[]: könnyebb textarea-ban szerkeszteni,
  // a preview-ban split('\n')-nel alakítjuk bullet pointokká
  description: string
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
}

// --- Üres tapasztalat bejegyzés (új hozzáadásakor) ---
export function createEmptyExperience(): ExperienceEntry {
  return {
    // MIÉRT crypto.randomUUID: egyedi id kell a React key-hez és a törléshez
    id: crypto.randomUUID(),
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    location: '',
    description: '',
  }
}
