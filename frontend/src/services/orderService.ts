import api from "./api";
import { Order } from "../types/models";

export const listOrders = async () => {
  const response = await api.get("/api/orders/");
  return response.data as Order[];
};

export const getOrderDetail = async (orderId: string | number) => {
  const response = await api.get(`/api/orders/${orderId}/`);
  return response.data as Order;
};

export const createOrder = async (items: Array<{ product_id: number; quantity: number }>) => {
  const response = await api.post("/api/orders/", { items });
  return response.data as Order;
};

export const updateOrder = async (orderId: number, data: Partial<Order>) => {
  const response = await api.put(`/api/orders/${orderId}/`, data);
  return response.data as Order;
};

export const cancelOrder = async (orderId: number) => {
  const response = await api.post(`/api/orders/${orderId}/cancel/`, {});
  return response.data as Order;
};
