# CV Builder – Project Context

## Project overview

Önéletrajz készítő alkalmazás tanulási célból. A user regisztráció után
drag-and-drop módszerrel szerkeszti a CV-jét, jobb oldalon live preview-val.
Exportálható PDF-be, és adatbázisba menthető.
Referencia: https://app.flowcv.com/

## Learning context

Ez egy oktatási projekt. Minden generált kód mellé:

- Rövid magyar nyelvű komment hogy MIT csinál az adott rész
- Ha új koncepció kerül a kódba (pl. Server Action, RLS policy, hook),
  egy 2-3 soros magyarázat hogy MIÉRT így csináljuk

## Tech stack

- Next.js 14 (App Router, Server Components)
- Supabase (auth, PostgreSQL, storage)
- Tailwind CSS
- shadcn/ui komponensek
- dnd-kit (drag and drop)
- @react-pdf/renderer (PDF export)
- TypeScript (strict mode)

## Project structure

/app
/auth – login, register oldalak
/dashboard – mentett CV-k listája
/editor/[id] – szerkesztő oldal
/api – API route-ok (ha kell)
/components
/cv – CV szekció komponensek
/editor – drag-drop editor UI
/preview – live preview panel
/pdf – PDF template komponensek
/ui – shadcn/ui komponensek (auto-generált)
/lib
/supabase – client és server Supabase instance
/types – TypeScript típusok
/utils – segédfüggvények

## Conventions

- Magyar kommentek elfogadottak
- 'use client' csak ha feltétlenül szükséges
- Server Components az alapértelmezett
- Supabase server client: @/lib/supabase/server
- Supabase browser client: @/lib/supabase/client
- Minden TypeScript típus a /lib/types mappában
- shadcn/ui komponensek: npx shadcn@latest add [component]

## Database tables

- profiles (id, user_id, full_name, created_at)
- cvs (id, user_id, title, data jsonb, template, created_at, updated_at)
- CV data JSONB struktúra:
  {
  sections: [{ id, type, order, content }],
  personalInfo: { name, email, phone, location, summary }
  }

## Security rules

- RLS minden táblán engedélyezve
- User csak saját CV-jét láthatja/szerkesztheti
- policy: auth.uid() = user_id

## Key decisions

- CV tartalom JSONB-ben tárolva (flexibilis szekcióstruktúra)
- PDF generálás client-side (@react-pdf/renderer)
- Drag-drop csak client component, preview lehet server
- Képek: Supabase Storage (avatár, stb.)
- Ahol input mező van, ott legyen magyar nyelvű validáció

## Deployment

- Platform: Vercel
- Minden feature branch kap preview URL-t
- Production: main branch
- Environment variables: Vercel Dashboard → Settings → Environment Variables
- Szükséges env variables:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY

## Communication

- Mindig magyarul kommunikálj
- Magyar nyelvű magyarázatokat adj a generált kód mellé
- Ha kérdezel valamit, magyarul kérdezz
