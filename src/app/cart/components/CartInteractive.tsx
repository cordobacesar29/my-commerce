"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/AppIcon";

import { CartItem } from "@/schema/ICartItemSchema";
import { ShippingData } from "@/schema/IOrderSchema";

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
  const router = useRouter();
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

  // ── Success screen ──────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-6">
        <div
          className="max-w-lg w-full text-center p-16"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-gold)",
          }}
        >
          <div
            className="w-20 h-20 mx-auto mb-8 flex items-center justify-center"
            style={{
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.3)",
            }}
          >
            <Icon
              name="CheckBadgeIcon"
              size={40}
              variant="solid"
              style={{ color: "#4ade80" } as React.CSSProperties}
            />
          </div>
          <h2
            className="text-section mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            ¡Pedido
            <br />
            <span className="text-gradient-gold">confirmado!</span>
          </h2>
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "var(--text-muted)" }}
          >
            Tu pago fue procesado exitosamente. Recibirás un email de
            confirmación en{" "}
            <span style={{ color: "var(--accent-gold)" }}>
              {form.email || "tu correo"}
            </span>{" "}
            con el tracking de tu envío. Tu remera llegará en 48hs hábiles.
          </p>
          <div
            className="p-4 mb-8 text-left"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="text-xs font-heading uppercase tracking-widest mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Resumen del pedido
            </div>
            <div className="flex justify-between mb-2">
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                Total pagado
              </span>
              <span
                className="text-sm font-heading font-bold"
                style={{ color: "var(--accent-gold)" }}
              >
                {formatPrice(total)}
              </span>
            </div>
            {form.city && (
              <div className="flex justify-between">
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Envío a
                </span>
                <span
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {form.city}, {form.province}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/design-studio" className="btn-primary justify-center">
              <span>Diseñar otra remera</span>
              <Icon name="SparklesIcon" size={16} variant="solid" />
            </Link>
            <Link href="/homepage" className="btn-secondary justify-center">
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Step indicators helper ──────────────────────────────────────────
  const stepList = [
    { label: "Carrito", key: "cart", icon: "ShoppingCartIcon" },
    { label: "Datos", key: "checkout", icon: "CreditCardIcon" },
    { label: "Confirmado", key: "success", icon: "CheckBadgeIcon" },
  ];

  const stepIndex = stepList.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen pt-24">
      {/* Page header */}
      <div
        className="py-12 px-6"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="tag mb-3">
              <Icon name="ShoppingCartIcon" size={10} />
              {step === "cart" ? "Tu carrito" : "Checkout"}
            </div>
            <h1
              className="text-section"
              style={{ color: "var(--text-primary)" }}
            >
              {step === "cart" ? (
                <>
                  Tu selección
                  <br />
                  <span className="text-gradient-gold">personalizada.</span>
                </>
              ) : (
                <>
                  Completá
                  <br />
                  <span className="text-gradient-gold">tu pedido.</span>
                </>
              )}
            </h1>
          </div>

          {/* Step indicator */}
          <div className="hidden md:flex items-center gap-2">
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
                          : "1px solid var(--border-subtle)",
                    }}
                  >
                    {i < stepIndex ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-xs font-heading uppercase tracking-widest"
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
                    className="w-8 h-px mx-1"
                    style={{
                      background:
                        i < stepIndex
                          ? "var(--accent-gold)"
                          : "var(--border-subtle)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* ── CART STEP ── */}
        {step === "cart" && (
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Items */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {items.length === 0 ? (
                <div
                  className="text-center py-24"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-subtle)",
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
                    className="text-xl font-heading font-bold mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Tu carrito está vacío
                  </h3>
                  <p
                    className="text-sm mb-6"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Diseñá tu primera remera con IA y agregala acá.
                  </p>
                  <Link href="/design-studio" className="btn-primary">
                    <span>Ir al estudio</span>
                    <Icon name="SparklesIcon" size={16} variant="solid" />
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="cart-item p-5">
                    <div className="flex gap-5 items-start">
                      {/* Design thumbnail */}
                      <div
                        className="flex-shrink-0 overflow-hidden"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                          position: "relative",
                        }}
                      >
                        {item.designUrl ? (
                          <img
                            src={item.designUrl}
                            alt={`Diseño de remera`}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon
                              name="PhotoIcon"
                              size={28}
                              style={
                                {
                                  color: "var(--text-muted)",
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        )}
                        {/* Shirt color swatch overlay */}
                        <div
                          className="absolute bottom-1 right-1 w-3 h-3 rounded-full border"
                          style={{
                            background: item.colorHex,
                            borderColor: "rgba(245,240,232,0.3)",
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3
                              className="text-base font-heading font-bold mb-1"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {item.prompt}
                            </h3>
                            <p
                              className="text-xs truncate max-w-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              "{item.prompt}"
                            </p>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 transition-colors flex-shrink-0"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = "#ef4444")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color =
                                "var(--text-muted)")
                            }
                            aria-label="Eliminar item"
                          >
                            <Icon name="TrashIcon" size={16} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span
                            className="text-xs font-heading uppercase tracking-wider px-2 py-1"
                            style={{
                              background: "var(--bg-elevated)",
                              border: "1px solid var(--border-subtle)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            Talle {item.size}
                          </span>
                          <span
                            className="flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{
                                background: item.colorHex,
                                borderColor: "var(--border-medium)",
                              }}
                            />
                            {item.colorName}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Qty control */}
                          <div className="flex items-center gap-2">
                            <button
                              className="qty-btn"
                              onClick={() => updateQty(item.id, -1)}
                              aria-label="Disminuir cantidad"
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
                              className="qty-btn"
                              onClick={() => updateQty(item.id, 1)}
                              aria-label="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div
                              className="text-base font-heading font-bold"
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
                <div className="flex items-center justify-between pt-2">
                  <Link
                    href="/design-studio"
                    className="flex items-center gap-2 text-xs font-heading uppercase tracking-widest transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "var(--accent-gold)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-muted)")
                    }
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
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#ef4444")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "var(--text-muted)")
                    }
                  >
                    Vaciar carrito
                  </button>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-4">
              <div className="studio-panel p-6 sticky top-28">
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
                      Subtotal ({items.reduce((s, i) => s + i.quantity, 0)}{" "}
                      unidades)
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
                    borderTop: "1px solid var(--border-subtle)",
                    borderBottom: "1px solid var(--border-subtle)",
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
                  className="btn-primary w-full justify-center"
                  disabled={items.length === 0}
                  style={{
                    opacity: items.length === 0 ? 0.5 : 1,
                    cursor: items.length === 0 ? "not-allowed" : "pointer",
                  }}
                >
                  <span>Continuar al pago</span>
                  <Icon name="ArrowRightIcon" size={16} />
                </button>

                {/* Trust badges */}
                <div className="mt-6 space-y-2">
                  {[
                    {
                      icon: "ShieldCheckIcon",
                      label: "Pago seguro con Mercado Pago",
                    },
                    { icon: "TruckIcon", label: "Envío en 48hs hábiles" },
                    {
                      icon: "ArrowPathIcon",
                      label: "Garantía de satisfacción",
                    },
                  ].map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon
                        name={icon as "ShieldCheckIcon"}
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
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Form */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Personal info */}
              <div className="studio-panel p-6">
                <h2
                  className="text-sm font-heading font-bold uppercase tracking-widest mb-6"
                  style={{ color: "var(--text-primary)" }}
                >
                  Datos personales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
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
                      className="input-field"
                      placeholder="Valentina Moreno"
                    />
                    {errors.fullName && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                  {/* Email */}
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
                      className="input-field"
                      placeholder="valentina@email.com"
                    />
                    {errors.email && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.email}
                      </p>
                    )}
                  </div>
                  {/* Phone */}
                  <div>
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
                      className="input-field"
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

              {/* Shipping */}
              <div className="studio-panel p-6">
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
                      className="input-field"
                      placeholder="Av. Corrientes 1234, Piso 3 Dto. B"
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
                      className="input-field"
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
                      className="input-field"
                      style={{ appearance: "none", cursor: "pointer" }}
                    >
                      <option value="">Seleccioná...</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>
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
                      className="input-field"
                      placeholder="1414"
                    />
                  </div>
                </div>
              </div>

              {/* Payment — Mercado Pago mock */}
              <div className="studio-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-sm font-heading font-bold uppercase tracking-widest"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Datos de pago
                  </h2>
                  {/* Mercado Pago badge */}
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
                      className="text-xs font-heading font-bold uppercase tracking-wider"
                      style={{ color: "#009ee3" }}
                    >
                      Mercado Pago
                    </span>
                  </div>
                </div>

                {/* ⚠️ Note: In production, this would be replaced by Mercado Pago's SDK/redirect */}
                <div className="grid grid-cols-1 gap-4">
                  {/* Card number */}
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
                          setField(
                            "cardNumber",
                            formatCardNumber(e.target.value),
                          )
                        }
                        className="input-field pr-12"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Icon
                          name="CreditCardIcon"
                          size={18}
                          style={
                            {
                              color: "var(--text-muted)",
                            } as React.CSSProperties
                          }
                        />
                      </div>
                    </div>
                    {errors.cardNumber && (
                      <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                        {errors.cardNumber}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Expiry */}
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
                        className="input-field"
                        placeholder="MM/AA"
                        maxLength={5}
                      />
                      {errors.cardExpiry && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "#ef4444" }}
                        >
                          {errors.cardExpiry}
                        </p>
                      )}
                    </div>
                    {/* CVV */}
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
                        className="input-field"
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cardCvv && (
                        <p
                          className="text-xs mt-1"
                          style={{ color: "#ef4444" }}
                        >
                          {errors.cardCvv}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card holder */}
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
                      className="input-field"
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
                  className="text-xs mt-4 flex items-center gap-2"
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
                  Tus datos están protegidos con encriptación SSL. Procesado por
                  Mercado Pago.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setStep("cart")}
                  className="btn-secondary flex-1 justify-center"
                >
                  <Icon name="ArrowLeftIcon" size={16} />
                  <span>Volver al carrito</span>
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="btn-primary flex-1 justify-center"
                  style={{ opacity: isProcessing ? 0.8 : 1 }}
                >
                  {isProcessing ? (
                    <>
                      <span>Procesando pago…</span>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background: "var(--bg-primary)",
                              animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <span>Confirmar y pagar {formatPrice(total)}</span>
                      <Icon name="LockClosedIcon" size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-4">
              <div className="studio-panel p-6 sticky top-28">
                <h2
                  className="text-sm font-heading font-bold uppercase tracking-widest mb-5"
                  style={{ color: "var(--text-primary)" }}
                >
                  Tu pedido
                </h2>

                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 overflow-hidden flex-shrink-0"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {item.designUrl ? (
                          <img
                            src={item.designUrl}
                            alt={`Diseño ${item.prompt}`}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon
                              name="PhotoIcon"
                              size={16}
                              style={
                                {
                                  color: "var(--text-muted)",
                                } as React.CSSProperties
                              }
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-xs font-heading font-bold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.prompt}
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
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
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
                    style={{ borderTop: "1px solid var(--border-subtle)" }}
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
      </div>
    </div>
  );
}
