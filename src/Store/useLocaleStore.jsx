// Store/useLocaleStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLocaleStore = create(
  persist(
    (set, get) => ({
      locale: 'en',

      toggleLocale: () =>
        set({ locale: get().locale === 'en' ? 'fr' : 'en' }),

      formatPrice: (price) => {
        const { locale } = get();
        if (locale === 'fr') return `€${(price * 0.92).toFixed(2)}`;
        return `$${Number(price).toFixed(2)}`;
      },
    }),
    {
      name: 'locale-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useLocaleStore;