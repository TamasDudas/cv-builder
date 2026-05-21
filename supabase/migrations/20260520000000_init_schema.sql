-- =============================================================
-- CV Builder – kezdeti séma migráció
-- =============================================================
-- MIÉRT külön migrations mappa: A Supabase CLI ebből a mappából
-- futtatja a migrációkat sorrendben (fájlnév = timestamp prefix).
-- Laravel analógia: ez ugyanaz mint a database/migrations mappa,
-- ahol minden fájl egy "php artisan migrate"-tel futtatható lépés.
-- =============================================================


-- =============================================================
-- profiles tábla
-- Célja: a Supabase auth.users táblához kapcsolódó publikus
-- felhasználói adatok tárolása.
-- MIÉRT külön tábla: az auth.users Supabase belső tábla,
-- nem szabad közvetlenül módosítani. A profiles az "extension".
-- =============================================================
create table public.profiles (
  -- UUID, megegyezik az auth.users.id-vel (1:1 kapcsolat)
  id          uuid primary key references auth.users (id) on delete cascade,
  -- Redundánsan tároljuk a user_id-t is az RLS policy-khoz
  user_id     uuid not null references auth.users (id) on delete cascade,
  full_name   text,
  created_at  timestamptz not null default now(),
  -- Biztosítjuk, hogy egy userhez csak egy profil tartozhat
  constraint profiles_user_id_unique unique (user_id)
);

-- =============================================================
-- cvs tábla
-- Célja: a felhasználók CV-jeit tárolja, a tartalom JSONB-ben
-- MIÉRT JSONB: A CV szekciók rugalmas struktúrájúak (eltérő
-- mezők képzettségnél vs. tapasztalatnál), relációs táblákkal
-- ez komplikált lenne. JSONB gyors és indexelhető.
-- =============================================================
create table public.cvs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null default 'Névtelen CV',
  -- A CV teljes tartalma JSONB-ben:
  -- { sections: [{ id, type, order, content }], personalInfo: { name, email, ... } }
  data        jsonb not null default '{}'::jsonb,
  -- Jövőbeli sablon választáshoz (pl. "modern", "classic")
  template    text not null default 'default',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- updated_at automatikus frissítéséhez trigger függvény
-- MIÉRT: Ne kelljen az appkódban manuálisan beállítani az updated_at-et
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger cvs_set_updated_at
  before update on public.cvs
  for each row
  execute function public.set_updated_at();


-- =============================================================
-- Row Level Security (RLS) engedélyezése
-- MIÉRT RLS: Adatbázis szinten biztosítja, hogy egy user SOSEM
-- láthatja más adatait — még ha az appkódban lenne is hiba.
-- Laravel analógia: olyan mint egy globális scope minden query-re,
-- de ezt az adatbázis kényszeríti ki, nem az ORM.
-- =============================================================
alter table public.profiles enable row level security;
alter table public.cvs enable row level security;


-- =============================================================
-- RLS policy-k – profiles tábla
-- =============================================================

-- Saját profil olvasása
create policy "Felhasználó láthatja saját profilját"
  on public.profiles
  for select
  using (auth.uid() = user_id);

-- Saját profil szerkesztése
create policy "Felhasználó szerkesztheti saját profilját"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Profil létrehozása (a trigger is ezt használja service role-lal,
-- de a user maga is létrehozhat egyet ha még nincs)
create policy "Felhasználó létrehozhatja saját profilját"
  on public.profiles
  for insert
  with check (auth.uid() = user_id);


-- =============================================================
-- RLS policy-k – cvs tábla
-- =============================================================

-- Saját CV-k listázása / olvasása
create policy "Felhasználó láthatja saját CV-it"
  on public.cvs
  for select
  using (auth.uid() = user_id);

-- Új CV létrehozása
create policy "Felhasználó létrehozhat új CV-t"
  on public.cvs
  for insert
  with check (auth.uid() = user_id);

-- Meglévő CV szerkesztése
create policy "Felhasználó szerkesztheti saját CV-it"
  on public.cvs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- CV törlése
create policy "Felhasználó törölheti saját CV-it"
  on public.cvs
  for delete
  using (auth.uid() = user_id);


-- =============================================================
-- Automatikus profil létrehozás trigger
-- MIÉRT trigger: Registráció után azonnal legyen profil — nem
-- kell az appkódban külön meghívni. Ha az app-logika hibás lenne,
-- a profil akkor is létrejön.
-- Laravel analógia: mint egy model Observer boot() metódusa,
-- ami User::created() eseményre reagál.
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer                -- Service role jogokkal fut, hogy az RLS ne blokkolja
set search_path = public        -- Biztonságos search_path injection ellen
as $$
begin
  insert into public.profiles (id, user_id, full_name)
  values (
    new.id,
    new.id,
    -- Ha Google/GitHub OAuth-szal regisztrál, a raw_user_meta_data tartalmazza a nevet
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  return new;
end;
$$;

-- A trigger az auth sémán lévő users táblát figyeli (Supabase belső tábla)
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
