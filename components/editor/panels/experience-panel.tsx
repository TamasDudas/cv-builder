'use client'

// Tapasztalat és tanulmányok szerkesztő panel — drag & drop sorrenddel
// MIÉRT 'use client': useState, event handlerek és dnd-kit mind kliens oldali.
// MIÉRT egy panel: a munkatapasztalat és iskola struktúrája azonos,
// csak a feliratok (labelek) különböznek — type mező alapján váltunk.

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Building2, Briefcase, GraduationCap, Calendar, MapPin,
  Trash2, ChevronDown, GripVertical, AlertCircle,
} from 'lucide-react'

// ─────────────────────────────────────────────
// Típusfüggő feliratok — hogy ne kelljen if-else minden mezőnél
// MIÉRT objektum: olvashatóbb és könnyebb bővíteni, mint ternary operátorok
// ─────────────────────────────────────────────
const LABELS = {
  work: {
    companyLabel: 'Munkáltató neve',
    companyPlaceholder: 'Cég vagy szervezet neve',
    positionLabel: 'Betöltött pozíció',
    positionPlaceholder: 'Munkakör megnevezése',
    currentLabel: 'Jelenlegi munkahely',
    descriptionLabel: 'Feladatok, eredmények',
    descriptionPlaceholder: 'Minden sor egy bullet pont lesz:\nFő feladataid\nElért eredményeid\nHasznált technológiák',
    icon: Briefcase,
    badge: 'Munkahely',
  },
  education: {
    companyLabel: 'Intézmény neve',
    companyPlaceholder: 'Iskola, egyetem, főiskola neve',
    positionLabel: 'Szak / képzés',
    positionPlaceholder: 'Szak, diploma vagy képzés megnevezése',
    currentLabel: 'Jelenleg itt tanulok',
    descriptionLabel: 'Leírás, eredmények',
    descriptionPlaceholder: 'Minden sor egy bullet pont lesz:\nFő tantárgyak vagy területek\nElért eredmények, kitüntetések\nZáródolgozat témája',
    icon: GraduationCap,
    badge: 'Tanulmány',
  },
}

// ─────────────────────────────────────────────
// Egy húzható/rendezhető kártya komponens
// MIÉRT külön komponens: a useSortable hook-ot az adott elemen kell meghívni,
// nem a szülőben — ezért kiszervezzük.
// ─────────────────────────────────────────────
interface SortableEntryProps {
  entry: ExperienceEntry
  isOpen: boolean
  onToggle: () => void
  onDelete: (id: string) => void
  onChange: (id: string, field: keyof ExperienceEntry, value: string | boolean) => void
  onCurrentChange: (id: string, checked: boolean) => void
}

// --- Enter = következő input fókuszba ---
// MIÉRT: a user tabbal és enterrel egyaránt navigálhasson a mezők között.
// A kártya div-jét data-entry-card attribútummal jelöljük, hogy csak az adott
// bejegyzésen belüli inputok között ugráljon, ne a szomszéd kártyára.
function focusNextInput(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key !== 'Enter') return
  e.preventDefault()
  const card = e.currentTarget.closest('[data-entry-card]')
  if (!card) return
  // Csak sima szöveg/hónap inputok — checkbox-ot és disabled-et kihagyjuk
  const inputs = Array.from(
    card.querySelectorAll<HTMLInputElement>('input:not([type="checkbox"]):not([disabled])')
  )
  const idx = inputs.indexOf(e.currentTarget)
  const next = inputs[idx + 1]
  if (next) next.focus()
}

