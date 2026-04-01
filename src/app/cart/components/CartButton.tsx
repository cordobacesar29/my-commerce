"use client";
import Link from "next/link";
import Icon from "@/components/ui/AppIcon";
// Asumo que tienes un hook para el carrito, si no, lo ajustamos
import { useCartStore } from "@/store/useCartStore";

export const CartButton = () => {
  const { items } = useCartStore(); // O la lógica que uses para contar items

  return (
    <Link 
      href="/cart" 
      className="relative p-2 text-gray-400 hover:text-(--accent-gold) transition-colors group"
    >
      <Icon name="ShoppingCartIcon" size={24} />
      
      {items?.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-(--accent-gold) text-black text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
          {items.length}
        </span>
      )}
    </Link>
  );
};