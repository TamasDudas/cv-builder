'use client'

// CV preview fő komponens — sablon alapján a megfelelő template-et rendereli
// MIÉRT dispatcher: minden sablon külön komponensben él, ez csak irányít —
// így új sablon hozzáadása nem érinti a meglévőket

import { PersonalInfo, ExperienceEntry, CustomSection } from '@/lib/types/cv'
import { ModernPreview } from './templates/modern-preview'
import { ClassicPreview } from './templates/classic-preview'

interface CVPreviewProps {
  personalInfo: PersonalInfo
  experience: ExperienceEntry[]
  customSections: CustomSection[]
  template: string
}

export function CVPreview({ personalInfo, experience, customSections, template }: CVPreviewProps) {
  const props = { personalInfo, experience, customSections }

  const isEmpty =
    !personalInfo.name &&
    !personalInfo.email &&
    !personalInfo.phone &&
    !personalInfo.location &&
    !personalInfo.summary &&
    !personalInfo.photoUrl &&
    (experience ?? []).length === 0 &&
    (customSections ?? []).filter((s) => s.title && s.items.some((i) => i.label)).length === 0

  return (
    // Külső konténer: szürke háttér, görgethetű, A4 papír középre igazítva
    <div className="h-full overflow-y-auto bg-gray-100 flex items-start justify-center p-6">
      <div
        className="bg-white shadow-lg w-full max-w-198.5 min-h-280.75 rounded-sm flex overflow-hidden"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {isEmpty ? (
          <div className="flex items-center justify-center w-full h-64 text-gray-400 text-sm">
            Töltsd ki az adatokat a bal oldalon, és itt élőben látod az eredményt.
          </div>
        ) : template === 'classic' ? (
          <ClassicPreview {...props} />
        ) : (
          // Alapértelmezett: modern sablon (ismeretlen template érték esetén is)
          <ModernPreview {...props} />
        )}
      </div>
    </div>
  )
}