function SortableEntry({
  entry, isOpen, onToggle, onDelete, onChange, onCurrentChange,
}: SortableEntryProps) {
  // useSortable: a dnd-kit hook ami a drag logikát adja ehhez az elemhez
  const {
    attributes,     // aria attribútumok akadálymentességhez
    listeners,      // egér/érintés event listener-ek a drag handle-re
    setNodeRef,     // ref a DOM elemre — a dnd-kit erre méri a pozíciót
    transform,      // CSS transform a húzás közbeni pozícióhoz
    transition,     // CSS transition az animációhoz
    isDragging,     // igaz, ha éppen ezt húzzák
  } = useSortable({ id: entry.id })

  const [deleteOpen, setDeleteOpen] = useState(false)

  // MIÉRT ?? 'work': régi bejegyzéseknek még nincs type mezőjük — biztonságos fallback
  const entryType = entry.type ?? 'work'
  const labels = LABELS[entryType]
  const TypeIcon = labels.icon

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <>
    <div
      ref={setNodeRef}
      style={style}
      data-entry-card
      className="border rounded-lg overflow-hidden bg-white"
    >
      {/* Accordion fejléc */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 transition-colors">

        {/* Drag handle — csak ez az ikon húzható */}
        <button
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0 touch-none"
          {...attributes}
          {...listeners}
          title="Húzd a sorrend megváltoztatásához"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </button>

        {/* Típus ikon + szöveg — kattintásra nyit/csuk */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-1.5">
            {/* Kis ikon jelzi, hogy munkahely vagy tanulmány */}
            <TypeIcon className="size-3 text-gray-400 shrink-0" />
            <p className="text-sm font-medium text-gray-800 truncate">
              {entry.position || entry.company || 'Új bejegyzés'}
            </p>
          </div>
          {(entry.company || entry.startDate) && (
            <p className="text-xs text-gray-500 truncate pl-4">
              {entry.company}
              {entry.company && entry.startDate && ' · '}
              {entry.startDate && (
                entry.current
                  ? `${entry.startDate} – jelenleg`
                  : entry.endDate
                    ? `${entry.startDate} – ${entry.endDate}`
                    : entry.startDate
              )}
            </p>
          )}
        </div>

        {/* Típus badge — kis színes jelző */}
        <span className={`
          text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0
          ${entryType === 'work'
            ? 'bg-blue-50 text-blue-600'
            : 'bg-purple-50 text-purple-600'
          }
        `}>
          {labels.badge}
        </span>

        {/* Törlés gomb */}
        <button
          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
          onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }}
          title="Törlés"
        >
          <Trash2 className="size-3.5" />
        </button>

        {/* Nyíl ikon */}
        <div className="cursor-pointer shrink-0" onClick={onToggle}>
          <ChevronDown
            className={`size-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Accordion tartalom */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t">

          {/* Intézmény / Cég neve + Pozíció / Szak */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <Building2 className="size-3.5" />
                {labels.companyLabel} <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder={labels.companyPlaceholder}
                value={entry.company}
                onChange={(e) => onChange(entry.id, 'company', e.target.value)}
                onKeyDown={focusNextInput}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                <TypeIcon className="size-3.5" />
                {labels.positionLabel} <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder={labels.positionPlaceholder}
                value={entry.position}
                onChange={(e) => onChange(entry.id, 'position', e.target.value)}
                onKeyDown={focusNextInput}
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

            {/* Jelenlegi munkahely / Jelenleg itt tanulok checkbox */}
            <label className="flex items-center gap-2 cursor-pointer w-fit select-none">
              <input
                type="checkbox"
                checked={entry.current}
                onChange={(e) => onCurrentChange(entry.id, e.target.checked)}
                className="rounded accent-primary"
              />
              <span className="text-xs text-gray-600">{labels.currentLabel}</span>
            </label>

            {/* Figyelmeztetés ha van kezdő dátum, de sem záró dátum, sem checkbox nincs kitöltve.
                MIÉRT nem blokkolás: a user szabadon menthet, de jelezzük hogy hiányos az adat —
                a preview-ban ilyenkor lógó kötőjel jelenne meg dátum nélkül */}
            {entry.startDate && !entry.endDate && !entry.current && (
              <p className="flex items-center gap-1.5 text-xs text-amber-600">
                <AlertCircle className="size-3.5 shrink-0" />
                Add meg a befejezés dátumát, vagy pipáld be a „{labels.currentLabel}" opciót
              </p>
            )}
          </div>

          {/* Helyszín */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
              <MapPin className="size-3.5" />
              Helyszín
              <span className="text-gray-400 font-normal">(nem kötelező)</span>
            </Label>
            <Input
              placeholder="Város, ország"
              value={entry.location ?? ''}
              onChange={(e) => onChange(entry.id, 'location', e.target.value)}
              onKeyDown={focusNextInput}
              className="text-sm"
            />
          </div>

          {/* Leírás / feladatok */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">
              {labels.descriptionLabel}
              <span className="text-gray-400 font-normal ml-1">(nem kötelező)</span>
            </Label>
            <Textarea
              placeholder={labels.descriptionPlaceholder}
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

    {/* Törlés megerősítő dialog */}
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Biztosan törlöd?</AlertDialogTitle>
          <AlertDialogDescription>
            A{' '}
            <span className="font-medium text-foreground">
              „{entry.position || entry.company || 'Névtelen bejegyzés'}"
            </span>{' '}
            bejegyzés véglegesen törlődik. Ez a művelet nem vonható vissza.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Mégsem</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => { onDelete(entry.id); setDeleteOpen(false) }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Törlés
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
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

  // dnd-kit sensor — kis elmozdulás (8px) után indul a drag,
  // így a kattintások (accordion, törlés) nem indítják el véletlenül
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = data.findIndex((e) => e.id === active.id)
    const newIndex = data.findIndex((e) => e.id === over.id)
    onChange(arrayMove(data, oldIndex, newIndex))
  }

  // MIÉRT type paraméter: ugyanaz a gomb logika, csak más típusú bejegyzést hoz létre
  // MIÉRT [newEntry, ...data]: az új bejegyzés a lista TETEJÉRE kerül,
  // így a user nem kénytelen legörgetni — rögtön látja a kitöltendő mezőket
  function handleAdd(type: 'work' | 'education') {
    const newEntry = createEmptyExperience(type)
    onChange([newEntry, ...data])
    setOpenId(newEntry.id)
  }

  function handleDelete(id: string) {
    const updated = data.filter((e) => e.id !== id)
    onChange(updated)
    if (openId === id) setOpenId(updated[0]?.id ?? null)
  }

  function handleChange(id: string, field: keyof ExperienceEntry, value: string | boolean) {
    onChange(data.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  // Jelenlegi munkahely / tanulmány váltása — current + endDate egyszerre módosul
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
      {/* ---- Fejléc ---- */}
      <div className="pb-2 border-b">
        <h2 className="text-sm font-semibold text-gray-700">Tapasztalat és tanulmányok</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Válaszd ki a bejegyzés típusát, majd töltsd ki az adatokat
        </p>
      </div>

      {/* ---- Hozzáadás gombok — felül, rögtön láthatók ---- */}
      {/* MIÉRT felül: a user az első dolga hogy kiválassza mit akar hozzáadni,
          ezért ne kelljen legörgetni a lista aljáig */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 border-dashed text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50"
          onClick={() => handleAdd('work')}
        >
          <Briefcase className="size-3.5" />
          Munkatapasztalat
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 border-dashed text-purple-600 hover:text-purple-700 hover:border-purple-300 hover:bg-purple-50"
          onClick={() => handleAdd('education')}
        >
          <GraduationCap className="size-3.5" />
          Tanulmány
        </Button>
      </div>

      {/* ---- Bejegyzések listája ---- */}
      {data.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-lg">
          <div className="flex justify-center gap-3 mb-2">
            <Briefcase className="size-6 text-gray-300" />
            <GraduationCap className="size-6 text-gray-300" />
          </div>
          <p>Még nincs bejegyzés hozzáadva</p>
          <p className="text-xs mt-1 text-gray-300">
            Használd a fenti gombokat az első bejegyzés hozzáadásához
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-2">
            Húzd a <GripVertical className="size-3 inline" /> ikont a sorrend megváltoztatásához
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={data.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {data.map((entry) => (
                  <SortableEntry
                    key={entry.id}
                    entry={entry}
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
        </>
      )}
    </div>
  )
}
