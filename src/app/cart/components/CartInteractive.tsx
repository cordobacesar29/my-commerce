"use client";

import { useState, useEffect } from "react";
import { CartItem } from "@/schema/ICartItemSchema";
import { ShippingData } from "@/schema/IOrderSchema";
import { toast } from "sonner";
import { CartHeader } from "./CartHeader";
import { CartStep } from "./CartStep";
import { CheckoutStep } from "./CheckoutStep";
import { SuccessStep } from "./SuccessStep";
import { FailureStep } from "./FailureStep";
import { PendingStep } from "./PendingStep";
import { useAuth } from "@/context/AuthContext";

export type StepKey =
  | "cart"
  | "checkout"
  | "payment_processing"
  | "success"
  | "failure"
  | "pending";

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
  const [step, setStep] = useState<StepKey>("cart");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingData>>({});

  const { user } = useAuth();

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

  // Load step from URL params (para regresar de MP)
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const status = params.get("status");

    if (status === "success") {
      setStep("success");
      globalThis.history.replaceState({}, document.title, "/cart");
    } else if (status === "failure") {
      setStep("failure");
      globalThis.history.replaceState({}, document.title, "/cart");
    } else if (status === "pending") {
      setStep("pending");
      globalThis.history.replaceState({}, document.title, "/cart");
    }
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
  const shipping = subtotal > 8000 ? 0 : 500;
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
      globalThis.dispatchEvent(new Event("teeforge-cart-update"));
      return updated;
    });
  };

  // Remove item from cart
  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem("teeforge-cart", JSON.stringify(updated));
      globalThis.dispatchEvent(new Event("teeforge-cart-update"));
      return updated;
    });
  };

  // Clear cart
  const handleClearCart = () => {
    setItems([]);
    localStorage.removeItem("teeforge-cart");
    globalThis.dispatchEvent(new Event("teeforge-cart-update"));
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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle checkout submission
  const handleCheckout = async () => {
    if (!validateForm()) return;
    if (!user) {
      toast.error("Debes iniciar sesión para realizar la compra");
      return;
    }

    setIsProcessing(true);
    setStep("payment_processing");

    try {
      // 1. Preparamos el payload (tal como lo espera tu CreateOrderSchema)
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
          prompt: item.prompt || "", // Asegúrate de incluir campos requeridos por el schema
        })),
        shipping: { ...form },
        total,
      };

      // 2. UN SOLO FETCH: Crea la orden en DB y genera el link de Mercado Pago
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
        // Usamos replace para que el usuario no pueda volver atrás al checkout
        // y accidentalmente duplicar la orden al re-enviar el formulario
        globalThis.location.href = result.checkoutUrl;
      } else {
        throw new Error("No se recibió la URL de pago de Mercado Pago");
      }
    } catch (error: any) {
      console.error("Error en checkout:", error);
      toast.error(error.message || "Error al procesar el pago");
      setIsProcessing(false);
      setStep("failure");
    }
  };

  // Retry payment (va de failure -> checkout)
  const handleRetryPayment = () => {
    setStep("checkout");
    setIsProcessing(false);
  };

  // Update form field
  const handleFieldChange = (key: keyof ShippingData, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  // Format card number
  const formatCardNumber = (val: string) => {
    const digits = val.replaceAll(/\D/g, "").slice(0, 16);
    return digits.replaceAll(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  // Format expiry
  const formatExpiry = (val: string) => {
    const digits = val.replaceAll(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  if (status === "success") {
    // 1. Limpiar el carrito en el estado y localStorage
    handleClearCart(); 
    // 2. Mostrar un mensaje de éxito
    toast.success("¡Gracias por tu compra! Tu pedido está siendo procesado.");
    // 3. (Opcional) Limpiar la URL para que no diga ?status=success siempre
    globalThis.history.replaceState({}, "", "/cart");
  }
}, []);

  // Render based on step
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
            formatCardNumber={formatCardNumber}
            formatExpiry={formatExpiry}
          />
        )}
      </main>
    </div>
  );
}
