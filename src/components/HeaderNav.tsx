"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

export const HeaderNav = () => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <div
      className="hidden md:flex items-center gap-1 px-1 py-1"
      style={{
        background: "rgba(22,22,22,0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(245,240,232,0.06)",
      }}
    >
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-5 py-2 text-xs font-heading font-bold uppercase tracking-widest transition-all duration-200`}
          style={
            isActive(link.href)
              ? {
                  color: "var(--accent-gold)",
                  border: "1px solid var(--accent-gold)",
                }
              : {}
          }
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
};

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/design-studio", label: "Diseñar" },
  { href: "/cart", label: "Carrito" },
];
