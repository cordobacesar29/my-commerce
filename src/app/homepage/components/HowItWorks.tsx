"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Icon from "@/components/ui/AppIcon";
import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: "SparklesIcon" as const,
    title: "Describí tu idea",
    desc: "Escribí un prompt en lenguaje natural. Nuestra IA basada en DALL-E entiende tu visión y genera un diseño único al instante.",
    detail: '"Una galaxia con un astronauta tocando guitarra eléctrica"',
    color: "#C8A96E",
  },
  {
    number: "02",
    icon: "CubeIcon" as const,
    title: "Visualizalo en 3D",
    desc: "Tu diseño aparece sobre una remera 3D interactiva. Rotala, cambiá el color de la prenda y ajustá cada detalle en tiempo real.",
    detail: "Giro 360° · 8 colores de tela · Vista frontal y dorsal",
    color: "#8B9EFF",
  },
  {
    number: "03",
    icon: "TruckIcon" as const,
    title: "Pedí y recibí",
    desc: "Elegí talle, cantidad y pagá con Mercado Pago. Producimos e imprimimos tu remera con calidad premium y la enviamos a tu puerta.",
    detail: "Envío en 48hs · Pago seguro · Garantía de satisfacción",
    color: "#4ade80",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="py-1 relative z-10 scroll-mt-24"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        {/* Header de la sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-24 font-[family-name:var(--font-archivo)]">
          <div className="flex-1">
            {/* Tag con borde fino y tipografía técnica */}
            <motion.div className="inline-flex items-center gap-2 mb-8 border border-white/10 bg-white/5 px-3 py-1.5 rounded-sm">
              <Icon
                name="MapIcon"
                size={12}
                className="text-amber-500/80"
                variant="solid"
              />
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">
                El proceso
              </span>
            </motion.div>

            {/* Título Masivo - Estilo Teeforge */}
            <motion.h2
              className="text-white font-[900] uppercase  leading-[0.8]"
              style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
            >
              De la idea
              <br />
              <span className="text-gradient-gold">a tu puerta</span>
            </motion.h2>
          </div>

          {/* Descripción lateral (el párrafo que se ve a la derecha en tu imagen) */}
          <motion.p className="text-gray-500 text-lg leading-relaxed max-w-sm md:mb-4  font-medium">
            Tres pasos simples separan tu idea de una remera real. Sin
            conocimientos de diseño. Sin complicaciones.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={step.number}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="relative opacity-100"
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div
                className="card p-8 relative overflow-hidden h-full transition-all duration-500 group"
                style={{
                  // Fondo semi-transparente con blur
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  // Borde del mismo color que el icono con 20% de opacidad
                  border: `1px solid ${step.color}33`,
                }}
              >
                {/* Big number bg */}
                <span className="step-number opacity-10 group-hover:opacity-20 transition-opacity">
                  {step.number}
                </span>

                {/* Icon Container */}
                <div
                  className="w-14 h-14 flex items-center justify-center mb-6 relative z-10 transition-transform group-hover:scale-110 duration-500"
                  style={{
                    background: `${step.color}15`,
                    border: `1px solid ${step.color}40`,
                  }}
                >
                  <Icon
                    name={step.icon}
                    size={24}
                    style={{ color: step.color } as React.CSSProperties}
                  />
                </div>

                <h3
                  className="text-xl font-heading font-bold mb-3 relative z-10"
                  style={{ color: "var(--text-primary)" }}
                >
                  {step.title}
                </h3>

                <p
                  className="text-sm leading-relaxed mb-6 relative z-10"
                  style={{ color: "var(--text-muted)" }}
                >
                  {step.desc}
                </p>

                {/* Detail Box */}
                <div
                  className="text-[11px] font-heading font-bold px-4 py-3 relative z-10"
                  style={{
                    background: `${step.color}10`,
                    border: `1px solid ${step.color}20`,
                    color: step.color,
                    letterSpacing: "0.02em",
                  }}
                >
                  {step.detail}
                </div>

                {/* Glow de fondo sutil al hacer hover */}
                <div
                  className="absolute -bottom-12 -right-12 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                  style={{ background: step.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link href="/design-studio" className="btn-primary group">
            <span className="font-bold">Crear mi primera remera</span>
            <Icon
              name="ArrowRightIcon"
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
