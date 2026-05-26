'use client'

// Tapasztalat szekció szerkesztő panel — drag & drop sorrenddel
// MIÉRT 'use client': useState, event handlerek és dnd-kit mind kliens oldali.

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ExperienceEntry, createEmptyExperience } from '@/lib/types/cv'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Building2, Briefcase, Calendar, MapPin,
  Plus, Trash2, ChevronDown, GripVertical,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Egy húzható/rendezhető kártya komponens
// MIÉRT külön komponens: a useSortable hook-ot az adott elemen kell meghívni,
// nem a szülőben — ezért kiszervezzük.
// ─────────────────────────────────────────────
interface SortableEntryProps {
  entry: ExperienceEntry
  index: number
  isOpen: boolean
  onToggle: () => void
  onDelete: (id: string) => void
  onChange: (id: string, field: keyof ExperienceEntry, value: string | boolean) => void
  onCurrentChange: (id: string, checked: boolean) => void
}

function SortableEntry({
  entry, isOpen, onToggle, onDelete, onChange, onCurrentChange,
}: SortableEntryProps) {
  // useSortable: a dnd-kit hook ami a drag logikát adja ehhez az elemhez
  // MIÉRT id prop: az arrayMove-hoz az id alapján azonosítja az elemeket
  const {
    attributes,     // aria attribútumok akadálymentességhez
    listeners,      // egér/érintés event listener-ek a drag handle-re
    setNodeRef,     // ref a DOM elemre — a dnd-kit erre méri a pozíciót
    transform,      // CSS transform a húzás közbeni pozícióhoz
    transition,     // CSS transition az animációhoz
    isDragging,     // igaz, ha éppen ezt húzzák
  } = useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg overflow-hidden bg-white"
    >
      {/* Accordion fejléc */}
      <div
        className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        {/* Drag handle — csak ez az ikon húzható, a többi kattintható marad */}
        <button
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0 touch-none"
          {...attributes}
          {...listeners}
          title="Húzd a sorrend megváltoztatásához"
          // Megakadályozzuk hogy az accordion nyíljon/csukódjon húzáskor
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </button>

        {/* Cég/pozíció szöveg — kattintásra nyit/csuk */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <p className="text-sm font-medium text-gray-800 truncate">
            {entry.position || entry.company || 'Új bejegyzés'}
          </p>
          {(entry.company || entry.startDate) && (
            <p className="text-xs text-gray-500 truncate">
              {entry.company}
              {entry.company && entry.startDate && ' · '}
              {entry.startDate}
              {entry.startDate && (
                entry.current ? ' – jelenleg' : entry.endDate ? ` – ${entry.endDate}` : ''
              )}
            </p>
          )}
        </div>

        {/* Törlés gomb */}
        <button
          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
          onClick={(e) => { e.stopPropagation(); onDelete(entry.id) }}
          title="Törlés"
        >
          <Trash2 className="size-3.5" />
        </button>

        {/* Nyíl ikon — kattintásra nyit/csuk */}
        <div className="cursor-pointer shrink-0" onClick={onToggle}>
          <ChevronDown
            className={`size-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Accordion tartalom */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t">

          {/* Cég neve + Pozíció */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <Building2 className="size-3.5" />
                Cég neve <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="pl. Google"
                value={entry.company}
                onChange={(e) => onChange(entry.id, 'company', e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <Briefcase className="size-3.5" />
                Pozíció <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="pl. Frontend fejlesztő"
                value={entry.position}
                onChange={(e) => onChange(entry.id, 'position', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Dátumok */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <Calendar className="size-3.5" />
              Időszak
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="month"
                value={entry.startDate}
                onChange={(e) => onChange(entry.id, 'startDate', e.target.value)}
                className="text-sm flex-1"
              />
              <span className="text-gray-400 text-sm shrink-0">–</span>
              <Input
                type="month"
                value={entry.endDate}
                onChange={(e) => onChange(entry.id, 'endDate', e.target.value)}
                disabled={entry.current}
                className="text-sm flex-1 disabled:opacity-40"
              />
            </div>

            {/* Jelenlegi munkahely checkbox
                MIÉRT onCurrentChange külön callback: ha két state-módosítást
                (current + endDate) egymás után hívnánk, a második a régi
                data-ból dolgozna (stale closure) — ezért egyszerre módosítjuk. */}
            <label className="flex items-center gap-2 cursor-pointer w-fit select-none">
              <input
                type="checkbox"
                checked={entry.current}
                onChange={(e) => onCurrentChange(entry.id, e.target.checked)}
                className="rounded accent-primary"
              />
              <span className="text-xs text-gray-600">Jelenlegi munkahely</span>
            </label>
          </div>

          {/* Helyszín */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <MapPin className="size-3.5" />
              Helyszín
              <span className="text-gray-400 font-normal">(nem kötelező)</span>
            </Label>
            <Input
              placeholder="pl. Budapest, Magyarország"
              value={entry.location ?? ''}
              onChange={(e) => onChange(entry.id, 'location', e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Leírás / feladatok */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">
              Feladatok, eredmények
              <span className="text-gray-400 font-normal ml-1">(nem kötelező)</span>
            </Label>
            <Textarea
              placeholder={'Minden sor egy bullet point lesz a CV-ben:\nFrontend fejlesztés React-ban\nAPI integráció és tesztelés\nKódfelülvizsgálatok végzése'}
              value={entry.description}
              onChange={(e) => onChange(entry.id, 'description', e.target.value)}
              className="text-sm resize-none font-mono"
              rows={4}
            />
            <p className="text-xs text-gray-400">
              💡 Minden új sor = egy bullet pont a preview-ban
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Fő panel komponens
// ─────────────────────────────────────────────
interface ExperiencePanelProps {
  data: ExperienceEntry[]
  onChange: (updated: ExperienceEntry[]) => void
}

export function ExperiencePanel({ data: rawData, onChange }: ExperiencePanelProps) {
  const data = rawData ?? []

  const [openId, setOpenId] = useState<string | null>(data[0]?.id ?? null)

  // dnd-kit sensor — PointerSensor egér és érintőképernyőn is működik
  // MIÉRT activationConstraint: kis elmozdulás (8px) után indul csak a drag,
  // így a kattintások (accordion, törlés) nem indítják el véletlenül
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  // --- Drag vége: arrayMove átrendezi a tömböt ---
  // MIÉRT arrayMove: a dnd-kit saját segédfüggvénye, ami biztonságosan
  // cseréli fel a két elemet index alapján
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = data.findIndex((e) => e.id === active.id)
    const newIndex = data.findIndex((e) => e.id === over.id)
    onChange(arrayMove(data, oldIndex, newIndex))
  }

  function handleAdd() {
    const newEntry = createEmptyExperience()
    onChange([...data, newEntry])
    setOpenId(newEntry.id)
  }

  function handleDelete(id: string) {
    const updated = data.filter((e) => e.id !== id)
    onChange(updated)
    if (openId === id) setOpenId(updated[0]?.id ?? null)
  }

  // Egy mező frissítése — pl. company, position, startDate stb.
  function handleChange(id: string, field: keyof ExperienceEntry, value: string | boolean) {
    onChange(data.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  // Jelenlegi munkahely váltása — current + endDate egyszerre módosul
  // MIÉRT külön függvény: két mezőt egyszerre kell frissíteni egy map-ben,
  // különben a második hívás a régi (stale) data-ból dolgozna
  function handleCurrentChange(id: string, checked: boolean) {
    onChange(
      data.map((e) =>
        e.id === id
          ? { ...e, current: checked, endDate: checked ? '' : e.endDate }
          : e
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b">
        <h2 className="text-sm font-semibold text-gray-700">Munkatapasztalat</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Húzd a <GripVertical className="size-3 inline" /> ikont a sorrend megváltoztatásához
        </p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-lg">
          <Briefcase className="size-8 mx-auto mb-2 text-gray-300" />
          <p>Még nincs tapasztalat hozzáadva</p>
        </div>
      ) : (
        // DndContext: a drag & drop "hatóköre" — ezen belül minden elem rendezhető
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {/* SortableContext: megmondja a dnd-kit-nek milyen sorrendben vannak az elemek */}
          <SortableContext
            items={data.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {data.map((entry, index) => (
                <SortableEntry
                  key={entry.id}
                  entry={entry}
                  index={index}
                  isOpen={openId === entry.id}
                  onToggle={() => setOpenId(openId === entry.id ? null : entry.id)}
                  onDelete={handleDelete}
                  onChange={handleChange}
                  onCurrentChange={handleCurrentChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2 border-dashed"
        onClick={handleAdd}
      >
        <Plus className="size-4" />
        Tapasztalat hozzáadása
      </Button>
    </div>
  )
}
