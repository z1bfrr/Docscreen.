import { create } from 'zustand';
import { DiagnosticTest, HealthPackage } from '../types';

export interface CartItem {
  id: string; // Unique ID for cart entry
  type: 'TEST' | 'PACKAGE';
  item: DiagnosticTest | HealthPackage;
  price: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (type: 'TEST' | 'PACKAGE', item: DiagnosticTest | HealthPackage, price: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  addToCart: (type, item, price) => set((state) => {
    const existing = state.items.find(i => i.item.id === item.id && i.type === type);
    if (existing) return state; // Prevent duplicates

    return {
      items: [...state.items, {
        id: `${type}-${item.id}-${Date.now()}`,
        type,
        item,
        price
      }]
    };
  }),

  removeFromCart: (cartItemId) => set((state) => ({
    items: state.items.filter(i => i.id !== cartItemId)
  })),

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => get().items.reduce((total, item) => total + item.price, 0),
}));
