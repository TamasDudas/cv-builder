'use client'

// Fő editor komponens — ez tartja a CV adatot state-ben
// MIÉRT 'use client': useState-et használunk a live preview miatt.
// A szülő (page.tsx) Server Component, ez Client Component — így megmarad az SSR előny.

import { useState, useCallback, useTransition } from 'react'
import { CVData, PersonalInfo, ExperienceEntry, CustomSection } from '@/lib/types/cv'
import { CVPreview } from '@/components/preview/cv-preview'
import { HeaderPanel } from '@/components/editor/panels/header-panel'
import { ExperiencePanel } from '@/components/editor/panels/experience-panel'
import { CustomSectionsPanel } from '@/components/editor/panels/custom-sections-panel'
import { Button } from '@/components/ui/button'
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Az aktív szekció fül típusa
type ActiveTab = 'header' | 'experience' | 'profile'

interface CVEditorProps {
  cvId: string
  initialTitle: string
  initialData: CVData
}

export function CVEditor({ cvId, initialTitle, initialData }: CVEditorProps) {
  // A CV adatokat state-ben tároljuk — minden változás azonnal megjelenik a preview-ban
  const [cvData, setCvData] = useState<CVData>(initialData)
  const [title, setTitle] = useState(initialTitle)
  const [activeTab, setActiveTab] = useState<ActiveTab>('header')

  // Mentés folyamatban jelző — useTransition a UI blokkolás elkerülésére
  // MIÉRT useTransition: mentés közben is görgethet a felhasználó, nem fagy ki az UI
  const [isSaving, startSaveTransition] = useTransition()

  // Mobil nézeten a preview/form váltása
  const [showPreview, setShowPreview] = useState(false)

  // --- Személyes adatok frissítése ---
  const handlePersonalInfoChange = useCallback((updated: PersonalInfo) => {
    setCvData((prev) => ({ ...prev, personalInfo: updated }))
  }, [])

  // --- Tapasztalatok frissítése ---
  const handleExperienceChange = useCallback((updated: ExperienceEntry[]) => {
    setCvData((prev) => ({ ...prev, experience: updated }))
  }, [])

  // --- Szabad szekciók frissítése ---
  const handleCustomSectionsChange = useCallback((updated: CustomSection[]) => {
    setCvData((prev) => ({ ...prev, customSections: updated }))
  }, [])

  // --- CV mentése Supabase-be ---
  async function handleSave() {
    startSaveTransition(async () => {
      const supabase = createClient()

      const { error } = await supabase
        .from('cvs')
        .update({
          title,
          data: cvData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cvId)

      if (error) {
        toast.error('Mentés sikertelen. Próbáld újra!')
        console.error(error)
      } else {
        toast.success('CV elmentve!')
      }
    })
  }

  // --- Fül definíciók ---
  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'header', label: 'Fejléc' },
    { id: 'experience', label: 'Tapasztalat & Tanulmányok' },
    { id: 'profile', label: 'Profil' },
  ]

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* ====== NAVIGÁCIÓS SÁV ====== */}
      <header className="h-14 border-b bg-white flex items-center px-4 gap-3 shrink-0 shadow-sm">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Vissza</span>
          </Button>
        </Link>

        {/* CV cím — szerkeszthető inline */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 text-sm font-medium bg-transparent outline-none focus:ring-1 focus:ring-primary/30 rounded px-2 py-1 min-w-0 text-gray-800 hover:bg-gray-50 cursor-text transition-colors"
          placeholder="CV neve..."
          aria-label="CV neve"
        />

        <div className="flex items-center gap-2 shrink-0">
          {/* Mobil: preview váltó gomb */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setShowPreview((v) => !v)}
          >
            {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>

          {/* Mentés gomb */}
          <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-1.5">
            <Save className="size-4" />
            {isSaving ? 'Mentés...' : 'Mentés'}
          </Button>
        </div>
      </header>

      {/* ====== FŐ TARTALOM: form + preview ====== */}
      <div className="flex-1 flex overflow-hidden">
        {/* ---- BAL PANEL: szerkesztő form ---- */}
        <aside
          className={`
            w-full md:w-100 lg:w-110
            bg-white border-r overflow-y-auto shrink-0
            ${showPreview ? 'hidden md:block' : 'block'}
          `}
        >
          <div className="p-6">
            {/* Szekció fülek */}
            <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all
                    ${activeTab === tab.id
                      ? 'bg-white shadow-sm text-gray-800'
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Az aktív szekció form-ja */}
            {activeTab === 'header' && (
              <HeaderPanel
                data={cvData.personalInfo}
                onChange={handlePersonalInfoChange}
              />
            )}
            {activeTab === 'experience' && (
              <ExperiencePanel
                data={cvData.experience}
                onChange={handleExperienceChange}
              />
            )}
            {activeTab === 'profile' && (
              <CustomSectionsPanel
                data={cvData.customSections}
                onChange={handleCustomSectionsChange}
              />
            )}
          </div>
        </aside>

        {/* ---- JOBB PANEL: live CV preview ---- */}
        <main
          className={`
            flex-1 overflow-hidden
            ${!showPreview ? 'hidden md:block' : 'block'}
          `}
        >
          <CVPreview
            personalInfo={cvData.personalInfo}
            experience={cvData.experience}
            customSections={cvData.customSections}
          />
        </main>
      </div>
    </div>
  )
}
