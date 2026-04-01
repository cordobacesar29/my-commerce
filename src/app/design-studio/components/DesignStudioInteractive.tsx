"use client";

import { useState } from "react";
import Icon from "@/components/ui/AppIcon";
import dynamic from "next/dynamic";
import state from "@/store";
import {
  cartItemSchema,
  CartItem,
  LogoPosition,
  ShirtSize,
} from "@/schema/ICartItemSchema";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
const SHIRT_COLORS = [
  { hex: "#000000", name: "Negro" },
  { hex: "#2d2d2d", name: "Gris" },
  { hex: "#F5F0E8", name: "Blanco" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const AI_PROMPTS = ["Lobo geométrico low-poly con luna llena dorada"];

const BASE_PRICE = 500;

export default function DesignStudioInteractive() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDesign, setGeneratedDesign] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(SHIRT_COLORS[2]);
  const [selectedSize, setSelectedSize] = useState<ShirtSize>(ShirtSize.M);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [designTitle, setDesignTitle] = useState("Mi Diseño");
  const [activeLogoPosition, setActiveLogoPosition] = useState<LogoPosition>(
    LogoPosition.FrontCenter,
  );
  const addItem = useCartStore((state) => state.addItem);

  const totalPrice = BASE_PRICE * quantity;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(p);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setDesignTitle(prompt.slice(0, 30) + (prompt.length > 30 ? "…" : ""));

    await new Promise((r) => setTimeout(r, 2800));

    const mockImages = [
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=512&h=512&fit=crop&q=90",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=512&h=512&fit=crop&q=90",
      "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=512&h=512&fit=crop&q=90",
    ];
    const mockUrl = mockImages[Math.floor(Math.random() * mockImages.length)];
    toast.success("¡Diseño generado con éxito!");
    setGeneratedDesign(mockUrl);
    setIsGenerating(false);
  };

  const handleAddToCart = () => {
    const rawItem: CartItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      prompt: prompt || "Diseño personalizado",
      colorHex: selectedColor.hex,
      colorName: selectedColor.name,
      size: selectedSize,
      quantity,
      priceUnit: BASE_PRICE,
      designUrl: generatedDesign || "",
      position: activeLogoPosition,
    };

    // Validación con Zod (¡Muy bien mantenido esto!)
    const result = cartItemSchema.safeParse(rawItem);
    if (!result.success) {
      const errorMsg = result.error.issues[0].message;
      toast.error(errorMsg);
      return;
    }

    try {
      // 2. USAR EL STORE EN LUGAR DE LOCALSTORAGE MANUAL
      addItem(result.data);

      // Ya no necesitas dispatchEvent ni JSON.stringify manual
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
      toast.success("Tu diseño se agregó al carrito");
    } catch (err) {
      console.error("Error al guardar en el carrito:", err);
      toast.error("Hubo un problema al guardar tu diseño");
    }
  };

  return (
    <div className="min-h-screen pt-18 pb-24">
      {/* Page Header */}
      <header
        className="py-14 px-6 mb-12 border-b"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(200,169,110,0.1) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{
              background: "rgba(200, 169, 110, 0.1)",
              border: "1px solid rgba(200, 169, 110, 0.2)",
              color: "var(--accent-gold)",
            }}
          >
            <Icon name="SparklesIcon" size={12} variant="solid" />
            IA Creative Studio
          </div>

          <h1
            className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-4 uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            Diseñá tu remera <br />
            <span className="text-gradient-gold">
              con Inteligencia Artificial
            </span>
          </h1>

          <p
            className="text-lg leading-relaxed max-w-2xl mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            Transformá tus ideas en prendas únicas. Nuestra IA genera diseños
            exclusivos listos para estampar en calidad premium.
          </p>
        </div>
      </header>

      {/* Main Studio Layout */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Panel — Controls */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-32">
            {/* AI Generator Panel */}
            <section
              className="p-8"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(200, 169, 110, 0.2)",
              }}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="p-2"
                      style={{
                        background: "rgba(200, 169, 110, 0.1)",
                        color: "var(--accent-gold)",
                      }}
                    >
                      <Icon name="SparklesIcon" size={18} variant="solid" />
                    </div>
                    <h2
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Concepto Visual
                    </h2>
                  </div>
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: "var(--text-muted)" }}
                  >
                    STEP 01
                  </span>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describí tu idea artística..."
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-soft)",
                    color: "var(--text-primary)",
                  }}
                  className="resize-none w-full p-4 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none min-h-[120px] placeholder:text-[var(--text-muted)]/50"
                />

                {/* Quick Suggestions */}
                <div className="space-y-2">
                  <p
                    className="text-[10px] uppercase tracking-wider font-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Sugerencias rápidas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AI_PROMPTS.slice(0, 3).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPrompt(p)}
                        className="text-[10px] px-3 py-1.5 transition-all active:scale-95"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-soft)",
                          color: "var(--text-secondary)",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "var(--accent-gold)";
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--accent-gold)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor =
                            "var(--border-soft)";
                          (e.currentTarget as HTMLElement).style.color =
                            "var(--text-secondary)";
                        }}
                      >
                        {p.length > 25 ? `${p.slice(0, 25)}...` : p}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="group relative w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-primary)] font-bold uppercase text-xs tracking-[0.2em] overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(200,169,110,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isGenerating ? "Procesando Arte..." : "Generar Diseño"}
                    {!isGenerating && (
                      <Icon name="SparklesIcon" size={14} variant="solid" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] transition-transform" />
                </button>
              </div>
            </section>

            {/* Customization Panel */}
            <section
              className="p-8 space-y-8"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(200, 169, 110, 0.2)",
              }}
            >
              {/* Color Selector */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <h2
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Color Base
                  </h2>
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {selectedColor.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {SHIRT_COLORS.map((c) => {
                    const isActive = selectedColor.hex === c.hex;
                    return (
                      <button
                        key={c.hex}
                        onClick={() => {
                          setSelectedColor(c);
                          state.color = c.hex;
                        }}
                        className={`relative w-8 h-8 transition-all hover:scale-110 ${
                          selectedColor.hex === c.hex
                            ? "ring-2 ring-[var(--accent-gold)] ring-offset-4 ring-offset-[rgba(11,15,25,0.5)] scale-110"
                            : "opacity-70 hover:opacity-100"
                        }`}
                        style={{ background: c.hex }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div className="space-y-4">
                <h2
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-primary)" }}
                >
                  Talle
                </h2>
                <div className="grid grid-cols-5 gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s as ShirtSize)}
                      className={`py-3 text-[10px] font-bold transition-all ${
                        selectedSize === s
                          ? "bg-[var(--accent-gold)] text-[var(--bg-primary)]"
                          : "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      }`}
                      style={{
                        border:
                          selectedSize === s
                            ? "1px solid var(--accent-gold)"
                            : "1px solid var(--border-soft)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Checkout Panel */}
            <section
              className="p-8"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(200, 169, 110, 0.05) 100%)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(200, 169, 110, 0.2)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-tighter"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Inversión Total
                  </p>
                  <p
                    className="text-3xl font-heading font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {formatPrice(totalPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-[10px] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Cantidad
                  </p>
                  <div
                    className="flex items-center gap-3 px-2 py-1 mt-1"
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border-soft)",
                    }}
                  >
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={{ color: "var(--text-muted)" }}
                      className="hover:text-[var(--accent-gold)] transition-colors"
                    >
                      -
                    </button>
                    <span
                      className="text-xs font-bold min-w-[20px] text-center"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                      style={{ color: "var(--text-muted)" }}
                      className="hover:text-[var(--accent-gold)] transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isGenerating}
                className="w-full py-4 bg-white text-black font-bold uppercase text-[10px] tracking-widest hover:bg-[var(--accent-gold)] transition-colors flex items-center justify-center gap-2"
              >
                {addedToCart ? "¡AÑADIDO!" : "Añadir al Carrito"}
                <Icon
                  name={addedToCart ? "CheckIcon" : "ShoppingBagIcon"}
                  size={14}
                />
              </button>
            </section>
          </aside>

          {/* Right Panel — 3D Viewport */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[700px] overflow-hidden group">
              {/* 3D Canvas */}
              <div className="absolute inset-0 flex items-center justify-center">
                <CanvasModel
                  logoPosition={activeLogoPosition}
                  customLogo={generatedDesign ?? undefined}
                />
              </div>

              {/* HUD Controls */}
              <div
                className={`absolute bottom-6 whitespace-nowrap left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 transition-opacity duration-500 opacity-100 md:opacity-0 md:group-hover:opacity-100`}
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {[
                  { label: "Frente", id: "front_center" },
                  { label: "Pecho (Izq)", id: "front_chest" },
                  { label: "Espalda", id: "back_center" },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() =>
                      setActiveLogoPosition(pos.id as LogoPosition)
                    }
                    className={`px-4 py-2 text-[9px] font-bold uppercase tracking-tighter transition-all ${
                      activeLogoPosition === pos.id
                        ? "text-[var(--accent-gold)] bg-white/10"
                        : "text-white/60 active:text-white active:bg-white/5 md:hover:text-white md:hover:bg-white/5"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>

              {/* Generating Overlay */}
              {isGenerating && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                  <div className="relative mb-6">
                    <div
                      className="w-20 h-20 border-2 animate-ping"
                      style={{ borderColor: "rgba(200, 169, 110, 0.2)" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon
                        name="SparklesIcon"
                        size={32}
                        className="animate-pulse"
                        style={
                          {
                            color: "var(--accent-gold)",
                          } as React.CSSProperties
                        }
                        variant="solid"
                      />
                    </div>
                  </div>
                  <h3
                    className="text-lg font-heading font-bold uppercase tracking-[0.3em]"
                    style={{ color: "white" }}
                  >
                    IA Creativa
                  </h3>
                  <p
                    className="text-xs mt-2 font-mono italic"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Tejiendo hilos de datos en arte...
                  </p>
                </div>
              )}
            </div>

            {/* Design Info Card */}
            {generatedDesign && (
              <div
                className="p-6 flex items-center gap-6 animate-slide-up"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(200, 169, 110, 0.1) 0%, transparent 100%)",
                  border: "1px solid rgba(200, 169, 110, 0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div
                  className="w-20 h-20 overflow-hidden shadow-lg"
                  style={{
                    background: "black",
                    border: "1px solid rgba(200, 169, 110, 0.3)",
                  }}
                >
                  <img
                    src={generatedDesign}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4
                      className="font-heading font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {designTitle}
                    </h4>
                    <div
                      className="px-2 py-0.5 text-[8px] font-bold uppercase"
                      style={{
                        background: "rgba(74, 222, 128, 0.1)",
                        color: "#4ade80",
                        border: "1px solid rgba(74, 222, 128, 0.2)",
                      }}
                    >
                      Diseño Exclusivo
                    </div>
                  </div>
                  <p
                    className="text-xs leading-relaxed max-w-md"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Este patrón ha sido generado específicamente para tu cuenta.
                    La resolución es apta para impresión DTG de alta definición.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

const CanvasModel = dynamic(() => import("@/canvas"), {
  ssr: false,
});
