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
          // If it exists, just bump the quantity
          set({
            items: items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          // Add new item with quantity 1
          set({ items: [...items, { ...product, quantity: 1 }] });
        }
      },

      // REMOVE ITEM
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.id !== productId) });
      },

      // UPDATE QUANTITY (increment/decrement)
      updateQuantity: (productId, amount) => {
        const { items } = get();
        const updatedItems = items
          .map((i) =>
            i.id === productId ? { ...i, quantity: i.quantity + amount } : i
          )
          .filter((i) => i.quantity > 0); // Remove if quantity hits 0

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
      name: 'shopping-cart', // Unique name for storage
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore;