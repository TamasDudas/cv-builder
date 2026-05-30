'use client'

// Modern kétoszlopos PDF sablon — sötét oldalsáv + fehér fő tartalom
// MIÉRT 'use client': a @react-pdf/renderer csak böngészőben fut (PDFDownloadLink),
// szerveren nem tud PDF-et renderelni — ezért kell a 'use client' direktíva

import { Document, Page, View, Text, StyleSheet, Image, Svg, Path, Rect, Circle } from '@react-pdf/renderer'
import { PersonalInfo, ExperienceEntry, CustomSection } from '@/lib/types/cv'
import { formatDate, commonStyles } from './pdf-utils'

// --- Lucide ikonok SVG path-jai PDF-hez ---
// MIÉRT SVG: a @react-pdf/renderer nem tud React komponenseket (pl. Lucide) renderelni,
// de az SVG path adatokat igen — így pontosan ugyanazok az ikonok jelennek meg mint a preview-ban
function PhoneIcon({ color = '#94a3b8' }: { color?: string }) {
  return (
    <Svg width="9" height="9" viewBox="0 0 24 24">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.12 6.12l1.77-1.77a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
function MailIcon({ color = '#94a3b8' }: { color?: string }) {
  return (
    <Svg width="9" height="9" viewBox="0 0 24 24">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="2" fill="none" />
      <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
    </Svg>
  )
}
function MapPinIcon({ color = '#94a3b8' }: { color?: string }) {
  return (
    <Svg width="9" height="9" viewBox="0 0 24 24">
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" fill="none" />
    </Svg>
  )
}

// --- PDF-specifikus stílusok ---
// MIÉRT nem Tailwind: a @react-pdf saját Yoga layout motort használ (mint React Native),
// CSS class-ok itt nem értelmezhetők — minden stílus inline objektum
const styles = StyleSheet.create({
  page: {
    ...commonStyles.page,
    flexDirection: 'row',  // kétoszlopos elrendezés
  },

  // ===== BAL OLDALSÁV =====
  sidebar: {
    width: 170,
    backgroundColor: '#1e293b', // slate-800
    padding: 20,
    flexShrink: 0,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignSelf: 'center',
    marginBottom: 14,
    objectFit: 'cover',
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#334155', // slate-700
    alignSelf: 'center',
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#64748b',
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: 'bold',
  },
  sidebarSectionTitle: {
    ...commonStyles.sectionTitle,
    color: '#94a3b8', // slate-400
    borderBottomWidth: 0.5,
    borderBottomColor: '#334155',
    paddingBottom: 3,
    marginBottom: 6,
  },
  sidebarSectionBlock: {
    marginBottom: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  contactLabel: {
    fontSize: 8,
    color: '#94a3b8',
    width: 9,
    marginTop: 0.5,
  },
  contactText: {
    fontSize: 8,
    color: '#cbd5e1', // slate-300
    marginBottom: 3,
  },
  customItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  customItemLabel: {
    fontSize: 8,
    color: '#cbd5e1',
    flex: 1,
  },
  customItemValue: {
    fontSize: 8,
    color: '#94a3b8',
    flexShrink: 0,
  },

  // ===== JOBB FŐ TARTALOM =====
  main: {
    flex: 1,
    padding: 28,
  },
  nameHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 12,
    marginBottom: 18,
  },
  name: {
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  summary: {
    fontSize: 8,
    color: '#64748b',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  sectionBlock: {
    marginBottom: 14,
  },
  entryBlock: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  entryTitle: {
    ...commonStyles.entryTitle,
    flex: 1,
    marginRight: 8,
  },
  entryDate: {
    ...commonStyles.entryDate,
    flexShrink: 0,
  },
  entrySubtitle: {
    ...commonStyles.entrySubtitle,
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    fontSize: 8,
    color: '#94a3b8',
    marginRight: 4,
    marginTop: 1,
  },
  bulletText: {
    ...commonStyles.bodyText,
    flex: 1,
  },
})

// --- Tapasztalat / Tanulmány szekció ---
function ExperienceSection({ title, entries }: { title: string; entries: ExperienceEntry[] }) {
  if (entries.length === 0) return null
  return (
    <View style={styles.sectionBlock}>
      <Text style={commonStyles.sectionTitle}>{title}</Text>
      <View style={commonStyles.divider} />
      {entries.map((entry) => (
        <View key={entry.id} style={styles.entryBlock}>
          <View style={styles.entryHeader}>
            <Text style={styles.entryTitle}>{entry.position || '—'}</Text>
            {entry.startDate && (entry.current || entry.endDate) && (
              <Text style={styles.entryDate}>
                {formatDate(entry.startDate)} – {entry.current ? 'jelenleg' : formatDate(entry.endDate)}
              </Text>
            )}
          </View>
          <Text style={styles.entrySubtitle}>
            {entry.company}{entry.location ? ` · ${entry.location}` : ''}
          </Text>
          {entry.description && entry.description.split('\n').filter(l => l.trim()).map((line, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{line.trim()}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

// --- Fő PDF komponens ---
interface ModernPDFProps {
  personalInfo: PersonalInfo
  experience: ExperienceEntry[]
  customSections: CustomSection[]
}

export function ModernPDF({ personalInfo, experience, customSections }: ModernPDFProps) {
  const { name, email, phone, location, summary, photoUrl } = personalInfo
  const safeExp = experience ?? []
  const safeSections = customSections ?? []
  const workEntries = safeExp.filter((e) => (e.type ?? 'work') === 'work')
  const eduEntries = safeExp.filter((e) => e.type === 'education')
  const visibleSections = safeSections.filter((s) => s.title && s.items.some((i) => i.label))

  return (
    // MIÉRT Document + Page: a @react-pdf minden PDF-nek Document gyökérelemet vár,
    // ezen belül egy vagy több Page — ez felel meg az A4-es lapnak
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ===== BAL OLDALSÁV ===== */}
        <View style={styles.sidebar}>
          {/* Profilfotó vagy iniciale */}
          {photoUrl ? (
            <Image src={photoUrl} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {name ? name.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}

          {/* Elérhetőség — SVG ikon + szöveg egy sorban */}
          {(email || phone || location) && (
            <View style={styles.sidebarSectionBlock}>
              <Text style={styles.sidebarSectionTitle}>Elérhetőség</Text>
              {phone && (
                <View style={styles.contactRow}>
                  <PhoneIcon /><Text style={styles.contactText}>{phone}</Text>
                </View>
              )}
              {email && (
                <View style={styles.contactRow}>
                  <MailIcon /><Text style={styles.contactText}>{email}</Text>
                </View>
              )}
              {location && (
                <View style={styles.contactRow}>
                  <MapPinIcon /><Text style={styles.contactText}>{location}</Text>
                </View>
              )}
            </View>
          )}

          {/* Egyéni szekciók (Nyelvtudás, Hobbik stb.) */}
          {visibleSections.map((section) => (
            <View key={section.id} style={styles.sidebarSectionBlock}>
              <Text style={styles.sidebarSectionTitle}>{section.title}</Text>
              {section.items.filter((i) => i.label).map((item) => (
                <View key={item.id} style={styles.customItemRow}>
                  <Text style={styles.customItemLabel}>{item.label}</Text>
                  {item.value && (
                    <Text style={styles.customItemValue}>{item.value}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* ===== JOBB FŐ TARTALOM ===== */}
        <View style={styles.main}>
          {/* Fejléc: név + összefoglaló */}
          <View style={styles.nameHeader}>
            {name ? <Text style={styles.name}>{name}</Text> : null}
            {summary ? <Text style={styles.summary}>{summary}</Text> : null}
          </View>

          {/* Munkatapasztalat és Tanulmányok */}
          <ExperienceSection title="Munkatapasztalat" entries={workEntries} />
          <ExperienceSection title="Tanulmányok" entries={eduEntries} />
        </View>

      </Page>
    </Document>
  )
}
