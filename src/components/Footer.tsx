export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative z-10"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-6 pb-16">


        {/* Bottom row */}
        <div
          className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p
            className="text-xs font-heading font-bold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            © {year} Ramón Store — Todos los derechos reservados
          </p>
          <div className="flex items-center gap-6">
            <span
              className="text-xs font-heading uppercase tracking-widest cursor-pointer transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Privacidad
            </span>
            <span
              className="text-xs font-heading uppercase tracking-widest cursor-pointer transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              Términos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
