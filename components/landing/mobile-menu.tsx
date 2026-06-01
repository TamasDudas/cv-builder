'use client';

// Mobil hamburger menü — Client Component, mert állapotot kezel (nyitva/zárva)
// A Navbar-ból kapja meg, hogy be van-e jelentkezve a user
import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileMenuProps {
 isLoggedIn: boolean;
}

export default function MobileMenu({ isLoggedIn }: MobileMenuProps) {
 // Nyitott/zárt állapot kezelése
 const [isOpen, setIsOpen] = useState(false);

 const close = () => setIsOpen(false);

 return (
  // Csak kis képernyőn látható
  <div className="md:hidden">
   {/* Hamburger / X gomb */}
   <button
    onClick={() => setIsOpen((prev) => !prev)}
    aria-label="Menü megnyitása"
    className="p-2 rounded-md hover:bg-accent transition-colors"
   >
    {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
   </button>

   {/* Lenyíló mobilmenü panel */}
   {isOpen && (
    <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg z-40 px-4 py-4 flex flex-col gap-3">
     {/* Navigációs linkek */}
     <a
      href="#features"
      onClick={close}
      className="text-sm py-2 hover:text-foreground transition-colors"
     >
      Funkciók
     </a>
     <a
      href="#how-it-works"
      onClick={close}
      className="text-sm py-2 hover:text-foreground transition-colors"
     >
      Hogyan működik?
     </a>

     {/* Elválasztó vonal */}
     <hr className="my-1" />

     {/* Akció gombok */}
     {isLoggedIn ? (
      <Link href="/dashboard" onClick={close}>
       <Button
        className="w-full bg-linear-to-r from-slate-800 to-slate-400 border-0 hover:opacity-90 transition-opacity"
       >
        Dashboard
       </Button>
      </Link>
     ) : (
      <>
       <Link href="/auth/login" onClick={close}>
        <Button variant="outline" className="w-full">
         Bejelentkezés
        </Button>
       </Link>
       <Link href="/auth/register" onClick={close}>
        <Button className="w-full bg-linear-to-r from-slate-800 to-slate-400 border-0 hover:opacity-90 transition-opacity">
         Kezdés — Ingyenes
        </Button>
       </Link>
      </>
     )}
    </div>
   )}
  </div>
 );
}
