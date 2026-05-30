'use client'

// Hagyományos egyoszlopos CV sablon — klasszikus, konzervatív megjelenés
// Minden iparágban elfogadott, ATS (önéletrajz-szkenner) barát elrendezés

import { PersonalInfo, ExperienceEntry, CustomSection } from '@/lib/types/cv'
import { Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'
import { TemplateProps } from './modern-preview'

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })
}

function ClassicExperienceSection({ title, entries }: { title: string; entries: ExperienceEntry[] }) {
  if (entries.length === 0) return null
  return (
    <section className="mb-5">
      <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest pb-1 mb-3 border-b-2 border-slate-800">
        {title}
      </h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-bold text-slate-800">{entry.position || '—'}</p>
              {entry.startDate && (entry.current || entry.endDate) && (
                <p className="text-[11px] text-slate-500 shrink-0 italic">
                  {formatDate(entry.startDate)}
                  {' – '}
                  {entry.current ? 'jelenleg' : formatDate(entry.endDate)}
                </p>
              )}
            </div>
            <p className="text-xs font-medium text-slate-600 mb-1">
              {entry.company}
              {entry.location && <span className="text-slate-400 font-normal"> · {entry.location}</span>}
            </p>
            {entry.description && (
              <ul className="mt-1 space-y-0.5 pl-3">
                {entry.description.split('\n').filter(l => l.trim()).map((line, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                    <span className="text-slate-400 shrink-0 mt-0.5">–</span>
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

function ClassicCustomSections({ sections }: { sections: CustomSection[] }) {
  const visible = sections.filter((s) => s.title && s.items.some((i) => i.label))
  if (visible.length === 0) return null

  return (
    // Két oszlopba rendezzük a profil szekciókat — pl. Nyelvtudás mellé Hobbik
    // MIÉRT grid: a klasszikus CV-ken az ilyen kisebb szekciók egymás mellett férnek el
    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
      {visible.map((section) => (
        <section key={section.id}>
          <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest pb-1 mb-2 border-b border-slate-400">
            {section.title}
          </h2>
          <div className="space-y-1">
            {section.items.filter((i) => i.label).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-700">{item.label}</span>
                {item.value && (
                  <span className="text-xs text-slate-500 shrink-0">{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function ClassicPreview({ personalInfo, experience, customSections }: TemplateProps) {
  const { name, email, phone, location, summary, photoUrl } = personalInfo
  const safeExperience = experience ?? []
  const safeCustomSections = customSections ?? []
  const workEntries = safeExperience.filter((e) => (e.type ?? 'work') === 'work')
  const educationEntries = safeExperience.filter((e) => e.type === 'education')

  return (
    <div className="flex-1 flex flex-col p-10 min-w-0">
      {/* ===== FEJLÉC ===== */}
      <header className="mb-6">
        {/* Fotó + névblokk egymás mellett ha van fotó, különben csak szöveg */}
        <div className="flex items-center gap-6 mb-4">
          {photoUrl && (
            <div className="relative size-20 rounded overflow-hidden shrink-0 border border-slate-200">
              <Image
                src={photoUrl}
                alt={name || 'Profilfotó'}
                fill
                className="object-cover"
                unoptimized={photoUrl.startsWith('data:')}
              />
            </div>
          )}
          <div className="flex-1">
            {name && (
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                {name}
              </h1>
            )}
            {/* Elérhetőség egy sorban, ikonokkal */}
            {(email || phone || location) && (
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {phone && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Phone className="size-3 text-slate-400" />
                    {phone}
                  </span>
                )}
                {email && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Mail className="size-3 text-slate-400" />
                    {email}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="size-3 text-slate-400" />
                    {location}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vékony elválasztó vonal */}
        <div className="border-t-2 border-slate-800" />

        {/* Összefoglaló */}
        {summary && (
          <p className="text-xs text-slate-600 leading-relaxed mt-3 italic">{summary}</p>
        )}
      </header>

      {/* ===== FŐ TARTALOM ===== */}
      <div className="flex-1 space-y-1">
        <ClassicExperienceSection title="Munkatapasztalat" entries={workEntries} />
        <ClassicExperienceSection title="Tanulmányok" entries={educationEntries} />

        {/* Profil szekciók (Nyelvtudás, Hobbik, stb.) kétoszlopos rácsban */}
        {safeCustomSections.length > 0 && (
          <section className="mt-2">
            <ClassicCustomSections sections={safeCustomSections} />
          </section>
        )}
      </div>
    </div>
  )
}
