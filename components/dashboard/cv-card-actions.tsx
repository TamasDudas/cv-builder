'use client'

// CV kártya műveletek — törlés megerősítő dialoggal és toast értesítőkkel
// MIÉRT külön Client Component: a dashboard Server Component, de a törlés
// interaktív (dialog + toast) → csak ezt a kis részt kell kliensre hozni.

import { useState, useTransition } from 'react'
import { Trash2 } from 'lucide-react'
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
import { toast } from 'sonner'
import { deleteCV } from '@/app/auth/cv-actions'

interface CVCardActionsProps {
  cvId: string
  cvTitle: string
}

export function CVCardActions({ cvId, cvTitle }: CVCardActionsProps) {
  const [open, setOpen] = useState(false)
  // useTransition: törlés közben spinner mehet, az UI nem fagy
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteCV(cvId)
        toast.success(`„${cvTitle}" törölve.`)
      } catch {
        toast.error('Törlés sikertelen. Próbáld újra!')
      }
      setOpen(false)
    })
  }

  return (
    <>
      {/* Törlés gomb — közvetlenül kezeli az open state-et, nincs asChild */}
      {/* MIÉRT nem AlertDialogTrigger: elkerüljük a beágyazott <button> hibát */}
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-destructive"
        aria-label="CV törlése"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>

      {/* Megerősítő ablak — MIÉRT: megelőzi a véletlen törlést */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Biztosan törlöd?</AlertDialogTitle>
            <AlertDialogDescription>
              A <span className="font-medium text-foreground">„{cvTitle}"</span> önéletrajz
              véglegesen törlődik. Ez a művelet nem vonható vissza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Mégsem</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Törlés...' : 'Törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
