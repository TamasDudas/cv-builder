'use client';

// Fő editor komponens — ez tartja a CV adatot state-ben
// MIÉRT 'use client': useState-et használunk a live preview miatt.
// A szülő (page.tsx) Server Component, ez Client Component — így megmarad az SSR előny.

import { useState, useCallback, useTransition } from 'react';
import {
 CVData,
 PersonalInfo,
 ExperienceEntry,
 CustomSection,
} from '@/lib/types/cv';
import { CVPreview } from '@/components/preview/cv-preview';
import { HeaderPanel } from '@/components/editor/panels/header-panel';
import { ExperiencePanel } from '@/components/editor/panels/experience-panel';
import { CustomSectionsPanel } from '@/components/editor/panels/custom-sections-panel';
import { TemplatePanel } from '@/components/editor/panels/template-panel';
import { Button } from '@/components/ui/button';
// MIÉRT dynamic + ssr:false: a @react-pdf/renderer böngésző-specifikus API-kat használ
// (canvas, Blob stb.) — szerveren futtatva 500-as hibát dob. A dynamic import
// gondoskodik arról, hogy ez a komponens CSAK a böngészőben töltődjön be.
import dynamic from 'next/dynamic';
const PDFDownloadButton = dynamic(
  () => import('@/components/pdf/pdf-download-button').then((m) => m.PDFDownloadButton),
  { ssr: false, loading: () => null }
);
import { Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Az aktív szekció fül típusa
type ActiveTab = 'header' | 'experience' | 'profile' | 'template';

interface CVEditorProps {
 cvId: string;
 initialTitle: string;
 initialData: CVData;
 // MIÉRT initialTemplate: az adatbázisból jön, az utoljára mentett sablon
 initialTemplate: string;
}

export function CVEditor({ cvId, initialTitle, initialData, initialTemplate }: CVEditorProps) {
 const [cvData, setCvData] = useState<CVData>(initialData);
 const [title, setTitle] = useState(initialTitle);
 const [activeTab, setActiveTab] = useState<ActiveTab>('header');
 // MIÉRT külön state: a sablon nem a CV adatstruktúrájában él (nem CVData része),
 // hanem a cvs tábla template oszlopában — ezért különállóan kezeljük
 const [template, setTemplate] = useState(initialTemplate);

 const [isSaving, startSaveTransition] = useTransition();
 const [showPreview, setShowPreview] = useState(false);

 const handlePersonalInfoChange = useCallback((updated: PersonalInfo) => {
  setCvData((prev) => ({ ...prev, personalInfo: updated }));
 }, []);

 const handleExperienceChange = useCallback((updated: ExperienceEntry[]) => {
  setCvData((prev) => ({ ...prev, experience: updated }));
 }, []);

 const handleCustomSectionsChange = useCallback((updated: CustomSection[]) => {
  setCvData((prev) => ({ ...prev, customSections: updated }));
 }, []);

 // --- CV mentése Supabase-be (data + template egyszerre) ---
 async function handleSave() {
  startSaveTransition(async () => {
   const supabase = createClient();

   const { error } = await supabase
    .from('cvs')
    .update({
     title,
     data: cvData,
     template,
     updated_at: new Date().toISOString(),
    })
    .eq('id', cvId);

   if (error) {
    toast.error('Mentés sikertelen. Próbáld újra!');
    console.error(error);
   } else {
    toast.success('CV elmentve!');
   }
  });
 }

 const tabs: { id: ActiveTab; label: string }[] = [
  { id: 'header', label: 'Fejléc' },
  { id: 'experience', label: 'Tapasztalat & Tanulmányok' },
  { id: 'profile', label: 'Profil' },
  { id: 'template', label: 'Sablon' },
 ];

 return (
  <div className="h-screen flex flex-col overflow-hidden bg-slate-100">
   {/* ====== NAVIGÁCIÓS SÁV ====== */}
   <header className="h-14 border-b bg-white/90 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0 shadow-sm">
    <Link href="/dashboard">
     <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-slate-600 hover:text-slate-900"
     >
      <ArrowLeft className="size-4" />
      <span className="hidden sm:inline">Vissza</span>
     </Button>
    </Link>

    <input
     type="text"
     value={title}
     onChange={(e) => setTitle(e.target.value)}
     className="flex-1 text-sm font-medium bg-transparent outline-none focus:ring-1 focus:ring-slate-400/40 rounded px-2 py-1 min-w-0 text-slate-800 hover:bg-slate-50 cursor-text transition-colors"
     placeholder="CV neve..."
     aria-label="CV neve"
    />

    <div className="flex items-center gap-2 shrink-0">
     <Button
      variant="outline"
      size="sm"
      className="md:hidden border-slate-300 text-slate-600 hover:text-slate-900"
      onClick={() => setShowPreview((v) => !v)}
     >
      {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
     </Button>

     {/* PDF letöltő gomb — a @react-pdf/renderer client-side generálja */}
     <PDFDownloadButton
      personalInfo={cvData.personalInfo}
      experience={cvData.experience}
      customSections={cvData.customSections}
      template={template}
      fileName={`${title || 'oneletrajz'}.pdf`}
     />

     <Button
      size="sm"
      onClick={handleSave}
      disabled={isSaving}
      className="gap-1.5 bg-linear-to-r from-slate-800 to-slate-400 border-0 hover:opacity-90 transition-opacity"
     >
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
            bg-white border-r border-slate-200 overflow-y-auto shrink-0
            ${showPreview ? 'hidden md:block' : 'block'}
          `}
    >
     <div className="p-6">
      {/* Szekció fülek */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-200 rounded-lg flex-wrap">
       {tabs.map((tab) => (
        <button
         key={tab.id}
         onClick={() => setActiveTab(tab.id)}
         className={`
            flex-1 text-xs font-medium py-1.5 px-2 rounded-md transition-all whitespace-nowrap
              ${
               activeTab === tab.id
                ? 'bg-cyan-600 shadow-sm text-slate-100'
                : 'text-slate-500 hover:text-slate-700'
              }
                  `}
        >
         {tab.label}
        </button>
       ))}
      </div>

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
      {activeTab === 'template' && (
       <TemplatePanel
        selected={template}
        onChange={setTemplate}
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
      template={template}
     />
    </main>
   </div>
  </div>
 );
}
