import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

interface RecentlyViewedState {
  items: Product[];
  addItem: (product: Product) => void;
  clearHistory: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          // Remove if it already exists to move it to the front
          const filteredItems = state.items.filter((item) => item.id !== product.id);

          // Add to front, keep max 10 items
          const newItems = [product, ...filteredItems].slice(0, 10);

          return { items: newItems };
        });
      },

      clearHistory: () => set({ items: [] }),
    }),
    {
      name: "TechyMart-recently-viewed",
    }
  )
);
