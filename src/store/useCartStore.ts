import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/schema/ICartItemSchema";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  updateQuantity: (id: string, delta: number) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const currentItems = get().items;

        // Buscamos si ya existe un producto con el mismo diseño, talle y color
        const existingIndex = currentItems.findIndex(
          (item) =>
            item.designUrl === newItem.designUrl &&
            item.size === newItem.size &&
            item.colorHex === newItem.colorHex
        );

        if (existingIndex !== -1) {
          // Si existe, actualizamos la cantidad de ese elemento específico
          const updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + newItem.quantity,
          };
          set({ items: updatedItems });
        } else {
          // Si es nuevo, lo agregamos al array
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce(
          (acc, item) => acc + item.priceUnit * item.quantity,
          0
        );
      },

      updateQuantity: (id: string, delta: number) => {
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id
                ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                : item
            )
            .filter((item) => item.quantity > 0),
        }));
      },
    }),
    {
      name: "teeforge-cart",
      // Usamos localStorage explícitamente para evitar comportamientos extraños en móviles
      storage: createJSONStorage(() => localStorage),
    }
  )
);