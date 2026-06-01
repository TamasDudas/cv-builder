'use client';

// Egységes auth form — login és regisztráció egy komponensben
// MIÉRT usePathname: Az URL alapján döntjük el, hogy regisztrációs
// vagy bejelentkezési módban vagyunk-e. Így nincs duplikált kód,
// és az egyetlen különbség (Teljes név mező) feltételesen jelenik meg.
import { usePathname, useRouter } from 'next/navigation';
import { useActionState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { login, register, type AuthActionState } from '@/app/auth/actions';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

interface AuthFormProps {
 error?: string;
 message?: string;
}

export function AuthForm({ error: initialError, message: initialMessage }: AuthFormProps) {
 const pathname = usePathname();
 const router = useRouter();
 // MIÉRT ref: a Turnstile widget-et reset()-elni kell sikertelen kísérlet után,
 // különben a régi token érvénytelen marad és a következő submit is hibát ad
 const turnstileRef = useRef<TurnstileInstance>(null);

 // Az URL alapján döntjük el a módot — nincs szükség külön prop-ra
 const isRegister = pathname === '/auth/register';

 // useActionState: az action state-ként adja vissza a hibát/üzenetet,
 // MIÉRT: redirect() useActionState-ben hibát okoz, ezért state-et használunk
 const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
  isRegister ? register : login,
  null,
 );

 // MIÉRT useEffect: ha a regisztráció sikeres (state.message van), átirányítunk
 // a login oldalra, ahol a message megjelenik — jobb UX mint inline üzenet
 useEffect(() => {
  if (state?.message) {
   router.push(`/auth/login?message=${encodeURIComponent(state.message)}`);
  }
  // Hiba esetén a Turnstile token-t reseteljük, hogy új kérés indulhasson
  if (state?.error) {
   turnstileRef.current?.reset();
  }
 }, [state?.message, state?.error, router]);

 // Az URL-ből érkező vagy a Server Action által visszaadott hiba/üzenet
 const error = state?.error ?? initialError;
 const message = state?.message ?? initialMessage;

 return (
  <div className="space-y-4">
   {/* Hibaüzenet */}
   {error && (
    <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
     <AlertCircle className="size-4 shrink-0" />
     <span>{error}</span>
    </div>
   )}

   {/* Sikeres üzenet (pl. regisztráció utáni e-mail megerősítés) */}
   {message && (
    <div className="flex items-center gap-2 rounded-md border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
     <CheckCircle2 className="size-4 shrink-0" />
     <span>{message}</span>
    </div>
   )}

   <form action={formAction} className="space-y-4">
    {/* HONEYPOT mező — bot csapda
        MIÉRT position absolute / opacity-0: a CSS elrejti az emberek elől,
        de a botok kitöltik, mert végigmennek az összes input-on.
        Ha értéket tartalmaz → biztosan bot küldte a kérést → elutasítjuk */}
    <input
     type="text"
     name="website"
     tabIndex={-1}
     autoComplete="off"
     aria-hidden="true"
     className="absolute -left-2499.75 h-0 w-0 overflow-hidden opacity-0"
    />

    {/* Teljes név — csak regisztrációnál jelenik meg */}
    {isRegister && (
     <div className="space-y-1.5">
      <Label htmlFor="fullName">Teljes név</Label>
      <Input
       id="fullName"
       name="fullName"
       type="text"
       placeholder="Kovács János"
       autoComplete="name"
       required
       disabled={isPending}
      />
     </div>
    )}

    <div className="space-y-1.5">
     <Label htmlFor="email">E-mail cím</Label>
     <Input
      id="email"
      name="email"
      type="email"
      placeholder="pelda@email.hu"
      autoComplete="email"
      required
      disabled={isPending}
     />
    </div>

    <div className="space-y-1.5">
     <Label htmlFor="password">Jelszó</Label>
     <Input
      id="password"
      name="password"
      type="password"
      placeholder="••••••••"
      autoComplete={isRegister ? 'new-password' : 'current-password'}
      required
      minLength={isRegister ? 6 : undefined}
      disabled={isPending}
     />
     {/* Magyar validációs segítség — csak regisztrációnál */}
     {isRegister && (
      <p className="text-xs text-muted-foreground">
       Legalább 6 karakter hosszú legyen.
      </p>
     )}
    </div>

    {/* Cloudflare Turnstile CAPTCHA widget
        MIÉRT: láthatatlan bot-védelem, a token a hidden inputba kerül,
        amit a Server Action ellenőriz a Supabase-en keresztül.
        Ha nincs NEXT_PUBLIC_TURNSTILE_SITE_KEY env var, nem jelenik meg
        (fejlesztői környezetben nem akadályoz) */}
    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
     <Turnstile
      ref={turnstileRef}
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      options={{ theme: 'light' }}
      // A token automatikusan bekerül a cf-turnstile-response nevű hidden inputba
     />
    )}

    <Button
     type="submit"
     className="w-full bg-linear-to-r from-slate-800 to-slate-400"
     size="lg"
     disabled={isPending}
    >
     {isPending ? (
      <>
       <Loader2 className="size-4 animate-spin" />
       {isRegister ? 'Fiók létrehozása...' : 'Bejelentkezés...'}
      </>
     ) : isRegister ? (
      'Fiók létrehozása'
     ) : (
      'Bejelentkezés'
     )}
    </Button>
   </form>

   {/* Átváltás login ↔ register között */}
   <p className="text-center text-sm text-muted-foreground">
    {isRegister ? (
     <>
      Már van fiókod?{' '}
      <Link
       href="/auth/login"
       className="font-medium text-primary underline-offset-4 hover:underline"
      >
       Jelentkezz be
      </Link>
     </>
    ) : (
     <>
      Még nincs fiókod?{' '}
      <Link
       href="/auth/register"
       className="font-medium text-primary underline-offset-4 hover:underline"
      >
       Regisztrálj itt
      </Link>
     </>
    )}
   </p>
  </div>
 );
}
