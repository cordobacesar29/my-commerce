"use client";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Inicio", protected: false },
  { href: "/design-studio", label: "Diseñar", protected: true },
  { href: "/cart", label: "Carrito", protected: true },
] as const;

export const HeaderNav = () => {
  const pathname = usePathname();
  const { navigateTo } = useProtectedNavigation();
  const router = useRouter();

  const handleNavigation = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    isProtected: boolean,
  ) => {
    e.preventDefault();
    // 1. Manejo de Scroll Suave en Home
    if (href === "/" && pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // 2. Lógica de Protección de Ruta
    if (isProtected) {
      navigateTo(href);
    } else {
      // Navegación normal para rutas no protegidas
      router.push(href);
    }
  };

  return (
    <nav className="hidden md:flex items-center gap-1 px-1 py-1 bg-[#161616]/80 backdrop-blur-xl border border-[rgba(245,240,232,0.06)] rounded-lg">
      {navLinks.map(({ href, label, protected: isProtected }) => {
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => handleNavigation(e, href, isProtected)}
            className={`
              px-5 py-2 text-[10px] font-heading font-bold uppercase tracking-[0.2em] 
              transition-all duration-300 ease-in-out
              ${
                active
                  ? "text-(--accent-gold) border border-(--accent-gold)"
                  : "text-gray-400 hover:text-white border border-transparent"
              }
            `}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
};
