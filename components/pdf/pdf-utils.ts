// PDF sablonok közös segédfüggvényei és stílusai
// MIÉRT külön fájl: a Modern és Classic sablon ugyanazokat a formázókat használja,
// így nem kell kétszer megírni (DRY — Don't Repeat Yourself)

import { StyleSheet, Font } from '@react-pdf/renderer'

// --- Betűtípus regisztráció ---
// MIÉRT inter-ui WOFF fájlok: a Google Fonts / @fontsource subset-ekre osztja a fontot
// (latin, latin-ext külön fájl), de a @react-pdf/renderer egy egységes fájlt vár.
// Az inter-ui csomag teljes, nem feldarabolt WOFF fájlokat tartalmaz — ezekben
// benne van az összes magyar ékezetes karakter (ő, ű, á, é, stb.) is.
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.woff', fontWeight: 'normal', fontStyle: 'normal' },
    { src: '/fonts/Inter-Bold.woff',    fontWeight: 'bold',   fontStyle: 'normal' },
    { src: '/fonts/Inter-Italic.woff',  fontWeight: 'normal', fontStyle: 'italic' },
  ],
})

// --- Dátumformázó (ugyanaz mint a preview-ban, de itt nem DOM-ban fut) ---
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })
}

// --- Közös stílusok ---
// MIÉRT StyleSheet.create: a @react-pdf/renderer optimalizálja a stílusokat,
// hasonlóan ahogy React Native teszi — nem sima CSS, hanem PDF-specifikus layout motor.
// Nincs Tailwind, nincs class name — minden inline style objektum, camelCase-ben.
export const commonStyles = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#1e293b', // slate-800
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#1e293b',
    marginBottom: 4,
  },
  divider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1e293b',
    marginBottom: 6,
  },
  thinDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#94a3b8', // slate-400
    marginBottom: 4,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#475569', // slate-600
  },
  entryDate: {
    fontSize: 8,
    color: '#64748b', // slate-500
    fontStyle: 'italic',
  },
  bodyText: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },
  smallText: {
    fontSize: 8,
    color: '#64748b',
  },
})
