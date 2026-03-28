"use client";

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

interface CheckoutStepProps {
  items: CartItem[];
  form: ShippingData;
  subtotal: number;
  shipping: number;
  total: number;
  isProcessing: boolean;
  errors: Partial<ShippingData>;
  onFieldChange: (key: keyof ShippingData, value: string) => void;
  onSubmit: () => void;
  onBackToCart: () => void;
  formatPrice: (p: number) => string;
  formatCardNumber: (val: string) => string;
  formatExpiry: (val: string) => string;
}

export const CheckoutStep = ({
  items,
  form,
  subtotal,
  shipping,
  total,
  isProcessing,
  errors,
  onFieldChange,
  onSubmit,
  onBackToCart,
  formatPrice,
  formatCardNumber,
  formatExpiry,
}: CheckoutStepProps) => {
  return (
    <div className="grid lg:grid-cols-12 gap-10">
      {/* Form Column */}
      <div className="lg:col-span-8 space-y-6">
        <PersonalInfoSection form={form} errors={errors} onFieldChange={onFieldChange} />
        <ShippingAddressSection form={form} errors={errors} onFieldChange={onFieldChange} />
        <PaymentInfoSection
          form={form}
          errors={errors}
          onFieldChange={onFieldChange}
          formatCardNumber={formatCardNumber}
          formatExpiry={formatExpiry}
        />
        <CheckoutActions
          isProcessing={isProcessing}
          total={total}
          onSubmit={onSubmit}
          onBackToCart={onBackToCart}
          formatPrice={formatPrice}
        />
      </div>

      {/* Order Summary Sidebar */}
      <CheckoutSummary
        items={items}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        formatPrice={formatPrice}
      />
    </div>
  );
};

interface PersonalInfoSectionProps {
  form: ShippingData;
  errors: Partial<ShippingData>;
  onFieldChange: (key: keyof ShippingData, value: string) => void;
}

const PersonalInfoSection = ({
  form,
  errors,
  onFieldChange,
}: PersonalInfoSectionProps) => {
  return (
    <FormSection title="Datos personales">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Nombre completo *"
          value={form.fullName}
          onChange={(val) => onFieldChange("fullName", val)}
          error={errors.fullName}
          placeholder="Valentina Moreno"
        />

        <FormInput
          label="Email *"
          type="email"
          value={form.email}
          onChange={(val) => onFieldChange("email", val)}
          error={errors.email}
          placeholder="tu@email.com"
        />

        <div className="md:col-span-2">
          <FormInput
            label="Teléfono *"
            type="tel"
            value={form.phone}
            onChange={(val) => onFieldChange("phone", val)}
            error={errors.phone}
            placeholder="+54 11 1234-5678"
          />
        </div>
      </div>
    </FormSection>
  );
};

interface ShippingAddressSectionProps {
  form: ShippingData;
  errors: Partial<ShippingData>;
  onFieldChange: (key: keyof ShippingData, value: string) => void;
}

const ShippingAddressSection = ({
  form,
  errors,
  onFieldChange,
}: ShippingAddressSectionProps) => {
  return (
    <FormSection title="Dirección de envío">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput
            label="Dirección *"
            value={form.address}
            onChange={(val) => onFieldChange("address", val)}
            error={errors.address}
            placeholder="Av. Corrientes 1234, Piso 3"
          />
        </div>

        <FormInput
          label="Ciudad *"
          value={form.city}
          onChange={(val) => onFieldChange("city", val)}
          error={errors.city}
          placeholder="Buenos Aires"
        />

        <div>
          <label
            className="block text-xs font-heading uppercase tracking-wider mb-2"
            style={{ color: "var(--text-muted)" }}
          >
            Provincia *
          </label>
          <select
            value={form.province}
            onChange={(e) => onFieldChange("province", e.target.value)}
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

        <FormInput
          label="Código postal"
          value={form.zipCode}
          onChange={(val) => onFieldChange("zipCode", val)}
          placeholder="1414"
        />
      </div>
    </FormSection>
  );
};

interface PaymentInfoSectionProps {
  form: ShippingData;
  errors: Partial<ShippingData>;
  onFieldChange: (key: keyof ShippingData, value: string) => void;
  formatCardNumber: (val: string) => string;
  formatExpiry: (val: string) => string;
}

