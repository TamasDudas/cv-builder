-- =============================================================
-- profiles tábla bővítése
-- MIÉRT külön migráció: Az init_schema már lefutott az adatbázison,
-- nem szabad visszamenőleg módosítani. Minden változás új fájl.
-- Laravel analógia: új migration fájl az "artisan make:migration"-nel.
-- =============================================================

-- Profilkép URL – Supabase Storage-ban tárolt kép hivatkozása
alter table public.profiles
  add column avatar_url text;

-- updated_at – automatikusan frissül, ha a profil módosul
alter table public.profiles
  add column updated_at timestamptz not null default now();

-- Ugyanaz a trigger függvény mint a cvs táblánál (set_updated_at már létezik)
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();
