"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/schema/ICartItemSchema";
import { ShippingData } from "@/schema/IOrderSchema";
import { toast } from "sonner";
import { CartHeader } from "./CartHeader";
import { CartStep } from "./CartStep";
import { CheckoutStep } from "./CheckoutStep";
import { SuccessStep } from "./SuccessStep";

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

  // Load cart from localStorage
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

  // Format price
  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(p);

  // Calculate totals
  const subtotal = items.reduce((s, i) => s + i.priceUnit * i.quantity, 0);
  const shipping = subtotal > 8000 ? 0 : 1200;
  const total = subtotal + shipping;

  // Update item quantity
  const handleUpdateQty = (id: string, delta: number) => {
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

  // Remove item from cart
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("teeforge-cart", JSON.stringify(updated));
      window.dispatchEvent(new Event("teeforge-cart-update"));
      return updated;
    });
  };

  // Clear cart
  const handleClearCart = () => {
    setItems([]);
    localStorage.removeItem("teeforge-cart");
    window.dispatchEvent(new Event("teeforge-cart-update"));
  };

  // Validate checkout form
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

  // Handle checkout submission
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

    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 2500));

    localStorage.removeItem("teeforge-cart");
    window.dispatchEvent(new Event("teeforge-cart-update"));
    setIsProcessing(false);
    setStep("success");
  };

  // Update form field
  const handleFieldChange = (key: keyof ShippingData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Format card number
  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  // Format expiry
  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  // Render success step
  if (step === "success") {
    return (
      <SuccessStep
        items={items}
        form={form}
        total={total}
        subtotal={subtotal}
        shipping={shipping}
        formatPrice={formatPrice}
      />
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-12">
      <CartHeader currentStep={step} />

      <main className="max-w-7xl mx-auto px-6">
        {step === "cart" && (
          <CartStep
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onProceedCheckout={() => setStep("checkout")}
            formatPrice={formatPrice}
          />
        )}

        {step === "checkout" && (
          <CheckoutStep
            items={items}
            form={form}
            subtotal={subtotal}
            shipping={shipping}
            total={total}
            isProcessing={isProcessing}
            errors={errors}
            onFieldChange={handleFieldChange}
            onSubmit={handleCheckout}
            onBackToCart={() => setStep("cart")}
            formatPrice={formatPrice}
            formatCardNumber={formatCardNumber}
            formatExpiry={formatExpiry}
          />
        )}
      </main>
    </div>
  );
}