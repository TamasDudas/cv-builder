'use client'

// Modern kétoszlopos CV sablon — sötét oldalsáv + fehér fő tartalom
// Ez az eredeti sablon amit a projekt indulásakor terveztünk

import { PersonalInfo, ExperienceEntry, CustomSection } from '@/lib/types/cv'
import { Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

export interface TemplateProps {
  personalInfo: PersonalInfo
  experience: ExperienceEntry[]
  customSections: CustomSection[]
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })
}

function ExperienceSection({ title, entries }: { title: string; entries: ExperienceEntry[] }) {
  if (entries.length === 0) return null
  return (
    <section>
      <h2 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-800 pb-1 mb-4">
        {title}
      </h2>
      <div className="space-y-5">
        {entries.map((entry) => (
          <div key={entry.id}>
            <div className="flex items-start justify-between gap-4 mb-0.5">
              <p className="text-sm font-bold text-slate-800">{entry.position || '—'}</p>
              {entry.startDate && (entry.current || entry.endDate) && (
                <p className="text-[11px] text-slate-500 shrink-0 mt-0.5">
                  {formatDate(entry.startDate)}
                  {' – '}
                  {entry.current ? 'jelenleg' : formatDate(entry.endDate)}
                </p>
              )}
            </div>
            <p className="text-xs text-slate-600 mb-1">
              {entry.company}
              {entry.location && <span className="text-slate-400"> · {entry.location}</span>}
            </p>
            {entry.description && (
              <ul className="mt-1.5 space-y-0.5">
                {entry.description.split('\n').filter(l => l.trim()).map((line, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-slate-400 shrink-0 mt-0.5">•</span>
                    <span>{line.trim()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export function ModernPreview({ personalInfo, experience, customSections }: TemplateProps) {
  const { name, email, phone, location, summary, photoUrl } = personalInfo
  const safeExperience = experience ?? []
  const safeCustomSections = customSections ?? []
  const workEntries = safeExperience.filter((e) => (e.type ?? 'work') === 'work')
  const educationEntries = safeExperience.filter((e) => e.type === 'education')
  const visibleSections = safeCustomSections.filter(
    (s) => s.title && s.items.some((i) => i.label)
  )

  return (
    <div className="flex overflow-hidden flex-1">
      {/* ===== BAL OLDALSÁV ===== */}
      <aside className="w-55 shrink-0 bg-slate-800 text-white flex flex-col">
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
            <div className="size-28 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center">
              <span className="text-slate-500 text-3xl font-bold select-none">
                {name ? name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
          )}
        </div>

        {(email || phone || location) && (
          <div className="px-5 pb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-600 pb-1 mb-3">
              Elérhetőség
            </h3>
            <div className="space-y-2">
              {phone && (
                <div className="flex items-start gap-2">
                  <Phone className="size-3 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-300 break-all">{phone}</span>
                </div>
              )}
              {email && (
                <div className="flex items-start gap-2">
                  <Mail className="size-3 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-300 break-all">{email}</span>
                </div>
              )}
              {location && (
                <div className="flex items-start gap-2">
                  <MapPin className="size-3 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-300">{location}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {visibleSections.map((section) => (
          <div key={section.id} className="px-5 pb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-600 pb-1 mb-3">
              {section.title}
            </h3>
            <div className="space-y-1.5">
              {section.items.filter((i) => i.label).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-300">{item.label}</span>
                  {item.value && (
                    <span className="text-[11px] text-slate-400 shrink-0">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </aside>

      {/* ===== JOBB FŐ TARTALOM ===== */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-8 pt-8 pb-6 border-b border-gray-200">
          {name && (
            <h1 className="text-2xl font-bold text-slate-800 tracking-wide uppercase leading-tight mb-1">
              {name}
            </h1>
          )}
          {summary && (
            <p className="text-xs text-slate-500 leading-relaxed italic mt-2">{summary}</p>
          )}
        </header>
        <div className="px-8 py-6 space-y-6 flex-1">
          <ExperienceSection title="Munkatapasztalat" entries={workEntries} />
          <ExperienceSection title="Tanulmányok" entries={educationEntries} />
        </div>
      </main>
    </div>
  )
}
