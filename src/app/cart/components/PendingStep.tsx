"use client";

import Link from "next/link";
import Icon from "@/components/ui/AppIcon";
import { CartItem } from "@/schema/ICartItemSchema";
import { ShippingData } from "@/schema/IOrderSchema";

interface PendingStepProps {
  items: CartItem[];
  form: ShippingData;
  total: number;
  subtotal: number;
  shipping: number;
  formatPrice: (p: number) => string;
}

export const PendingStep = ({
  items,
  form,
  total,
  subtotal,
  shipping,
  formatPrice,
}: PendingStepProps) => {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Pending Header */}
        <PendingHeader />

        {/* What's happening section */}
        <WhatsHappeningSection />

        {/* Order Summary Card */}
        <OrderSummaryCard
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          formatPrice={formatPrice}
        />

        {/* Contact Info */}
        {form.email && <ContactInfo email={form.email} />}

        {/* Action Buttons */}
        <ActionButtons />
      </div>
    </div>
  );
};

const PendingHeader = () => {
  return (
    <div className="text-center mb-12">
      <div
        className="w-24 h-24 mx-auto mb-8 flex items-center justify-center rounded-full"
        style={{
          background: "rgba(251,191,36,0.12)",
          border: "2px solid rgba(251,191,36,0.3)",
        }}
      >
        <Icon
          name="ClockIcon"
          size={48}
          variant="solid"
          style={{ color: "#fbbf24" } as React.CSSProperties}
        />
      </div>

      <h1
        className="uppercase text-4xl md:text-5xl font-heading font-black tracking-tight mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Pago en
        <br />
        <span style={{ color: "#fbbf24" }}>revisión</span>
      </h1>

      <p
        className="text-lg leading-relaxed max-w-md mx-auto mb-8"
        style={{ color: "var(--text-muted)" }}
      >
        Tu pago se está procesando. Dependiendo del método elegido, puede tomar
        entre 1 a 48 horas confirmarse.
      </p>
    </div>
  );
};

const WhatsHappeningSection = () => {
  const steps = [
    {
      number: "1",
      title: "Validación",
      description: "Estamos verificando tu método de pago",
    },
    {
      number: "2",
      title: "Procesamiento",
      description: "Tu banco o billetera está confirmando la transacción",
    },
    {
      number: "3",
      title: "Confirmación",
      description: "Recibirás un email cuando se complete",
    },
  ];

  return (
    <div
      className="p-8 mb-12"
      style={{
        background: "rgba(251,191,36,0.08)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(251,191,36,0.2)",
      }}
    >
      <h2
        className="text-sm font-heading font-bold uppercase tracking-widest mb-6"
        style={{ color: "var(--text-primary)" }}
      >
        ¿Qué está pasando?
      </h2>

      <div className="space-y-4">
        {steps.map((step, i) => (
          <div key={step.number} className="flex gap-4">
            <div
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-xs font-heading font-bold"
              style={{
                background: "rgba(251,191,36,0.2)",
                color: "#fbbf24",
              }}
            >
              {step.number}
            </div>
            <div>
              <p
                className="text-sm font-heading font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {step.title}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface OrderSummaryCardProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  formatPrice: (p: number) => string;
}

const OrderSummaryCard = ({
  items,
  subtotal,
  shipping,
  total,
  formatPrice,
}: OrderSummaryCardProps) => {
  return (
    <div
      className="p-8 mb-12"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(10px)",
        border: "1px solid var(--border-soft)",
      }}
    >
      <OrderItemsList items={items} formatPrice={formatPrice} />

      <OrderSummary
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        formatPrice={formatPrice}
      />
    </div>
  );
};

interface OrderItemsListProps {
  items: CartItem[];
  formatPrice: (p: number) => string;
}

const OrderItemsList = ({ items, formatPrice }: OrderItemsListProps) => {
  return (
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
  );
};

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
  formatPrice: (p: number) => string;
}

const OrderSummary = ({
  subtotal,
  shipping,
  total,
  formatPrice,
}: OrderSummaryProps) => {
  return (
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
  );
};

interface ContactInfoProps {
  email: string;
}

const ContactInfo = ({ email }: ContactInfoProps) => {
  return (
    <div
      className="p-6 mb-12 text-center"
      style={{
        background: "rgba(251,191,36,0.08)",
        border: "1px solid rgba(251,191,36,0.2)",
        backdropFilter: "blur(10px)",
      }}
    >
      <p className="text-xs uppercase tracking-widest text-yellow-400 font-bold mb-2">
        Seguimiento
      </p>
      <p style={{ color: "var(--text-primary)" }} className="font-mono">
        {email}
      </p>
      <p
        className="text-xs mt-2"
        style={{ color: "var(--text-muted)" }}
      >
        Te notificaremos cuando el pago se confirme
      </p>
    </div>
  );
};

const ActionButtons = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link
        href="/design-studio"
        className="flex-1 py-4 bg-[var(--accent-gold)] text-black font-bold uppercase text-sm tracking-wider hover:bg-[#B6965D] transition-colors flex items-center justify-center gap-2"
      >
        <Icon name="SparklesIcon" size={16} variant="solid" />
        diseña otra remera
      </Link>
      <Link
        href="/"
        className="flex-1 py-4 border font-bold uppercase text-sm tracking-wider hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        style={{
          borderColor: "var(--border-soft)",
          color: "white",
        }}
      >
        Volver al inicio
        <Icon name="ArrowRightIcon" size={16} />
      </Link>
    </div>
  );
};
