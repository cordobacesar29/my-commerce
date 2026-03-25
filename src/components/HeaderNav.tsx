"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/design-studio", label: "Diseñar" },
  { href: "/cart", label: "Carrito" },
] as const;

export const HeaderNav = () => {
  const pathname = usePathname();

  // Función para manejar el scroll suave si ya estamos en la Home
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === "/" && pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav 
      className="hidden md:flex items-center gap-1 px-1 py-1 bg-[#161616]/80 backdrop-blur-xl border border-[rgba(245,240,232,0.06)] rounded-lg"
    >
      {navLinks.map(({ href, label }) => {
        const active = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => handleScroll(e, href)}
            className={`
              px-5 py-2 text-[10px] font-heading font-bold uppercase tracking-[0.2em] 
              transition-all duration-300 ease-in-out
              ${active 
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