"use client";

import dynamic from "next/dynamic";
import { motion, Variants } from "framer-motion";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";

const CanvasModel = dynamic(() => import("@/canvas"), {
  ssr: false,
});

export default function HeroSection() {
  const { navigateTo } = useProtectedNavigation();

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const stagger: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };
  const scrollToHowItWorks = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("how-it-works");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle at 60% 50%, rgba(200,169,110,0.25), transparent 65%)",
          filter: "blur(80px)",
        }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            // Cambié de 40s a 15s para que sea más rápido
            animation: "gridMove 5s linear infinite",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full pt-32 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div
              variants={fadeUp}
              className="tag mb-8 border border-gray-600/20 text-sm font-bold uppercase tracking-widest w-max p-2"
              style={{ color: "var(--accent-gold)" }}
            >
              Diseño con IA + Visualización 3D
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-(family-name:--font-archivo) font-black uppercase leading-[0.85] mb-6"
              style={{
                fontSize: "clamp(4rem, 12vw, 6.5rem)", // Tamaño masivo
              }}
            >
              <span className="text-white drop-shadow-2xl">Vestí lo que</span>
              <br />
              <span
                className="bg-clip-text text-transparent bg-linear-to-b from-white via-white to-[#C8A96E]"
                style={{
                  filter: "drop-shadow(0 0 20px rgba(200, 169, 110, 0.3))",
                }}
              >
                imaginás.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg leading-relaxed mb-10 max-w-md"
              style={{ color: "var(--text-muted)" }}
            >
              Describí tu idea, nuestra IA la convierte en un diseño único.
              Visualizalo en 3D y pedí tu remera personalizada en minutos.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-6 mt-4">
              {/* BOTÓN PRIMARIO CON GLOW */}
              <button
                onClick={() => navigateTo("/design-studio")}
                className="relative group"
              >
                {/* Capa de brillo animada al fondo */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-amber-500 to-yellow-300 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>

                <div className="relative px-8 py-4 bg-black rounded-lg leading-none flex items-center divide-x divide-gray-600">
                  <span className="pr-6 text-gray-100 font-bold tracking-wide">
                    Empezar a diseñar
                  </span>
                  <span className="pl-6 text-amber-400 group-hover:text-gray-100 transition duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="Arrow-right"
                      />
                      <path d="M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </button>

              {/* BOTÓN SECUNDARIO (BORDE FINO) */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-amber-500 to-yellow-300 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                <button
                  onClick={scrollToHowItWorks}
                  className="relative px-8 py-4 bg-black rounded-lg leading-none flex items-center divide-x divide-gray-600"
                >
                  <span className="pr-6 text-gray-100 font-bold tracking-wide">
                    Cómo funciona
                  </span>
                  <span className="pl-6 text-amber-400 group-hover:text-gray-100 transition duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="Arrow-right"
                      />
                      <path d="M13 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </motion.div>

            {/* STATS */}
            <motion.div variants={stagger} className="mt-12 flex gap-8">
              {[
                { num: "12.4K+", label: "Diseños creados" },
                { num: "98%", label: "Satisfacción" },
                { num: "48hs", label: "Envío express" },
              ].map(({ num, label }) => (
                <motion.div key={label} variants={fadeUp}>
                  <div
                    className="text-2xl font-heading font-800 mb-1"
                    style={{ color: "var(--accent-gold)", fontWeight: 800 }}
                  >
                    {num}
                  </div>

                  <div
                    className="text-xs uppercase tracking-widest"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT CANVAS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative flex items-center justify-center"
          >
            <div className="flex items-center justify-center w-full h-130 max-w-105">
              <CanvasModel autoRotate={true} />
            </div>

            {/* CARD IA */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-8 right-0 glass px-4 py-3 z-20"
              style={{
                minWidth: "160px",
                border: "1px solid var(--border-soft)",
              }}
            >
              <div
                className="text-xs uppercase tracking-widest font-bold"
                style={{ color: "var(--accent-gold)" }}
              >
                Generado por IA
              </div>
            </motion.div>

            {/* CARD PEDIDO */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-16 left-0 glass px-4 py-3 z-20"
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#4ade80" }}
                />

                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ALGODÓN 100% PEINADO
                </span>
              </div>

              <div
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Gramaje: 190g/m² (Heavyweight)
              </div>

              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                Corte: Oversize Premium · Sin costuras
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--bg-primary))",
        }}
      />
    </section>
  );
}
