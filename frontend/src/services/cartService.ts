import api from "./api";
import { Cart } from "../types/models";

export const getCart = async (): Promise<Cart> => {
  const response = await api.get("/api/cart/");
  return response.data;
};

export const addToCart = async (productId: number, quantity = 1) => {
  const response = await api.post("/api/cart/items/", { product_id: productId, quantity });
  return response.data;
};

export const updateCartItem = async (itemId: number, quantity: number) => {
  const response = await api.put(`/api/cart/items/${itemId}/`, { quantity });
  return response.data;
};

export const removeCartItem = async (itemId: number) => {
  await api.delete(`/api/cart/items/${itemId}/`);
};

export const clearCart = async () => {
  await api.delete("/api/cart/");
};
