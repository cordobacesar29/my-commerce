"use client";

import Link from "next/link";
import Icon from "@/components/ui/AppIcon";
import { CartItem } from "@/schema/ICartItemSchema";

interface CartStepProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedCheckout: () => void;
  formatPrice: (p: number) => string;
}

export const CartStep = ({
  items,
  subtotal,
  shipping,
  total,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
  formatPrice,
}: CartStepProps) => {
  return (
    <div className="grid lg:grid-cols-12 gap-10">
      {/* Items Column */}
      <div className="lg:col-span-8 space-y-4">
        {items.length === 0 ? (
          <EmptyCartState formatPrice={formatPrice} />
        ) : (
          <>
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdateQty={onUpdateQty}
                onRemove={onRemoveItem}
                formatPrice={formatPrice}
              />
            ))}
            <CartActions onClearCart={onClearCart} />
          </>
        )}
      </div>

      {/* Summary Sidebar */}
      <CartSummary
        items={items}
        subtotal={subtotal}
        shipping={shipping}
        total={total}
        onProceedCheckout={onProceedCheckout}
        formatPrice={formatPrice}
      />
    </div>
  );
};

interface EmptyCartStateProps {
  formatPrice: (p: number) => string;
}

const EmptyCartState = ({ formatPrice }: EmptyCartStateProps) => {
  return (
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
        style={{ color: "var(--text-muted)" } as React.CSSProperties}
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
  );
};

interface CartItemCardProps {
  item: CartItem;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  formatPrice: (p: number) => string;
}

const CartItemCard = ({
  item,
  onUpdateQty,
  onRemove,
  formatPrice,
}: CartItemCardProps) => {
  return (
    <div
      className="p-6"
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid var(--border-soft)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="flex gap-5 items-start">
        {/* Design Thumbnail */}
        <DesignThumbnail item={item} />

        {/* Item Info */}
        <CartItemInfo
          item={item}
          onUpdateQty={onUpdateQty}
          onRemove={onRemove}
          formatPrice={formatPrice}
        />
      </div>
    </div>
  );
};

interface DesignThumbnailProps {
  item: CartItem;
}

const DesignThumbnail = ({ item }: DesignThumbnailProps) => {
  return (
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
            style={{ color: "var(--text-muted)" } as React.CSSProperties}
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
  );
};

interface CartItemInfoProps {
  item: CartItem;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  formatPrice: (p: number) => string;
}

const CartItemInfo = ({
  item,
  onUpdateQty,
  onRemove,
  formatPrice,
}: CartItemInfoProps) => {
  return (
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
          onClick={() => onRemove(item.id)}
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
        <QuantityControl
          quantity={item.quantity}
          onUpdateQty={(delta) => onUpdateQty(item.id, delta)}
        />

        <PriceDisplay
          price={item.priceUnit * item.quantity}
          unitPrice={item.priceUnit}
          quantity={item.quantity}
          formatPrice={formatPrice}
        />
      </div>
    </div>
  );
};

interface QuantityControlProps {
  quantity: number;
  onUpdateQty: (delta: number) => void;
}

const QuantityControl = ({ quantity, onUpdateQty }: QuantityControlProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        className="w-8 h-8 flex items-center justify-center transition-colors"
        onClick={() => onUpdateQty(-1)}
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
        {quantity}
      </span>
      <button
        className="w-8 h-8 flex items-center justify-center transition-colors"
        onClick={() => onUpdateQty(1)}
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-soft)",
          color: "var(--text-muted)",
        }}
      >
        +
      </button>
    </div>
  );
};

interface PriceDisplayProps {
  price: number;
  unitPrice: number;
  quantity: number;
  formatPrice: (p: number) => string;
}

const PriceDisplay = ({
  price,
  unitPrice,
  quantity,
  formatPrice,
}: PriceDisplayProps) => {
  return (
    <div className="text-right">
      <div
        className="font-heading font-bold"
        style={{ color: "var(--accent-gold)" }}
      >
        {formatPrice(price)}
      </div>
      {quantity > 1 && (
        <div
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          {formatPrice(unitPrice)} c/u
        </div>
      )}
    </div>
  );
};

interface CartActionsProps {
  onClearCart: () => void;
}

const CartActions = ({ onClearCart }: CartActionsProps) => {
  return (
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
        onClick={onClearCart}
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
  );
};

interface CartSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  onProceedCheckout: () => void;
  formatPrice: (p: number) => string;
}

const CartSummary = ({
  items,
  subtotal,
  shipping,
  total,
  onProceedCheckout,
  formatPrice,
}: CartSummaryProps) => {
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
          Resumen del pedido
        </h2>

        <SummaryDetails
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          formatPrice={formatPrice}
        />

        <SummaryTotal total={total} formatPrice={formatPrice} />

        <button
          onClick={onProceedCheckout}
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

        <TrustBadges />
      </div>
    </div>
  );
};

interface SummaryDetailsProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  formatPrice: (p: number) => string;
}

const SummaryDetails = ({
  items,
  subtotal,
  shipping,
  formatPrice,
}: SummaryDetailsProps) => {
  return (
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
      
    </div>
  );
};

interface SummaryTotalProps {
  total: number;
  formatPrice: (p: number) => string;
}

const SummaryTotal = ({ total, formatPrice }: SummaryTotalProps) => {
  return (
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
  );
};

const TrustBadges = () => {
  const badges = [
    {
      icon: "ShieldCheckIcon",
      label: "Pago seguro con Mercado Pago",
    },
    { icon: "TruckIcon", label: "Envío a toda Argentina" },
    {
      icon: "ArrowPathIcon",
      label: "Garantía de satisfacción",
    },
  ];

  return (
    <div className="mt-8 space-y-3">
      {badges.map(({ icon, label }) => (
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
  );
};