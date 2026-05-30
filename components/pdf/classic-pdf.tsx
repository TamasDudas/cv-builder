'use client'

// Hagyományos egyoszlopos PDF sablon — fejléc + elválasztó + szekciók
// ATS (önéletrajz-szkenner szoftver) barát: egyszerű, lineáris struktúra

import { Document, Page, View, Text, StyleSheet, Image, Svg, Path, Rect, Circle } from '@react-pdf/renderer'
import { PersonalInfo, ExperienceEntry, CustomSection } from '@/lib/types/cv'
import { formatDate, commonStyles } from './pdf-utils'

function PhoneIcon() {
  return (
    <Svg width="8" height="8" viewBox="0 0 24 24">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6.12 6.12l1.77-1.77a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}
function MailIcon() {
  return (
    <Svg width="8" height="8" viewBox="0 0 24 24">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke="#94a3b8" strokeWidth="2" fill="none" />
      <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" />
    </Svg>
  )
}
function MapPinIcon() {
  return (
    <Svg width="8" height="8" viewBox="0 0 24 24">
      <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="#94a3b8" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="3" stroke="#94a3b8" strokeWidth="2" fill="none" />
    </Svg>
  )
}

const styles = StyleSheet.create({
  page: {
    ...commonStyles.page,
    padding: 40,
    flexDirection: 'column',
  },

  // ===== FEJLÉC =====
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 4,
    objectFit: 'cover',
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: '#0f172a', // slate-900
    marginBottom: 5,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  contactIcon: {
    fontSize: 7,
    color: '#94a3b8',
  },
  contactText: {
    fontSize: 8,
    color: '#64748b',
  },
  headerDivider: {
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    marginBottom: 8,
  },
  summary: {
    fontSize: 8,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 1.6,
    marginBottom: 14,
  },

  // ===== SZEKCIÓK =====
  sectionBlock: {
    marginBottom: 12,
  },
  sectionHeader: {
    marginBottom: 5,
  },
  entryBlock: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 1,
  },
  entryTitle: {
    ...commonStyles.entryTitle,
    fontSize: 10,
  },
  entryDate: {
    ...commonStyles.entryDate,
    flexShrink: 0,
  },
  entrySubtitle: {
    fontSize: 8,
    color: '#475569',
    marginBottom: 3,
  },
  entryLocation: {
    color: '#94a3b8',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 1.5,
    paddingLeft: 6,
  },
  bulletDash: {
    fontSize: 8,
    color: '#94a3b8',
    marginRight: 5,
  },
  bulletText: {
    ...commonStyles.bodyText,
    fontSize: 8,
    flex: 1,
  },

  // ===== EGYÉNI SZEKCIÓK (kétoszlopos rács) =====
  // MIÉRT kétoszlopos: a klasszikus CV-ken a kis szekciók (Nyelvtudás, Hobbik)
  // egymás mellett férnek el, nem pazarolják a helyet
  customGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  customGridItem: {
    width: '47%',
  },
  customItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2.5,
  },
  customItemLabel: {
    fontSize: 8,
    color: '#334155',
  },
  customItemValue: {
    fontSize: 8,
    color: '#64748b',
    flexShrink: 0,
  },
})

// --- Tapasztalat / Tanulmány szekció ---
function ClassicExperienceSection({ title, entries }: { title: string; entries: ExperienceEntry[] }) {
  if (entries.length === 0) return null
  return (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeader}>
        <Text style={commonStyles.sectionTitle}>{title}</Text>
        <View style={commonStyles.divider} />
      </View>
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
            {entry.company}
            {entry.location
              ? <Text style={styles.entryLocation}> · {entry.location}</Text>
              : null}
          </Text>
          {entry.description && entry.description.split('\n').filter(l => l.trim()).map((line, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDash}>–</Text>
              <Text style={styles.bulletText}>{line.trim()}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

// --- Egyéni szekciók kétoszlopos rácsban ---
function ClassicCustomSections({ sections }: { sections: CustomSection[] }) {
  const visible = sections.filter((s) => s.title && s.items.some((i) => i.label))
  if (visible.length === 0) return null
  return (
    <View style={styles.customGrid}>
      {visible.map((section) => (
        <View key={section.id} style={styles.customGridItem}>
          <Text style={commonStyles.sectionTitle}>{section.title}</Text>
          <View style={commonStyles.thinDivider} />
          {section.items.filter((i) => i.label).map((item) => (
            <View key={item.id} style={styles.customItemRow}>
              <Text style={styles.customItemLabel}>{item.label}</Text>
              {item.value
                ? <Text style={styles.customItemValue}>{item.value}</Text>
                : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

// --- Fő PDF komponens ---
interface ClassicPDFProps {
  personalInfo: PersonalInfo
  experience: ExperienceEntry[]
  customSections: CustomSection[]
}

export function ClassicPDF({ personalInfo, experience, customSections }: ClassicPDFProps) {
  const { name, email, phone, location, summary, photoUrl } = personalInfo
  const safeExp = experience ?? []
  const safeSections = customSections ?? []
  const workEntries = safeExp.filter((e) => (e.type ?? 'work') === 'work')
  const eduEntries = safeExp.filter((e) => e.type === 'education')

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ===== FEJLÉC ===== */}
        <View style={styles.header}>
          {photoUrl && (
            <Image src={photoUrl} style={styles.avatar} />
          )}
          <View style={styles.headerText}>
            {name ? <Text style={styles.name}>{name}</Text> : null}
            {(email || phone || location) && (
              <View style={styles.contactRow}>
                {phone && (
                  <View style={styles.contactItem}>
                    <PhoneIcon /><Text style={styles.contactText}>{phone}</Text>
                  </View>
                )}
                {email && (
                  <View style={styles.contactItem}>
                    <MailIcon /><Text style={styles.contactText}>{email}</Text>
                  </View>
                )}
                {location && (
                  <View style={styles.contactItem}>
                    <MapPinIcon /><Text style={styles.contactText}>{location}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Vékony fejléc elválasztó */}
        <View style={styles.headerDivider} />

        {/* Összefoglaló */}
        {summary ? <Text style={styles.summary}>{summary}</Text> : null}

        {/* ===== SZEKCIÓK ===== */}
        <ClassicExperienceSection title="Munkatapasztalat" entries={workEntries} />
        <ClassicExperienceSection title="Tanulmányok" entries={eduEntries} />
        <ClassicCustomSections sections={safeSections} />

      </Page>
    </Document>
  )
}
