'use client'

// CV live preview komponens
// MIÉRT 'use client': az adatok valós időben változnak a form alapján,
// ezért React state-et kap prop-ként — csak kliens oldalon tud re-renderelni.

import { PersonalInfo, ExperienceEntry } from '@/lib/types/cv'
import { Mail, Phone, MapPin } from 'lucide-react'
import Image from 'next/image'

interface CVPreviewProps {
  personalInfo: PersonalInfo
  experience: ExperienceEntry[]
}

// --- Dátum formázó segédfüggvény ---
// "2020-01" → "2020. jan." formátumra alakítja
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month] = dateStr.split('-')
  const date = new Date(Number(year), Number(month) - 1)
  return date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short' })
}

export function CVPreview({ personalInfo, experience }: CVPreviewProps) {
  const { name, email, phone, location, summary, photoUrl } = personalInfo

  // MIÉRT ?? []: régi CV-k az adatbázisban még nem tartalmaznak experience mezőt,
  // ilyenkor undefined érkezik — ezt üres tömbbé alakítjuk hogy ne törjön el az app
  const safeExperience = experience ?? []

  // Ha minden mező üres, mutatunk egy placeholder szöveget
  const isEmpty = !name && !email && !phone && !location && !summary && !photoUrl && safeExperience.length === 0

  return (
    // Külső konténer: szürke háttér, görgethetű, középre igazított
    <div className="h-full overflow-y-auto bg-gray-100 flex items-start justify-center p-6">
      {/* A4 arányú fehér "papír" (210mm × 297mm → ~794px × 1123px 96dpi-n) */}
      <div
        className="bg-white shadow-lg w-full max-w-[794px] min-h-[1123px] rounded-sm"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {isEmpty ? (
          // Üres állapot — útmutatás a felhasználónak
          <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
            Töltsd ki az adatokat a bal oldalon, és itt élőben látod az eredményt.
          </div>
        ) : (
          <div>
            {/* ============ FEJLÉC SZEKCIÓ ============ */}
            <header className="px-10 pt-10 pb-6 border-b-2 border-gray-800">
              <div className="flex items-start gap-6">
                {/* Bal oldal: név és kontakt */}
                <div className="flex-1 text-center">
                  {name && (
                    <h1 className="text-3xl font-bold text-gray-900 tracking-wide uppercase mb-3">
                      {name}
                    </h1>
                  )}
                  {(phone || email || location) && (
                    <div className="flex items-center justify-center flex-wrap gap-4 text-sm text-gray-600">
                      {phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="size-3.5 text-gray-500" />
                          {phone}
                        </span>
                      )}
                      {email && (
                        <span className="flex items-center gap-1">
                          <Mail className="size-3.5 text-gray-500" />
                          {email}
                        </span>
                      )}
                      {location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-gray-500" />
                          {location}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Jobb oldal: opcionális profilfotó */}
                {photoUrl && (
                  <div className="shrink-0">
                    <div className="relative size-24 rounded-full overflow-hidden border-2 border-gray-300">
                      <Image
                        src={photoUrl}
                        alt={name || 'Profilfotó'}
                        fill
                        className="object-cover"
                        unoptimized={photoUrl.startsWith('data:')}
                      />
                    </div>
                  </div>
                )}
              </div>

              {summary && (
                <p className="mt-4 text-sm text-gray-700 leading-relaxed text-center italic">
                  {summary}
                </p>
              )}
            </header>

            {/* ============ BODY ============ */}
            <main className="px-10 py-6 space-y-6">

              {/* ---- TAPASZTALAT SZEKCIÓ ---- */}
              {safeExperience.length > 0 && (
                <section>
                  {/* Szekció cím — vastag vonal alatt */}
                  <h2 className="text-xs font-bold text-gray-800 uppercase tracking-widest border-b border-gray-300 pb-1 mb-4">
                    Munkatapasztalat
                  </h2>

                  <div className="space-y-5">
                    {safeExperience.map((entry) => (
                      <div key={entry.id}>
                        {/* Fejsor: pozíció bal oldal, dátum jobb oldal */}
                        <div className="flex items-start justify-between gap-4 mb-1">
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {entry.position || '—'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {entry.company}
                              {entry.location && (
                                <span className="text-gray-400"> · {entry.location}</span>
                              )}
                            </p>
                          </div>
                          {/* Dátum tartomány */}
                          {entry.startDate && (
                            <p className="text-xs text-gray-500 shrink-0 mt-0.5">
                              {formatDate(entry.startDate)}
                              {' – '}
                              {entry.current ? 'jelenleg' : formatDate(entry.endDate)}
                            </p>
                          )}
                        </div>

                        {/* Bullet pointok — soronként egy pont */}
                        {entry.description && (
                          <ul className="mt-2 space-y-0.5">
                            {entry.description
                              .split('\n')
                              .filter((line) => line.trim() !== '') // üres sorokat kihagyjuk
                              .map((line, i) => (
                                <li
                                  key={i}
                                  className="text-xs text-gray-700 flex items-start gap-2"
                                >
                                  {/* Bullet pont karakter */}
                                  <span className="text-gray-400 shrink-0 mt-0.5">•</span>
                                  <span>{line.trim()}</span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </main>

            {/* ============ FOOTER ============ */}
            <footer className="px-10 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center" />
            </footer>
          </div>
        )}
      </div>
    </div>
  )
}
