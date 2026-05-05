import { create } from "zustand";
import { Cart, CartItem } from "@/types/models";

interface CartState {
  cart: Cart | null;
  items: CartItem[];
  totalQuantity: number;
  totalAmount: number;
  isLoading: boolean;

  // Actions
  setCart: (cart: Cart) => void;
  addItem: (item: CartItem) => void;
  updateItem: (itemId: number, quantity: number) => void;
  removeItem: (itemId: number) => void;
  clearCart: () => void;
  clear: () => void;
  calculateTotals: () => void;
  setLoading: (loading: boolean) => void;
}

const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  items: [],
  totalQuantity: 0,
  totalAmount: 0,
  isLoading: false,

  setCart: (cart) => {
    set({ cart, items: cart.items || [] });
    get().calculateTotals();
  },

  addItem: (item) => {
    const { items } = get();
    const existingItem = items.find((i) => i.product_id === item.product_id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.id === existingItem.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }

    get().calculateTotals();
  },

  updateItem: (itemId, quantity) => {
    const { items } = get();
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }

    set({
      items: items.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
    });

    get().calculateTotals();
  },

  removeItem: (itemId) => {
    const { items } = get();
    set({ items: items.filter((i) => i.id !== itemId) });
    get().calculateTotals();
  },

  clearCart: () => {
    set({ cart: null, items: [], totalQuantity: 0, totalAmount: 0 });
  },

  clear: () => {
    set({ cart: null, items: [], totalQuantity: 0, totalAmount: 0 });
  },

  calculateTotals: () => {
    const { items } = get();
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    set({ totalQuantity, totalAmount });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useCartStore;
