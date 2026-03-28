"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/AppIcon";
import { CartItem } from "@/schema/ICartItemSchema";
import { ShippingData } from "@/schema/IOrderSchema";
import { toast } from "sonner";

const PROVINCES = [
  "Buenos Aires",
  "CABA",
  "Córdoba",
  "Santa Fe",
  "Mendoza",
  "Tucumán",
  "Entre Ríos",
  "Salta",
  "Misiones",
  "Chaco",
];

const EMPTY_FORM: ShippingData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  zipCode: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  cardName: "",
};

export default function CartInteractive() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<ShippingData>(EMPTY_FORM);
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingData>>({});

  useEffect(() => {
    const load = () => {
      try {
        const stored = JSON.parse(
          localStorage.getItem("teeforge-cart") || "[]",
        ) as CartItem[];
        setItems(stored);
      } catch {
        setItems([]);
      }
    };
    load();
    globalThis.addEventListener("teeforge-cart-update", load);
    return () => globalThis.removeEventListener("teeforge-cart-update", load);
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(p);

  const subtotal = items.reduce((s, i) => s + i.priceUnit * i.quantity, 0);
  const shipping = subtotal > 8000 ? 0 : 1200;
  const total = subtotal + shipping;

  const updateQty = (id: string, delta: number) => {
    setItems((prev) => {
      const updated = prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0);
      localStorage.setItem("teeforge-cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("teeforge-cart-update"));
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("teeforge-cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("teeforge-cart-update"));
      return updated;
    });
  };

  const validateForm = () => {
    const errs: Partial<ShippingData> = {};
    if (!form.fullName.trim()) errs.fullName = "Requerido";
    if (!form.email.includes("@")) errs.email = "Email inválido";
    if (!form.phone.trim()) errs.phone = "Requerido";
    if (!form.address.trim()) errs.address = "Requerido";
    if (!form.city.trim()) errs.city = "Requerido";
    if (!form.province) errs.province = "Seleccioná una provincia";
    if (form.cardNumber.replace(/\s/g, "").length < 16)
      errs.cardNumber = "Número inválido";
    if (!form.cardExpiry.match(/^\d{2}\/\d{2}$/))
      errs.cardExpiry = "Formato MM/AA";
    if (form.cardCvv.length < 3) errs.cardCvv = "CVV inválido";
    if (!form.cardName.trim()) errs.cardName = "Requerido";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);

    // ⚠️ TODO: Connect to Mercado Pago API
    // const response = await fetch('/api/create-payment', {
    //   method: 'POST',
    //   body: JSON.stringify({ items, total, buyer: form }),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    // const { init_point } = await response.json();
    // window.location.href = init_point;

    await new Promise((r) => setTimeout(r, 2500));
    localStorage.removeItem("teeforge-cart");
    window.dispatchEvent(new Event("teeforge-cart-update"));
    setIsProcessing(false);
    setStep("success");
  };

  const setField = (key: keyof ShippingData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  // ── Step indicators helper ──
  const stepList = [
    { label: "Carrito", key: "cart", icon: "ShoppingCartIcon" },
    { label: "Datos", key: "checkout", icon: "CreditCardIcon" },
    { label: "Confirmado", key: "success", icon: "CheckBadgeIcon" },
  ];

  const stepIndex = stepList.findIndex((s) => s.key === step);

  // ── Success screen ──
  if (step === "success") {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div
              className="w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-full"
              style={{
                background: "rgba(74,222,128,0.12)",
                border: "2px solid rgba(74,222,128,0.3)",
              }}
            >
              <Icon
                name="CheckBadgeIcon"
                size={48}
                variant="solid"
                style={{ color: "#4ade80" } as React.CSSProperties}
              />
            </div>

            <h1
              className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              ¡Pedido
              <br />
              <span className="text-gradient-gold">confirmado!</span>
            </h1>

            <p
              className="text-lg leading-relaxed max-w-md mx-auto mb-8"
              style={{ color: "var(--text-muted)" }}
            >
              Tu pago fue procesado exitosamente. Recibirás un email de
              confirmación con el tracking de tu envío.
            </p>
          </div>

          {/* Order Summary Card */}
          <div
            className="studio-panel p-8 mb-12"
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(200, 169, 110, 0.2)",
            }}
          >
            <div
              className="flex flex-col gap-4 mb-6 pb-6"
              style={{ borderBottom: "1px solid var(--border-soft)" }}
            >
              {items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p
                      className="text-sm font-heading font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.prompt.slice(0, 40)}
                      {item.prompt.length > 40 ? "..." : ""}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Talle {item.size} · ×{item.quantity}
                    </p>
                  </div>
                  <p
                    className="text-sm font-heading font-bold"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {formatPrice(item.priceUnit * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                <span style={{ color: "var(--text-primary)" }}>
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Envío</span>
                <span
                  style={{
                    color: shipping === 0 ? "#4ade80" : "var(--text-primary)",
                  }}
                >
                  {shipping === 0 ? "Gratis 🎉" : formatPrice(shipping)}
                </span>
              </div>
              <div
                className="flex justify-between text-lg font-heading font-bold pt-3"
                style={{ borderTop: "1px solid var(--border-soft)" }}
              >
                <span style={{ color: "var(--text-primary)" }}>Total</span>
                <span style={{ color: "var(--accent-gold)" }}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          {form.email && (
            <div
              className="p-6 mb-12 text-center"
              style={{
                background: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.2)",
              }}
            >
              <p className="text-xs uppercase tracking-widest text-[#4ade80] font-bold mb-2">
                Confirmación enviada a
              </p>
              <p style={{ color: "var(--text-primary)" }} className="font-mono">
                {form.email}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/design-studio"
              className="flex-1 py-4 bg-[var(--accent-gold)] text-black font-bold uppercase text-sm tracking-wider hover:bg-[#B6965D] transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="SparklesIcon" size={16} variant="solid" />
              Diseñar otra remera
            </Link>
            <Link
              href="/"
              className="flex-1 py-4 border border-[var(--border-soft)] text-white font-bold uppercase text-sm tracking-wider hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
            >
              Volver al inicio
              <Icon name="ArrowRightIcon" size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-12">
      {/* Page Header */}
      <header
        className="py-12 px-6 mb-12 border-b flex text-center"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <div className="max-w-7xl mx-auto ">
          {/* Title Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{
                background: "rgba(200, 169, 110, 0.1)",
                border: "1px solid rgba(200, 169, 110, 0.2)",
                color: "var(--accent-gold)",
              }}
            >
              <Icon name={step === "cart" ? "ShoppingCartIcon" : "CreditCardIcon"} size={12} variant="solid" />
              {step === "cart" ? "Tu carrito" : "Checkout"}
            </div>

            <h1
              className="text-4xl md:text-5xl font-heading font-black tracking-tight leading-[1.1] uppercase"
              style={{ color: "var(--text-primary)" }}
            >
              {step === "cart" ? (
                <>
                  Tu selección
                  <br />
                  <span className="text-gradient-gold">personalizada</span>
                </>
              ) : (
                <>
                  Completá
                  <br />
                  <span className="text-gradient-gold">tu pedido</span>
                </>
              )}
            </h1>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {stepList.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 flex items-center justify-center text-xs font-heading font-bold"
                    style={{
                      background:
                        i <= stepIndex
                          ? "var(--accent-gold)"
                          : "var(--bg-elevated)",
                      color:
                        i <= stepIndex
                          ? "var(--bg-primary)"
                          : "var(--text-muted)",
                      border:
                        i <= stepIndex
                          ? "1px solid var(--accent-gold)"
                          : "1px solid var(--border-soft)",
                    }}
                  >
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-xs font-heading uppercase tracking-widest hidden sm:inline"
                    style={{
                      color:
                        i <= stepIndex
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < stepList.length - 1 && (
                  <div
                    className="w-8 h-px mx-1 hidden sm:block"
                    style={{
                      background:
                        i < stepIndex
                          ? "var(--accent-gold)"
                          : "var(--border-soft)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* ── CART STEP ── */}
        {step === "cart" && (
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Items Column */}
            <div className="lg:col-span-8 space-y-4">
              {items.length === 0 ? (
                <div
                  className="text-center py-24"
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid var(--border-soft)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Icon
                    name="ShoppingCartIcon"
                    size={48}
                    className="mx-auto mb-4"
                    style={
                      { color: "var(--text-muted)" } as React.CSSProperties
                    }
                  />
                  <h3
                    className="text-2xl font-heading font-bold mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Tu carrito está vacío
                  </h3>
                  <p
                    className="text-sm mb-8"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Diseñá tu primera remera con IA y agregala acá.
                  </p>
                  <Link
                    href="/design-studio"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-gold)] text-black font-bold uppercase text-xs tracking-wider hover:bg-[#B6965D] transition-colors"
                  >
                    <Icon name="SparklesIcon" size={14} variant="solid" />
                    Ir al estudio de diseño
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-6"
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--border-soft)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div className="flex gap-5 items-start">
                      {/* Design Thumbnail */}
                      <div
                        className="flex-shrink-0 overflow-hidden"
                        style={{
                          width: "100px",
                          height: "100px",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-soft)",
                          position: "relative",
                        }}
                      >
                        {item.designUrl ? (
                          <img
                            src={item.designUrl}
                            alt="Diseño"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon
                              name="PhotoIcon"
                              size={32}
                              style={
                                {
                                  color: "var(--text-muted)",
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        )}
                        {/* Color swatch overlay */}
                        <div
                          className="absolute bottom-2 right-2 w-5 h-5 rounded-full border-2"
                          style={{
                            background: item.colorHex,
                            borderColor: "rgba(245,240,232,0.5)",
                          }}
                        />
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3
                              className="font-heading font-bold text-sm mb-1"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {item.prompt}
                            </h3>
                            <p
                              className="text-xs max-w-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              "{item.prompt}"
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 transition-colors flex-shrink-0 hover:bg-red-500/10"
                            style={{ color: "var(--text-muted)" }}
                            aria-label="Eliminar"
                          >
                            <Icon name="TrashIcon" size={16} />
                          </button>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          <span
                            className="text-[10px] px-3 py-1.5 font-heading font-bold uppercase tracking-wider"
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-soft)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Talle {item.size}
                          </span>
                          <div
                            className="flex items-center gap-1.5 text-[10px] font-heading uppercase tracking-wider"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{
                                background: item.colorHex,
                                borderColor: "var(--border-soft)",
                              }}
                            />
                            {item.colorName}
                          </div>
                        </div>

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              className="w-8 h-8 flex items-center justify-center transition-colors"
                              onClick={() => updateQty(item.id, -1)}
                              style={{
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-soft)",
                                color: "var(--text-muted)",
                              }}
                            >
                              −
                            </button>
                            <span
                              className="w-8 text-center font-heading font-bold text-sm"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {item.quantity}
                            </span>
                            <button
                              className="w-8 h-8 flex items-center justify-center transition-colors"
                              onClick={() => updateQty(item.id, 1)}
                              style={{
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border-soft)",
                                color: "var(--text-muted)",
                              }}
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right">
                            <div
                              className="font-heading font-bold"
                              style={{ color: "var(--accent-gold)" }}
                            >
                              {formatPrice(item.priceUnit * item.quantity)}
                            </div>
                            {item.quantity > 1 && (
                              <div
                                className="text-xs"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {formatPrice(item.priceUnit)} c/u
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {items.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                  <Link
                    href="/design-studio"
                    className="flex items-center gap-2 text-xs font-heading uppercase tracking-widest transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Icon name="PlusIcon" size={14} />
                    Agregar otro diseño
                  </Link>
                  <button
                    onClick={() => {
                      setItems([]);
                      localStorage.removeItem("teeforge-cart");
                      window.dispatchEvent(new Event("teeforge-cart-update"));
                    }}
                    className="text-xs font-heading uppercase tracking-widest transition-colors"
                    style={{
                      color: "var(--text-muted)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Vaciar carrito
                  </button>
                </div>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-4">
              <div
                className="p-8 sticky top-32"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-soft)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h2
                  className="text-sm font-heading font-bold uppercase tracking-widest mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  Resumen del pedido
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} unidades)
                    </span>
                    <span
                      className="text-sm font-heading font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Envío
                    </span>
                    <span
                      className="text-sm font-heading font-bold"
                      style={{
                        color:
                          shipping === 0 ? "#4ade80" : "var(--text-primary)",
                      }}
                    >
                      {shipping === 0 ? "Gratis 🎉" : formatPrice(shipping)}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Comprá más de {formatPrice(8000)} para envío gratis
                    </p>
                  )}
                </div>

                <div
                  className="flex justify-between py-4 mb-6"
                  style={{
                    borderTop: "1px solid var(--border-soft)",
                    borderBottom: "1px solid var(--border-soft)",
                  }}
                >
                  <span
                    className="text-base font-heading font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-xl font-heading font-bold"
                    style={{ color: "var(--accent-gold)" }}
                  >
                    {formatPrice(total)}
                  </span>
                </div>

                <button
                  onClick={() => items.length > 0 && setStep("checkout")}
                  disabled={items.length === 0}
                  className="w-full py-4 bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-[var(--accent-gold)] transition-colors flex items-center justify-center gap-2"
                  style={{
                    opacity: items.length === 0 ? 0.5 : 1,
                    cursor: items.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <span>Continuar al pago</span>
                  <Icon name="ArrowRightIcon" size={14} />
                </button>

                {/* Trust Badges */}
                <div className="mt-8 space-y-3">
                  {[
                    {
                      icon: "ShieldCheckIcon",
                      label: "Pago seguro con Mercado Pago",
                    },
                    { icon: "TruckIcon", label: "Envío a toda Argentina" },
                    {
                      icon: "ArrowPathIcon",
                      label: "Garantía de satisfacción",
                    },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon
                        name={icon as any}
                        size={14}
                        style={
                          {
                            color: "var(--accent-gold)",
                            flexShrink: 0,
                          } as React.CSSProperties
                        }
                      />
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── CHECKOUT STEP ── */}
        {step === "checkout" && (
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Form Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal Info */}
              <div
                className="p-8"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-soft)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h2
                  className="text-sm font-heading font-bold uppercase tracking-widest mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  Datos personales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-xs font-heading uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                      placeholder="Valentina Moreno"
                    />
                    {errors.fullName && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-xs font-heading uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label
                      className="block text-xs font-heading uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                      placeholder="+54 11 1234-5678"
                    />
                    {errors.phone && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div
                className="p-8"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-soft)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h2
                  className="text-sm font-heading font-bold uppercase tracking-widest mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  Dirección de envío
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      className="block text-xs font-heading uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Dirección *
                    </label>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setField("address", e.target.value)}
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                      placeholder="Av. Corrientes 1234, Piso 3"
                    />
                    {errors.address && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-xs font-heading uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                      placeholder="Buenos Aires"
                    />
                    {errors.city && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-xs font-heading uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Provincia *
                    </label>
                    <select
                      value={form.province}
                      onChange={(e) => setField("province", e.target.value)}
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                      }}
                      className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none"
                    >
                      <option value="" style={{ background: "var(--bg-primary)" }}>
                        Seleccioná...
                      </option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p} style={{ background: "var(--bg-primary)" }}>
                          {p}
                        </option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.province}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      className="block text-xs font-heading uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Código postal
                    </label>
                    <input
                      type="text"
                      value={form.zipCode}
                      onChange={(e) => setField("zipCode", e.target.value)}
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                      placeholder="1414"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div
                className="p-8"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-soft)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-sm font-heading font-bold uppercase tracking-widest"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Datos de pago
                  </h2>
                  <div
                    className="flex items-center gap-2 px-3 py-1.5"
                    style={{
                      background: "rgba(0,158,227,0.1)",
                      border: "1px solid rgba(0,158,227,0.3)",
                    }}
                  >
                    <Icon
                      name="ShieldCheckIcon"
                      size={14}
                      style={{ color: "#009ee3" } as React.CSSProperties}
                    />
                    <span
                      className="text-[10px] font-heading font-bold uppercase tracking-wider"
                      style={{ color: "#009ee3" }}
                    >
                      Mercado Pago
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label
                      className="block text-xs font-heading uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Número de tarjeta *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.cardNumber}
                        onChange={(e) =>
                          setField("cardNumber", formatCardNumber(e.target.value))
                        }
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-soft)",
                          color: "var(--text-primary)",
                        }}
                        className="w-full px-4 py-2.5 pr-12 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      <Icon
                        name="CreditCardIcon"
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color: "var(--text-muted)" } as React.CSSProperties}
                      />
                    </div>
                    {errors.cardNumber && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-heading uppercase tracking-wider mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Vencimiento *
                      </label>
                      <input
                        type="text"
                        value={form.cardExpiry}
                        onChange={(e) =>
                          setField("cardExpiry", formatExpiry(e.target.value))
                        }
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-soft)",
                          color: "var(--text-primary)",
                        }}
                        className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                      {errors.cardExpiry && (
                        <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                          {errors.cardExpiry}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="block text-xs font-heading uppercase tracking-wider mb-2"
                        style={{ color: "var(--text-muted)" }}
                      >
                        CVV *
                      </label>
                      <input
                        type="text"
                        value={form.cardCvv}
                        onChange={(e) =>
                          setField(
                            "cardCvv",
                            e.target.value.replace(/\D/g, "").slice(0, 4),
                          )
                        }
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-soft)",
                          color: "var(--text-primary)",
                        }}
                        className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cardCvv && (
                        <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                          {errors.cardCvv}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      className="block text-xs font-heading uppercase tracking-wider mb-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Nombre en la tarjeta *
                    </label>
                    <input
                      type="text"
                      value={form.cardName}
                      onChange={(e) =>
                        setField("cardName", e.target.value.toUpperCase())
                      }
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-soft)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
                      placeholder="VALENTINA MORENO"
                    />
                    {errors.cardName && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.cardName}
                      </p>
                    )}
                  </div>
                </div>

                <p
                  className="text-xs mt-5 flex items-center gap-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Icon
                    name="LockClosedIcon"
                    size={12}
                    style={
                      {
                        color: "var(--accent-gold)",
                        flexShrink: 0,
                      } as React.CSSProperties
                    }
                  />
                  Tus datos están protegidos. Procesado por Mercado Pago.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setStep("cart")}
                  className="flex-1 py-4 border border-[var(--border-soft)] font-bold uppercase text-xs tracking-wider hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Icon name="ArrowLeftIcon" size={14} />
                  Volver al carrito
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="flex-1 py-4 bg-white text-black font-bold uppercase text-xs tracking-wider hover:bg-[var(--accent-gold)] transition-colors flex items-center justify-center gap-2"
                  style={{ opacity: isProcessing ? 0.8 : 1 }}
                >
                  {isProcessing ? (
                    <>
                      <span>Procesando…</span>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <span>Confirmar pago {formatPrice(total)}</span>
                      <Icon name="LockClosedIcon" size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4">
              <div
                className="p-8 sticky top-32"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--border-soft)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <h2
                  className="text-sm font-heading font-bold uppercase tracking-widest mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  Tu pedido
                </h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 overflow-hidden flex-shrink-0"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-soft)",
                        }}
                      >
                        {item.designUrl ? (
                          <img
                            src={item.designUrl}
                            alt="Diseño"
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <Icon
                            name="PhotoIcon"
                            size={20}
                            style={{
                              color: "var(--text-muted)",
                            } as React.CSSProperties}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-heading font-bold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.prompt.slice(0, 25)}
                        </div>
                        <div
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          ×{item.quantity} · T.{item.size}
                        </div>
                      </div>
                      <div
                        className="text-xs font-heading font-bold flex-shrink-0"
                        style={{ color: "var(--accent-gold)" }}
                      >
                        {formatPrice(item.priceUnit * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="space-y-2 pt-4"
                  style={{ borderTop: "1px solid var(--border-soft)" }}
                >
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                    <span style={{ color: "var(--text-primary)" }}>
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-muted)" }}>Envío</span>
                    <span
                      style={{
                        color:
                          shipping === 0 ? "#4ade80" : "var(--text-primary)",
                      }}
                    >
                      {shipping === 0 ? "Gratis" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div
                    className="flex justify-between text-base font-heading font-bold pt-2"
                    style={{ borderTop: "1px solid var(--border-soft)" }}
                  >
                    <span style={{ color: "var(--text-primary)" }}>Total</span>
                    <span style={{ color: "var(--accent-gold)" }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}