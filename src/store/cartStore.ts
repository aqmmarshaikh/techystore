import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, variantId?: string) => void;
  updateQuantity: (id: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            const newQuantity = updatedItems[existingItemIndex].quantity + newItem.quantity;
            
            // Ensure we don't exceed stock
            if (newQuantity <= newItem.stock) {
              updatedItems[existingItemIndex].quantity = newQuantity;
            }
            
            return { items: updatedItems };
          }

          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.variantId === variantId)
          ),
        }));
      },

      updateQuantity: (productId, variantId, quantity) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId && item.variantId === variantId) {
              return { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) };
            }
            return item;
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "freshmart-cart",
    }
  )
);
