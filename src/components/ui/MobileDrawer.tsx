"use client";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";
import Icon from "@/components/ui/AppIcon";
import { UserHeaderSection } from "../UserHeaderSection";

const navLinks = [
  { href: "/", label: "Inicio", protected: false },
  { href: "/design-studio", label: "Diseñar", protected: true },
  { href: "/cart", label: "Carrito", protected: true },
] as const;

export const MobileDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { navigateTo } = useProtectedNavigation();

  const handleNav = (href: string, isProtected: boolean) => {
    setIsOpen(false); // Cerramos el drawer inmediatamente para mejorar la percepción de velocidad

    // 1. Manejo de Scroll Suave si ya estamos en Inicio
    if (href === "/" && pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. Navegación mediante Next.js Router
    if (isProtected) {
      // Tu hook ya debería manejar el router.push internamente
      navigateTo(href);
    } else {
      // Usamos router.push en lugar de window.location.href para evitar el refresh
      router.push(href);
    }
  };

  return (
    <div className="md:hidden">
      {/* Botón Hamburguesa */}
      <button 
        onClick={() => setIsOpen(true)}
        className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors active:scale-95"
      >
        <Icon name="Bars3Icon" size={28} />
      </button>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Contenedor del Drawer */}
      <div className={`fixed top-0 right-0 z-[70] h-full w-[280px] bg-[#161616] border-l border-white/10 p-6 shadow-2xl transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex justify-between items-center mb-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Menú</span>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <Icon name="XMarkIcon" size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-10">
          <UserHeaderSection />
        </div>
        <nav className="flex flex-col gap-4">
          {navLinks.map(({ href, label, protected: isProtected }) => {
            const active = pathname === href;
            return (
              <button
                key={href}
                onClick={() => handleNav(href, isProtected)}
                className={`flex items-center justify-between w-full px-4 py-4 text-xs font-bold uppercase tracking-[0.2em] rounded-lg transition-all duration-300 ${
                  active 
                    ? "bg-white/10 text-[#d4af37] border border-[#d4af37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]" 
                    : "text-gray-400 border border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
                <Icon 
                  name="ChevronRightIcon" 
                  size={16} 
                  className={`transition-all duration-300 ${active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} 
                />
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-10 left-6 right-6 border-t border-white/5 pt-6">
           <p className="text-[8px] text-gray-600 tracking-widest uppercase text-center">
             Ramón Store © 2026
           </p>
        </div>
      </div>
    </div>
  );
};