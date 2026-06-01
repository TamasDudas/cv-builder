// Navigációs sáv — Server Component
// A nyitóoldalon jelenik meg, tartalmazza a logót és a navigációs linkeket
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import MobileMenu from './mobile-menu';

export default async function Navbar() {
 // Megnézzük, be van-e jelentkezve a felhasználó,
 // hogy a megfelelő gombot mutassuk (Dashboard vs Bejelentkezés)
 const supabase = await createClient();
 const {
  data: { user },
 } = await supabase.auth.getUser();

 return (
  // Sticky nav — görgetéskor is látható marad az oldal tetején
  <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
   <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between">
    {/* Logó és alkalmazásnév */}
    <Link
     href="/"
     className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
    >
     {/* Logo ikon — slate gradiens háttér */}
     <div className="flex size-8 items-center justify-center rounded-lg bg-linear-to-r from-slate-800 to-slate-400 text-white">
      <FileText className="size-4" />
     </div>
     {/* "CV Builder" szöveg — slate gradiens */}
     <span className="bg-linear-to-r from-slate-800 to-slate-400 bg-clip-text text-transparent">
      CV Builder
     </span>
    </Link>

    {/* Középső navigációs linkek — csak nagyobb képernyőn láthatók */}
    <nav className="hidden md:flex items-center gap-6 text-sm chart-3">
     <a href="#features" className="hover:text-foreground transition-colors">
      Funkciók
     </a>
     <a
      href="#how-it-works"
      className="hover:text-foreground transition-colors"
     >
      Hogyan működik?
     </a>
    </nav>

    {/* Jobb oldali akció gombok — csak nagyobb képernyőn */}
    <div className="hidden md:flex items-center gap-2">
     {user ? (
      // Ha be van jelentkezve: Dashboard gomb
      <Link href="/dashboard">
       <Button
        size="sm"
        className="bg-linear-to-r from-slate-800 to-slate-400 border-0 hover:opacity-90 transition-opacity"
       >
        Dashboard
       </Button>
      </Link>
     ) : (
      // Ha nincs bejelentkezve: Bejelentkezés + Regisztráció
      <>
       <Link href="/auth/login">
        <Button variant="ghost" size="sm">
         Bejelentkezés
        </Button>
       </Link>
       <Link href="/auth/register">
        <Button
         size="sm"
         className="bg-linear-to-r from-slate-800 to-slate-400 border-0 hover:opacity-90 transition-opacity"
        >
         Kezdés — Ingyenes
        </Button>
       </Link>
      </>
     )}
    </div>

    {/* Mobil hamburger menü — csak kis képernyőn látható */}
    <MobileMenu isLoggedIn={!!user} />
   </div>
  </header>
 );
}
