"use client";

import { motion, Variants } from "framer-motion";
import { useEffect, useRef } from "react";
import Icon from "@/components/ui/AppIcon";

interface Contributor {
  id: number;
  name: string;
  role: string;
  icon: string;
  color: string;
  description: string;
}

export default function ContributorsSection() {
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
      { threshold: 0.15 }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const floatVariants: Variants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const glowVariants: Variants = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(200, 169, 110, 0.1)",
        "0 0 40px rgba(200, 169, 110, 0.2)",
        "0 0 20px rgba(200, 169, 110, 0.1)",
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section
      id="contributors"
      ref={sectionRef}
      className="py-20 relative z-10 scroll-mt-24"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-6 border border-white/10 bg-white/5 px-3 py-1.5 rounded-sm">
            <Icon
              name="HeartIcon"
              size={12}
              className="text-red-400"
              variant="solid"
            />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">
              Colaboradores
            </span>
          </div>

          <motion.h2
            className="text-white font-black uppercase leading-[0.8]"
            style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
          >
            Gracias a quienes
            <br />
            <span className="text-gradient-gold">despertaron la IA</span>
          </motion.h2>

          <motion.p
            className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto mt-6 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Sin estos pilares tecnológicos y creativos, Ramón Store no sería posible.
          </motion.p>
        </motion.div>

        {/* Contributors Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {CONTRIBUTORS.map((contributor, index) => (
            <motion.div
              key={contributor.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="relative group"
            >
              {/* Card Container */}
              <motion.div
                variants={glowVariants}
                animate="animate"
                className="h-full p-8 rounded-lg transition-all duration-300"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(200, 169, 110, 0.15)",
                }}
              >
                {/* Icon Container */}
                <motion.div
                  variants={floatVariants}
                  animate="animate"
                  className="w-16 h-16 flex items-center justify-center mb-6 relative z-10"
                  style={{
                    background: `${contributor.color}15`,
                    border: `1px solid ${contributor.color}40`,
                  }}
                >
                  <Icon
                    name={contributor.icon}
                    size={28}
                    style={{ color: contributor.color } as React.CSSProperties}
                  />
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <h3
                    className="text-lg font-heading font-bold mb-1"
                    style={{ color: contributor.color }}
                  >
                    {contributor.name}
                  </h3>

                  <p
                    className="text-[11px] font-heading font-bold uppercase tracking-[0.15em] mb-3"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {contributor.role}
                  </p>

                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {contributor.description}
                  </p>
                </div>

                {/* Subtle gradient bg on hover */}
                <motion.div
                  className="absolute -bottom-12 -right-12 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"
                  style={{ background: contributor.color }}
                />

                {/* Border animation on hover */}
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${contributor.color}20 0%, transparent 100%)`,
                  }}
                />
              </motion.div>

              {/* Floating sparkle accent (top-right) */}
              <motion.div
                className="absolute -top-2 -right-2 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: contributor.color }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.15,
                }}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Cada compra que haces mantiene viva esta magia. ✨
          </p>
        </motion.div>
      </div>
    </section>
  );
}

const CONTRIBUTORS: Contributor[] = [
  {
    id: 1,
    name: "Tu Imaginación",
    role: "Inspiración",
    icon: "SparklesIcon",
    color: "#FF6B6B",
    description: "El chispazo inicial que encendió esta visión",
  },
  {
    id: 2,
    name: "Antropic Claude",
    role: "Arquitecto de Lógica",
    icon: "CommandLineIcon",
    color: "#4ECDC4",
    description: "Razonamiento y desarrollo de sistemas complejos",
  },
  {
    id: 3,
    name: "XAI Grok",
    role: "Artista de IA",
    icon: "PaintBrushIcon",
    color: "#FFD93D",
    description: "Transformando palabras en arte visual único",
  },
  {
    id: 4,
    name: "Mercado Pago",
    role: "Guardián de Transacciones",
    icon: "CreditCardIcon",
    color: "#6BCB77",
    description: "Haciendo posible cada compra con seguridad",
  },
  {
    id: 5,
    name: "Firebase",
    role: "Guardián de Datos",
    icon: "ServerStackIcon",
    color: "#FF9F43",
    description: "Asegurando que tus diseños vivan eternamente",
  },
];