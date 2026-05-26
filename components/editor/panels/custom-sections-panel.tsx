'use client'

// Szabad szekciók szerkesztő panel — user által nevezett és feltöltött szekciók
// MIÉRT 'use client': useState, event handlerek és dnd-kit mind kliens oldali.
// Példa szekciók: "Nyelvtudás", "Hobbik", "Jogosítvány", bármi amit a user akar.

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
import {
  CustomSection,
  CustomItem,
  createEmptyCustomSection,
  createEmptyCustomItem,
} from '@/lib/types/cv'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { Plus, Trash2, ChevronDown, GripVertical, LayoutList } from 'lucide-react'

// ─────────────────────────────────────────────
// Egy húzható szekció kártya komponens
// MIÉRT külön komponens: useSortable hook-ot az adott elemen kell meghívni
// ─────────────────────────────────────────────
interface SortableSectionProps {
  section: CustomSection
  isOpen: boolean
  onToggle: () => void
  onDelete: (id: string) => void
  onTitleChange: (id: string, title: string) => void
  onAddItem: (sectionId: string) => void
  onDeleteItem: (sectionId: string, itemId: string) => void
  onItemChange: (sectionId: string, itemId: string, field: keyof CustomItem, value: string) => void
}

function SortableSection({
  section,
  isOpen,
  onToggle,
  onDelete,
  onTitleChange,
  onAddItem,
  onDeleteItem,
  onItemChange,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  // Megerősítő dialog állapota
  // MIÉRT lokális state: minden szekció saját dialogot kezel, nem kell felemelni
  const [deleteOpen, setDeleteOpen] = useState(false)

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
      className="border rounded-lg overflow-hidden bg-white"
    >
      {/* Szekció fejléc */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 transition-colors">

        {/* Drag handle */}
        <button
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0 touch-none"
          {...attributes}
          {...listeners}
          title="Húzd a sorrend megváltoztatásához"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </button>

        {/* Szekció cím — kattintásra nyit/csuk */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
          <p className="text-sm font-medium text-gray-800 truncate">
            {section.title || 'Névtelen szekció'}
          </p>
          <p className="text-xs text-gray-400">
            {section.items.length} elem
          </p>
        </div>

        {/* Törlés gomb — dialogot nyit, nem töröl azonnal */}
        <button
          className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
          onClick={(e) => { e.stopPropagation(); setDeleteOpen(true) }}
          title="Szekció törlése"
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

      {/* Szekció tartalom */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t">

          {/* Szekció neve */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">
              Szekció neve <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Szekció neve (pl. Nyelvtudás, Hobbik...)"
              value={section.title}
              onChange={(e) => onTitleChange(section.id, e.target.value)}
              className="text-sm font-medium"
            />
          </div>

          {/* Elemek listája */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Elemek</label>

            {section.items.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-1">
                Még nincs elem — adj hozzá egyet!
              </p>
            ) : (
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    {/* Bal mező: az elem neve — amit meg akar jeleníteni */}
                    <Input
                      placeholder="Megnevezés"
                      value={item.label}
                      onChange={(e) => onItemChange(section.id, item.id, 'label', e.target.value)}
                      className="text-sm flex-1"
                    />
                    {/* Jobb mező: szint, érték — opcionális */}
                    <Input
                      placeholder="Szint / érték (nem kötelező)"
                      value={item.value ?? ''}
                      onChange={(e) => onItemChange(section.id, item.id, 'value', e.target.value)}
                      className="text-sm flex-1 text-gray-500"
                    />
                    {/* Elem törlése */}
                    <button
                      className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      onClick={() => onDeleteItem(section.id, item.id)}
                      title="Elem törlése"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Elem hozzáadása gomb */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full gap-1.5 text-xs text-gray-500 border border-dashed hover:border-gray-300"
              onClick={() => onAddItem(section.id)}
            >
              <Plus className="size-3.5" />
              Elem hozzáadása
            </Button>
          </div>
        </div>
      )}
    </div>

    {/* Törlés megerősítő dialog — ugyanolyan mint a CV törlésénél */}
    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Biztosan törlöd?</AlertDialogTitle>
          <AlertDialogDescription>
            A{' '}
            <span className="font-medium text-foreground">
              „{section.title || 'Névtelen szekció'}"
            </span>{' '}
            szekció és az összes eleme véglegesen törlődik. Ez a művelet nem vonható vissza.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Mégsem</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => { onDelete(section.id); setDeleteOpen(false) }}
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
interface CustomSectionsPanelProps {
  data: CustomSection[]
  onChange: (updated: CustomSection[]) => void
}

export function CustomSectionsPanel({ data: rawData, onChange }: CustomSectionsPanelProps) {
  // MIÉRT ?? []: régi CV-k még nem tartalmaznak customSections mezőt
  const data = rawData ?? []

  const [openId, setOpenId] = useState<string | null>(data[0]?.id ?? null)

  // dnd-kit sensor — kis elmozdulás (8px) után indul a drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  // Szekciók átrendezése drag & drop után
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = data.findIndex((s) => s.id === active.id)
    const newIndex = data.findIndex((s) => s.id === over.id)
    onChange(arrayMove(data, oldIndex, newIndex))
  }

  // Új szekció hozzáadása
  function handleAddSection() {
    const newSection = createEmptyCustomSection()
    onChange([...data, newSection])
    setOpenId(newSection.id)
  }

  // Szekció törlése
  function handleDeleteSection(id: string) {
    const updated = data.filter((s) => s.id !== id)
    onChange(updated)
    if (openId === id) setOpenId(updated[0]?.id ?? null)
  }

  // Szekció nevének módosítása
  function handleTitleChange(id: string, title: string) {
    onChange(data.map((s) => (s.id === id ? { ...s, title } : s)))
  }

  // Új elem hozzáadása egy szekción belül
  function handleAddItem(sectionId: string) {
    const newItem = createEmptyCustomItem()
    onChange(
      data.map((s) =>
        s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
      )
    )
  }

  // Elem törlése egy szekción belül
  function handleDeleteItem(sectionId: string, itemId: string) {
    onChange(
      data.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s
      )
    )
  }

  // Elem mező módosítása (label vagy value)
  function handleItemChange(
    sectionId: string,
    itemId: string,
    field: keyof CustomItem,
    value: string
  ) {
    onChange(
      data.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map((i) =>
                i.id === itemId ? { ...i, [field]: value } : i
              ),
            }
          : s
      )
    )
  }

  return (
    <div className="space-y-4">
      <div className="pb-2 border-b">
        <h2 className="text-sm font-semibold text-gray-700">Profil szekciók</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Hozz létre saját szekciókat — pl. Nyelvtudás, Hobbik, Jogosítvány
        </p>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-lg">
          <LayoutList className="size-8 mx-auto mb-2 text-gray-300" />
          <p>Még nincs szekció hozzáadva</p>
          <p className="text-xs mt-1">pl. Nyelvtudás, Hobbik, Jogosítvány...</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={data.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {data.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  isOpen={openId === section.id}
                  onToggle={() => setOpenId(openId === section.id ? null : section.id)}
                  onDelete={handleDeleteSection}
                  onTitleChange={handleTitleChange}
                  onAddItem={handleAddItem}
                  onDeleteItem={handleDeleteItem}
                  onItemChange={handleItemChange}
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
        onClick={handleAddSection}
      >
        <Plus className="size-4" />
        Szekció hozzáadása
      </Button>
    </div>
  )
}
