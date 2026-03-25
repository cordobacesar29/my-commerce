import Link from "next/link";
import Icon from "@/components/ui/AppIcon";

export default function CTABanner() {
  const iconsAndLabelsArray = [
    { icon: "ShieldCheckIcon", label: "Pago seguro con Mercado Pago" },
    { icon: "TruckIcon", label: "Envío a todo el país" },
    { icon: "ArrowPathIcon", label: "Garantía de satisfacción" },
  ];
  return (
    <section className="pt-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative overflow-hidden p-12 md:p-20 text-center border border-[#C8A96E]/20">
          {/* Grid de fondo corregido para que sea sutil */}
          <div
            className="relative opacity-100"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          />
          {/* Resplandor radial para profundidad */}

          <div className="relative z-10">
            {/* Tag superior */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C8A96E]/10 border border-[#C8A96E]/20 text-[#C8A96E] text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
              <Icon name="BoltIcon" size={10} variant="solid" />
              Empezá gratis hoy
            </div>

            {/* Título con pesos tipográficos correctos */}
            <h2 className=" uppercase text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Tu remera perfecta <br />
              <span className="text-gradient-gold uppercase">te está esperando.</span>
            </h2>

            {/* Descripción */}
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto font-medium">
              Miles de personas ya diseñaron su remera ideal. Ahora{" "}
              <br className="hidden md:block" />
              es tu turno. Sin experiencia en diseño. Sin complicaciones.
            </p>

            {/* Botones estilo Imagen */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/design-studio"
                className="group relative flex items-center gap-2 bg-[#C8A96E] hover:bg-[#B6965D] text-black font-bold py-4 px-10 transition-all duration-300"
              >
                <span className="uppercase tracking-wider text-sm">
                  Crear mi diseño ahora
                </span>
                <Icon name="SparklesIcon" size={18} variant="solid" />
              </Link>
            </div>

            {/* Separador fino */}
            <div className="w-full h-px bg-[#C8A96E]/20 mb-20" />

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
              {iconsAndLabelsArray.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Icon
                    name={icon as any}
                    size={16}
                    className="text-[#C8A96E]"
                  />
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
