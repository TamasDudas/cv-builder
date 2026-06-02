-- =============================================================
-- profiles tábla bővítése: adatvédelmi nyilatkozat elfogadása
-- MIÉRT tároljuk: GDPR megköveteli, hogy bizonyítani tudjuk,
-- mikor fogadta el a felhasználó az adatvédelmi nyilatkozatot.
-- A timestamptz pontos dátumot és időzónát tartalmaz.
-- =============================================================

alter table public.profiles
  add column privacy_accepted_at timestamptz;

-- =============================================================
-- handle_new_user trigger frissítése
-- MIÉRT: Az új oszlop felvétele után a trigger-ben is rögzítjük
-- a regisztráció pillanatát mint az elfogadás időpontját.
-- (A felhasználó csak úgy tud regisztrálni, ha elfogadta.)
-- =============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, user_id, full_name, privacy_accepted_at)
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    now()
  );
  return new;
end;
$$;
