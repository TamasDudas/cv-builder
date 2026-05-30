'use client'

// PDF letöltő gomb — a PDFDownloadLink kezeli a generálást és a letöltést
// MIÉRT 'use client': a @react-pdf/renderer csak böngészőben fut,
// a PDF-et client-side állítja elő, nem a szerveren

import { PDFDownloadLink } from '@react-pdf/renderer'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PersonalInfo, ExperienceEntry, CustomSection } from '@/lib/types/cv'
import { ModernPDF } from './modern-pdf'
import { ClassicPDF } from './classic-pdf'

interface PDFDownloadButtonProps {
  personalInfo: PersonalInfo
  experience: ExperienceEntry[]
  customSections: CustomSection[]
  template: string
  fileName?: string
}

export function PDFDownloadButton({
  personalInfo,
  experience,
  customSections,
  template,
  fileName = 'oneletrajz.pdf',
}: PDFDownloadButtonProps) {
  // A megfelelő PDF sablon kiválasztása — ugyanaz a logika mint a live preview-ban
  const props = { personalInfo, experience, customSections }
  const document = template === 'classic'
    ? <ClassicPDF {...props} />
    : <ModernPDF {...props} />

  return (
    // MIÉRT PDFDownloadLink: ez a @react-pdf/renderer beépített komponense,
    // ami a háttérben legenerálja a PDF-et, majd egy <a> letöltési linket ad vissza.
    // A children egy render prop függvény: ({ loading }) => JSX
    // — így tudjuk mutatni a töltési állapotot amíg a PDF készül
    <PDFDownloadLink document={document} fileName={fileName}>
      {({ loading }) => (
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          className="gap-1.5 border-slate-300 text-slate-600 hover:text-slate-900"
        >
          {loading
            ? <Loader2 className="size-4 animate-spin" />
            : <Download className="size-4" />
          }
          {loading ? 'Generálás...' : 'PDF letöltés'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
