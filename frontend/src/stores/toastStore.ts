import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastState {
  items: ToastItem[];
  push: (message: string, variant?: ToastVariant) => void;
  addToast: (message: string, variant?: ToastVariant) => void;
  remove: (id: string) => void;
}

const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message, variant = "info") =>
    set((state) => ({
      items: [...state.items, { id: crypto.randomUUID(), message, variant }]
    })),
  addToast: (message, variant = "info") =>
    set((state) => ({
      items: [...state.items, { id: crypto.randomUUID(), message, variant }]
    })),
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
}));

export default useToastStore;
