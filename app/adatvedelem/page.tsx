// Adatvédelmi tájékoztató oldal — Server Component
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Adatvédelmi tájékoztató – CV Builder',
  description:
    'Tájékoztatás a CV Builder által kezelt személyes adatokról, az adatkezelés céljáról és jogalapjáról.',
};

// ─── Szekció segédkomponens ───────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-3 bg-linear-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function AdatvedelemPage() {
  const lastUpdated = '2026. június 2.';

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Fejléc — azonos logóval mint a főoldalon */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-r from-slate-800 to-slate-400 text-white">
              <FileText className="size-4" />
            </div>
            <span className="bg-linear-to-r from-slate-800 to-slate-400 bg-clip-text text-transparent">
              CV Builder
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
              <ArrowLeft className="size-4" />
              Vissza a főoldalra
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
          {/* Oldal cím */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 bg-linear-to-r from-slate-800 to-slate-400 bg-clip-text text-transparent">
              Adatvédelmi tájékoztató
            </h1>
            <p className="text-sm text-slate-500">Utoljára frissítve: {lastUpdated}</p>
          </div>

          <div className="rounded-2xl border bg-card p-8 sm:p-10 shadow-sm">

            <Section title="1. Az adatkezelő adatai">
              <p>
                <strong>Szolgáltatás neve:</strong> CV Builder
              </p>
              <p>
                <strong>Üzemeltető:</strong> Dudás Tamás (magánszemély, fejlesztési célú projekt)
              </p>
              <p>
                <strong>Kapcsolat:</strong> ddstms12@gmail.com
              </p>
              <p>
                Ez az alkalmazás oktatási/tanulási célból készült. Az adatkezelés az Európai Unió
                általános adatvédelmi rendeletének (GDPR – 2016/679/EU rendelet) előírásai szerint
                történik.
              </p>
            </Section>

            <Section title="2. Milyen adatokat gyűjtünk?">
              <p>A regisztráció és az alkalmazás használata során az alábbi személyes adatokat kezeljük:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Regisztrációs adatok:</strong> teljes név, e-mail cím, jelszó (titkosítva
                  tárolva)
                </li>
                <li>
                  <strong>Önéletrajz tartalma:</strong> a te által megadott adatok (pl. telefonszám,
                  lakcím, munkahely, iskolai végzettség, készségek, fénykép)
                </li>
                <li>
                  <strong>Technikai adatok:</strong> fiók létrehozásának és módosításának időpontja,
                  az adatvédelmi tájékoztató elfogadásának időpontja
                </li>
              </ul>
              <p>
                Nem gyűjtünk analitikai adatokat, nem használunk követő cookie-kat, és nem adunk
                át adatokat harmadik félnek marketing célból.
              </p>
            </Section>

            <Section title="3. Az adatkezelés célja és jogalapja">
              <p>
                <strong>Cél:</strong> A szolgáltatás nyújtása — azaz a felhasználói fiók
                kezelése, az önéletrajzok tárolása és szerkesztésének lehetővé tétele.
              </p>
              <p>
                <strong>Jogalap (GDPR 6. cikk):</strong>
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Szerződés teljesítése [6(1)(b)]</strong> — a regisztráció és az
                  önéletrajz-adatok kezelése a szolgáltatás nyújtásához szükséges
                </li>
                <li>
                  <strong>Hozzájárulás [6(1)(a)]</strong> — a regisztráció során kifejezetten
                  elfogadod ezt a tájékoztatót
                </li>
              </ul>
            </Section>

            <Section title="4. Cookie-k (sütik) használata">
              <p>
                Az alkalmazás kizárólag <strong>technikailag szükséges cookie-kat</strong> használ.
                Ezek a bejelentkezési munkamenet fenntartásához elengedhetetlenek, és az Ön
                hozzájárulása nélkül is alkalmazhatók az ePrivacy irányelv szerint.
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Munkamenet cookie (sb-*-auth-token):</strong> a Supabase autentikációs
                  rendszere állítja be. Csak a bejelentkezés idejére érvényes, httpOnly flag-gel
                  védett (JavaScript nem férhet hozzá).
                </li>
                <li>
                  <strong>Cloudflare Turnstile:</strong> a regisztrációs és bejelentkezési
                  űrlapon bot-védelem céljából. A Cloudflare adatvédelmi irányelvei a{' '}
                  <a
                    href="https://www.cloudflare.com/privacypolicy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
                  >
                    cloudflare.com/privacypolicy
                  </a>{' '}
                  oldalon találhatók.
                </li>
              </ul>
              <p>
                Nem használunk analitikai, marketing vagy nyomkövetési cookie-kat (pl. Google
                Analytics, Facebook Pixel).
              </p>
            </Section>

            <Section title="5. Adattárolás és biztonság">
              <p>
                Az adatok tárolása a <strong>Supabase</strong> platformon (Amazon Web Services,
                EU régió) történik. A Supabase adatvédelmi szabályzata:{' '}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
                >
                  supabase.com/privacy
                </a>
                .
              </p>
              <p>
                Az adatokhoz kizárólag te férhetsz hozzá — az adatbázis Row Level Security (RLS)
                szabályok biztosítják, hogy más felhasználó nem láthatja az önéletrajzaidat.
              </p>
              <p>
                A jelszavak titkosítva tárolódnak, közvetlen hozzáférésük senkinek nincs.
              </p>
            </Section>

            <Section title="6. Adatmegőrzési idő">
              <p>
                Az adatokat mindaddig megőrizzük, amíg a felhasználói fiók aktív. A fiók
                törlésével (ha ez a funkció elérhető) valamennyi személyes adat törlésre kerül az
                adatbázisból.
              </p>
            </Section>

            <Section title="7. A te jogaid (GDPR)">
              <p>Az alábbi jogokat gyakorolhatod az adatkezelőnél:</p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>
                  <strong>Hozzáférés joga:</strong> kérheted, hogy tájékoztassunk a kezelt
                  adataidról
                </li>
                <li>
                  <strong>Helyesbítés joga:</strong> kérheted a pontatlan adatok javítását
                </li>
                <li>
                  <strong>Törlés joga ("elfeledtetéshez való jog"):</strong> kérheted az adataid
                  törlését
                </li>
                <li>
                  <strong>Hordozhatóság joga:</strong> kérheted az adataidat géppel olvasható
                  formátumban
                </li>
                <li>
                  <strong>Tiltakozás joga:</strong> tiltakozhatsz az adatkezelés ellen
                </li>
              </ul>
              <p>
                Jogaid gyakorlásához írj a <strong>ddstms12@gmail.com</strong> e-mail címre. A
                kérésre 30 napon belül válaszolunk.
              </p>
              <p>
                Panasszal fordulhatsz a <strong>Nemzeti Adatvédelmi és Információszabadság
                Hatósághoz</strong> (NAIH) is:{' '}
                <a
                  href="https://naih.hu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-700 underline underline-offset-2 hover:text-slate-900"
                >
                  naih.hu
                </a>
              </p>
            </Section>

            <Section title="8. Változások">
              <p>
                Fenntartjuk a jogot a tájékoztató módosítására. Lényeges változás esetén e-mailben
                értesítjük a regisztrált felhasználókat. A módosítás dátuma az oldal tetején
                mindig látható.
              </p>
            </Section>

          </div>
        </div>
      </main>

      {/* Lábléc */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2 font-medium text-foreground">
            <FileText className="size-4" />
            CV Builder
          </div>
          <p>© {new Date().getFullYear()} CV Builder</p>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-foreground transition-colors">
              Bejelentkezés
            </Link>
            <Link href="/auth/register" className="hover:text-foreground transition-colors">
              Regisztráció
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
