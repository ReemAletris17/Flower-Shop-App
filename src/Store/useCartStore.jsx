import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ADD ITEM
      addItem: (product) => {
        const { items } = get();
        
        const existingItem = items.find((i) => i.id === product.id);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      // REMOVE ITEM
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) });
      },

      // UPDATE QUANTITY 
      updateQuantity: (productId, amount) => {
        const { items } = get();
        const updatedItems = items
          .map((i) =>
            i.id === productId ? { ...i, quantity: i.quantity + amount } : i
          )
          .filter((i) => i.quantity > 0);

        set({ items: updatedItems });
      },

      // CLEAR CART
      clearCart: () => set({ items: [] }),

      // HELPER: Get Total Price
      getTotalPrice: () => {
        return get().items.reduce((total, i) => total + i.price * i.quantity, 0);
      },
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore;