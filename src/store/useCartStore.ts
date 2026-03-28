import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/schema/ICartItemSchema';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const currentItems = get().items;
        // Si el mismo diseño con el mismo talle ya está, sumamos cantidad
        const existingItem = currentItems.find(
          (item) => item.designUrl === newItem.designUrl && item.size === newItem.size
        );

        if (existingItem) {
          set({
            items: currentItems.map((item) =>
              item === existingItem 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            ),
          });
        } else {
          set({ items: [...currentItems, newItem] });
        }
      },

      removeItem: (id) => set({
        items: get().items.filter((item) => item.id !== id)
      }),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        return get().items.reduce((acc, item) => acc + (item.priceUnit * item.quantity), 0);
      },
    }),
    {
      name: 'teeforge-cart', // Nombre de la llave en LocalStorage
    }
  )
);