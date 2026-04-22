import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { CartItem } from "@/schema/ICartItemSchema";
import { auth, db } from "../lib/firebase"; // Asegúrate de tener estas importaciones
import { doc, setDoc } from "firebase/firestore";

const syncCartToFirestore = async (items: CartItem[]) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return; // Si no hay usuario, solo queda en localStorage

  try {
    const cartRef = doc(db, "users", currentUser.uid, "cart", "current");
    await setDoc(cartRef, {
      items,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sincronizando carrito con Firestore:", error);
  }
};

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  updateQuantity: (id: string, delta: number) => void;
  setItems: (newItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (item) =>
            item.designUrl === newItem.designUrl &&
            item.size === newItem.size &&
            item.colorHex === newItem.colorHex
        );

        let updatedItems;
        if (existingIndex !== -1) {
          updatedItems = [...currentItems];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + newItem.quantity,
          };
        } else {
          updatedItems = [...currentItems, newItem];
        }

        set({ items: updatedItems });
        syncCartToFirestore(updatedItems); // Sincroniza
      },

      removeItem: (id) => {
        const updatedItems = get().items.filter((item) => item.id !== id);
        set({ items: updatedItems });
        syncCartToFirestore(updatedItems); // Sincroniza
      },

      setItems: (newItems: CartItem[]) => set({ items: newItems }),

      clearCart: () => {
        const emptyCart: CartItem[] = [];
        set({ items: emptyCart });
        syncCartToFirestore(emptyCart);
      },

      getTotal: () => {
        return get().items.reduce(
          (acc, item) => acc + item.priceUnit * item.quantity,
          0
        );
      },

      updateQuantity: (id: string, delta: number) => {
        const updatedItems = get()
          .items
          .map((item) =>
            item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
          )
          .filter((item) => item.quantity > 0);

        set({ items: updatedItems });
        syncCartToFirestore(updatedItems);
      },
    }),
    {
      name: "teeforge-cart",
      // Usamos localStorage explícitamente para evitar comportamientos extraños en móviles
      storage: createJSONStorage(() => localStorage),
    }
  )
);