const PaymentInfoSection = ({
  form,
  errors,
  onFieldChange,
  formatCardNumber,
  formatExpiry,
}: PaymentInfoSectionProps) => {
  return (
    <FormSection title="Datos de pago" badge="Mercado Pago">
      <div className="grid grid-cols-1 gap-4">
        <CardNumberInput
          value={form.cardNumber}
          onChange={(val) => onFieldChange("cardNumber", formatCardNumber(val))}
          error={errors.cardNumber}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Vencimiento *"
            value={form.cardExpiry}
            onChange={(val) => onFieldChange("cardExpiry", formatExpiry(val))}
            error={errors.cardExpiry}
            placeholder="MM/AA"
            maxLength={5}
          />

          <FormInput
            label="CVV *"
            value={form.cardCvv}
            onChange={(val) =>
              onFieldChange("cardCvv", val.replace(/\D/g, "").slice(0, 4))
            }
            error={errors.cardCvv}
            placeholder="123"
            maxLength={4}
          />
        </div>

        <FormInput
          label="Nombre en la tarjeta *"
          value={form.cardName}
          onChange={(val) => onFieldChange("cardName", val.toUpperCase())}
          error={errors.cardName}
          placeholder="VALENTINA MORENO"
        />
      </div>

      <p
        className="text-xs mt-5 flex items-center gap-2"
        style={{ color: "var(--text-muted)" }}
      >
        <Icon
          name="LockClosedIcon"
          size={12}
          style={{
            color: "var(--accent-gold)",
            flexShrink: 0,
          } as React.CSSProperties}
        />
        Tus datos están protegidos. Procesado por Mercado Pago.
      </p>
    </FormSection>
  );
};

interface FormSectionProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
}

const FormSection = ({ title, badge, children }: FormSectionProps) => {
  return (
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
          {title}
        </h2>
        {badge && <BadgeBadge badgeText={badge} />}
      </div>
      {children}
    </div>
  );
};

interface BadgeBadgeProps {
  badgeText: string;
}

const BadgeBadge = ({ badgeText }: BadgeBadgeProps) => {
  return (
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
        {badgeText}
      </span>
    </div>
  );
};

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  maxLength?: number;
}

const FormInput = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  maxLength,
}: FormInputProps) => {
  return (
    <div>
      <label
        className="block text-xs font-heading uppercase tracking-wider mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-soft)",
          color: "var(--text-primary)",
        }}
        className="w-full px-4 py-2.5 text-sm focus:border-[var(--accent-gold)] focus:ring-1 focus:ring-[var(--accent-gold)] transition-all outline-none placeholder:text-[var(--text-muted)]/50"
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {error && (
        <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
};

interface CardNumberInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

const CardNumberInput = ({ value, onChange, error }: CardNumberInputProps) => {
  return (
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
      {error && (
        <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
          {error}
        </p>
      )}
    </div>
  );
};

interface CheckoutActionsProps {
  isProcessing: boolean;
  total: number;
  onSubmit: () => void;
  onBackToCart: () => void;
  formatPrice: (p: number) => string;
}

const CheckoutActions = ({
  isProcessing,
  total,
  onSubmit,
  onBackToCart,
  formatPrice,
}: CheckoutActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={onBackToCart}
        className="flex-1 py-4 border font-bold uppercase text-xs tracking-wider hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
        style={{
          border: "1px solid var(--border-soft)",
          color: "var(--text-primary)",
        }}
      >
        <Icon name="ArrowLeftIcon" size={14} />
        Volver al carrito
      </button>
      <button
        onClick={onSubmit}
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
  );
};

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  formatPrice: (p: number) => string;
}

const CheckoutSummary = ({
  items,
  subtotal,
  shipping,
  total,
  formatPrice,
}: CheckoutSummaryProps) => {
  return (
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
            <CheckoutItemCard key={item.id} item={item} formatPrice={formatPrice} />
          ))}
        </div>

        <SummaryBreakdown
          subtotal={subtotal}
          shipping={shipping}
          total={total}
          formatPrice={formatPrice}
        />
      </div>
    </div>
  );
};

interface CheckoutItemCardProps {
  item: CartItem;
  formatPrice: (p: number) => string;
}

const CheckoutItemCard = ({ item, formatPrice }: CheckoutItemCardProps) => {
  return (
    <div className="flex items-center gap-3">
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
            style={{ color: "var(--text-muted)" } as React.CSSProperties}
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
  );
};

interface SummaryBreakdownProps {
  subtotal: number;
  shipping: number;
  total: number;
  formatPrice: (p: number) => string;
}

const SummaryBreakdown = ({
  subtotal,
  shipping,
  total,
  formatPrice,
}: SummaryBreakdownProps) => {
  return (
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
            color: shipping === 0 ? "#4ade80" : "var(--text-primary)",
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
  );
};