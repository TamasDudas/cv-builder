'use client'

// Sablon választó panel — vizuális kártyák a két elérhető sablon között
// MIÉRT 'use client': onClick eseménykezelők kellenek a választáshoz

import { Check } from 'lucide-react'

interface TemplatePanelProps {
  selected: string
  onChange: (template: string) => void
}

// --- Sablon definíciók ---
// MIÉRT külön tömb: könnyen bővíthető ha több sablon kerül be később
const TEMPLATES = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Kétoszlopos elrendezés sötét oldalsávval. Szembeötlő, friss megjelenés.',
    thumbnail: <ModernThumbnail />,
  },
  {
    id: 'classic',
    name: 'Hagyományos',
    description: 'Egyoszlopos, tiszta elrendezés. Konzervatív, minden iparágban elfogadott.',
    thumbnail: <ClassicThumbnail />,
  },
]

// --- Miniatűr előnézetek (CSS-alapú sémák, nem valódi CV renderelés) ---
// MIÉRT nem valódi preview: a teljes CV renderelése 220x300px-en olvashatatlan lenne,
// egy sémarajz sokkal jobban mutatja az elrendezést
function ModernThumbnail() {
  return (
    <div className="w-full h-36 rounded overflow-hidden flex shadow-inner bg-white border border-gray-100">
      {/* Oldalsáv */}
      <div className="w-10 bg-slate-800 flex flex-col items-center pt-3 gap-2 shrink-0">
        <div className="size-6 rounded-full bg-slate-600" />
        <div className="w-6 h-0.5 bg-slate-600 rounded" />
        <div className="w-5 h-0.5 bg-slate-700 rounded" />
        <div className="w-5 h-0.5 bg-slate-700 rounded" />
        <div className="w-6 h-0.5 bg-slate-600 rounded mt-1" />
        <div className="w-5 h-0.5 bg-slate-700 rounded" />
        <div className="w-5 h-0.5 bg-slate-700 rounded" />
      </div>
      {/* Fő tartalom */}
      <div className="flex-1 p-2 flex flex-col gap-1.5">
        <div className="w-20 h-2 bg-slate-300 rounded" />
        <div className="w-14 h-1.5 bg-slate-200 rounded" />
        <div className="w-full h-px bg-gray-200 my-0.5" />
        <div className="w-16 h-1.5 bg-slate-400 rounded" />
        <div className="w-24 h-1.5 bg-slate-200 rounded" />
        <div className="w-20 h-1 bg-slate-100 rounded" />
        <div className="w-20 h-1 bg-slate-100 rounded" />
        <div className="w-16 h-1.5 bg-slate-200 rounded mt-1" />
        <div className="w-20 h-1 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

function ClassicThumbnail() {
  return (
    <div className="w-full h-36 rounded overflow-hidden bg-white border border-gray-100 shadow-inner p-2 flex flex-col gap-1.5">
      {/* Fejléc */}
      <div className="w-24 h-2.5 bg-slate-700 rounded mx-auto" />
      <div className="flex justify-center gap-2">
        <div className="w-10 h-1 bg-slate-300 rounded" />
        <div className="w-10 h-1 bg-slate-300 rounded" />
        <div className="w-10 h-1 bg-slate-300 rounded" />
      </div>
      <div className="w-full h-px bg-slate-800 my-0.5" />
      {/* Szekció 1 */}
      <div className="w-16 h-1.5 bg-slate-500 rounded" />
      <div className="w-full h-px bg-slate-300" />
      <div className="w-20 h-1.5 bg-slate-300 rounded" />
      <div className="w-28 h-1 bg-slate-100 rounded" />
      <div className="w-24 h-1 bg-slate-100 rounded" />
      {/* Szekció 2 */}
      <div className="w-16 h-1.5 bg-slate-500 rounded mt-0.5" />
      <div className="w-full h-px bg-slate-300" />
      <div className="w-20 h-1.5 bg-slate-300 rounded" />
    </div>
  )
}

export function TemplatePanel({ selected, onChange }: TemplatePanelProps) {
  return (
    <div className="space-y-4">
      <div className="pb-2 border-b">
        <h2 className="text-sm font-semibold text-gray-700">Sablon választó</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Válassz elrendezést — később bármikor megváltoztatható. Ne felejtsd el menteni!
        </p>
      </div>

      <div className="space-y-3">
        {TEMPLATES.map((tpl) => {
          const isSelected = selected === tpl.id
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onChange(tpl.id)}
              className={`
                w-full text-left rounded-lg border-2 overflow-hidden transition-all
                ${isSelected
                  ? 'border-cyan-600 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {/* Miniatűr előnézet */}
              <div className="p-2 bg-gray-50">
                {tpl.thumbnail}
              </div>

              {/* Sablon neve + leírás + pipa */}
              <div className="flex items-center gap-3 px-3 py-2.5 bg-white">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${isSelected ? 'text-cyan-700' : 'text-gray-800'}`}>
                    {tpl.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
                {/* Kijelölés jelzője */}
                <div className={`
                  size-5 rounded-full flex items-center justify-center shrink-0 transition-all
                  ${isSelected ? 'bg-cyan-600' : 'border-2 border-gray-200'}
                `}>
                  {isSelected && <Check className="size-3 text-white" />}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 text-center pt-1">
        A jobb oldali preview azonnal frissül a választás alapján
      </p>
    </div>
  )
}
