import type { Metadata } from "next";
import CartInteractive from "./components/CartInteractive";

export const metadata: Metadata = {
  title: "Ramón Store - Carrito",
  description:
    "Revisá tu selección de remeras personalizadas y completá tu pedido con pago seguro a través de Mercado Pago.",
};

export default function CartPage() {
  return <CartInteractive />;
}