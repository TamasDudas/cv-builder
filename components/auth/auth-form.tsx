'use client';

// Egységes auth form — login és regisztráció egy komponensben
// MIÉRT usePathname: Az URL alapján döntjük el, hogy regisztrációs
// vagy bejelentkezési módban vagyunk-e. Így nincs duplikált kód,
// és az egyetlen különbség (Teljes név mező) feltételesen jelenik meg.
import { usePathname } from 'next/navigation';
import { useActionState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { login, register, type AuthActionState } from '@/app/auth/actions';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface AuthFormProps {
 error?: string;
 message?: string;
}

export function AuthForm({ error: initialError, message: initialMessage }: AuthFormProps) {
 const pathname = usePathname();

 // Az URL alapján döntjük el a módot — nincs szükség külön prop-ra
 const isRegister = pathname === '/auth/register';

 // useActionState: az action state-ként adja vissza a hibát/üzenetet,
 // MIÉRT: redirect() useActionState-ben hibát okoz, ezért state-et használunk
 const [state, formAction, isPending] = useActionState<AuthActionState, FormData>(
  isRegister ? register : login,
  null,
 );

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
