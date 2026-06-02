'use client';

// Cookie tájékoztató sáv — Client Component
// MIÉRT localStorage: a user döntését (elfogadta/elolvasta) a böngészőben tároljuk,
// nem kell DB-be menteni, mert ez nem opt-in hozzájárulás, csak tájékoztatás.
// (Csak szükséges cookie-k vannak, azokhoz nem kell explicit beleegyezés GDPR alatt.)
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cv-builder-cookie-notice-dismissed';

export default function CookieBanner() {
  // null = még nem tudjuk (SSR), false = mutatjuk, true = elrejtve
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  // MIÉRT useEffect: localStorage csak a böngészőben érhető el, szerveren nem.
  // Ezzel elkerüljük a hydration mismatch-et (szerver vs. kliens különbség).
  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setDismissed(true);
  }

  // Amíg nem tudjuk az állapotot (SSR / első render), semmit sem mutatunk
  if (dismissed !== false) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start gap-4 rounded-2xl border bg-card/95 backdrop-blur-sm shadow-lg px-5 py-4">
          {/* Ikon */}
          <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-r from-slate-800 to-slate-400 text-white">
            <Cookie className="size-4" />
          </div>

          {/* Szöveg */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground mb-0.5">
              Cookie-k (sütik) használata
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ez az oldal kizárólag a bejelentkezéshez szükséges munkamenet-cookie-kat használ.
              Nyomkövetési vagy analitikai sütik nincsenek.{' '}
              <Link
                href="/adatvedelem"
                className="font-medium text-foreground underline underline-offset-2 hover:opacity-70"
              >
                Adatvédelmi tájékoztató
              </Link>
            </p>
          </div>

          {/* Gombok */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleDismiss}
              className="h-8 px-3 text-xs bg-linear-to-r from-slate-800 to-slate-400 border-0 hover:opacity-90 transition-opacity"
            >
              Rendben
            </Button>
            <button
              onClick={handleDismiss}
              aria-label="Bezárás"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
