"use client";

import { useState, useEffect } from "react";
import { ContactData } from "@/schema/IOrderSchema";
import { toast } from "sonner";
import { CartHeader } from "./CartHeader";
import { CartStep } from "./CartStep";
import { CheckoutStep } from "./CheckoutStep";
import { SuccessStep } from "./SuccessStep";
import { FailureStep } from "./FailureStep";
import { PendingStep } from "./PendingStep";
import { useAuth } from "@/context/AuthContext";
import { useCartStore } from "@/store/useCartStore";

export type StepKey =
  | "cart"
  | "checkout"
  | "payment_processing"
  | "success"
  | "failure"
  | "pending";

const EMPTY_FORM: ContactData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  zipCode: "",

};

export default function CartInteractive() {
  // 1. Integración limpia con Zustand
  const { items, removeItem, clearCart, updateQuantity } = useCartStore();
  
  const [form, setForm] = useState<ContactData>(EMPTY_FORM);
  const [step, setStep] = useState<StepKey>("cart");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactData>>({});
  const [isMounted, setIsMounted] = useState(false);

  const { user } = useAuth();

  // 2. Manejo de Hidratación y Retorno de Mercado Pago
  useEffect(() => {
    setIsMounted(true);

    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");

    if (status === "success") {
      clearCart(); 
      setStep("success");
      window.history.replaceState({}, "", "/cart");
      toast.success("¡Gracias por tu compra!");
    } else if (status === "failure") {
      setStep("failure");
      window.history.replaceState({}, "", "/cart");
    } else if (status === "pending") {
      setStep("pending");
      window.history.replaceState({}, "", "/cart");
    }
  }, [clearCart]);

  // 3. Cálculos derivados (Sin estados locales innecesarios)
  const subtotal = items.reduce((s, i) => s + (i.priceUnit * i.quantity), 0);
  const shipping = subtotal > 8000 || subtotal === 0 ? 0 : 500;
  const total = subtotal + shipping;

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(p);

  // 4. Handlers conectados al Store
  const handleUpdateQty = (id: string, delta: number) => {
    updateQuantity(id, delta);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleClearCart = () => {
    clearCart();
  };

  const validateForm = () => {
    const errs: Partial<ContactData> = {};
    if (!form.fullName.trim()) errs.fullName = "Requerido";
    if (!form.email.includes("@")) errs.email = "Email inválido";
    if (!form.phone.trim()) errs.phone = "Requerido";
    if (!form.address.trim()) errs.address = "Requerido";
    if (!form.city.trim()) errs.city = "Requerido";
    if (!form.province) errs.province = "Seleccioná una provincia";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    if (!user) {
      toast.error("Debes iniciar sesión para realizar la compra");
      return;
    }

    setIsProcessing(true);
    setStep("payment_processing");

    try {

      const { 
      fullName, email, phone, address, 
      city, province, zipCode 
    } = form;

      const orderPayload = {
        userId: user.uid,
        items: items.map((item) => ({
          id: item.id,
          designUrl: item.designUrl,
          colorName: item.colorName,
          colorHex: item.colorHex,
          size: item.size,
          quantity: item.quantity,
          priceUnit: item.priceUnit,
          position: item.position,
          prompt: item.prompt || "",
        })),
        shipping: { fullName, email, phone, address, city, province, zipCode },
        total,
      };

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al procesar la compra");
      }

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      } else {
        throw new Error("No se recibió la URL de pago");
      }
    } catch (error: any) {
      console.error("Error en checkout:", error);
      toast.error(error.message || "Error al procesar el pago");
      setIsProcessing(false);
      setStep("failure");
    }
  };

  const handleRetryPayment = () => {
    setStep("checkout");
    setIsProcessing(false);
  };

  const handleFieldChange = (key: keyof ContactData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // 5. Guardia de Hidratación (Previene el error de Vercel en móviles)
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // --- RENDERS DE PASOS FINALES ---
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

  if (step === "failure") {
    return (
      <FailureStep
        items={items}
        form={form}
        total={total}
        subtotal={subtotal}
        shipping={shipping}
        formatPrice={formatPrice}
        onRetryPayment={handleRetryPayment}
      />
    );
  }

  if (step === "pending") {
    return (
      <PendingStep
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
      <CartHeader
        currentStep={step === "payment_processing" ? "checkout" : step}
      />

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

        {(step === "checkout" || step === "payment_processing") && (
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
          />
        )}
      </main>
    </div>
  );
}