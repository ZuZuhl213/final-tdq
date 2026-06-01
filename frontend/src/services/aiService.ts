import client from "@/api/client";
import { ChatRequest, ChatResponse, Product } from "@/types/models";

const extractProducts = (data: { products?: Product[]; items?: Product[] } | Product[]): Product[] => {
  if (Array.isArray(data)) return data;
  return data.products || data.items || [];
};

const aiService = {
  recommend: async (userId?: number, limit: number = 5): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (userId) params.append("user_id", String(userId));
    params.append("limit", String(limit));

    try {
      const response = await client.get(`/api/ai/recommend/?${params.toString()}`);
      return extractProducts(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
  },

  chat: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await client.post("/api/ai/chat/", data);
    return {
      ...response.data,
      products: response.data.products || response.data.suggested_products || [],
    };
  },

  health: async (): Promise<{ status: string }> => {
    const response = await client.get("/api/ai/health/");
    return response.data;
  },

  getRecommendations: async (userId: number, limit = 5): Promise<Product[]> => {
    const params = new URLSearchParams();
    params.append("user_id", String(userId));
    params.append("limit", String(limit));
    try {
      const response = await client.get(`/api/ai/recommend/?${params.toString()}`);
      return extractProducts(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      return [];
    }
  },
};

export const getRecommendations = aiService.getRecommendations;
export const recommend = aiService.recommend;
export const chat = aiService.chat;
export const health = aiService.health;

export default aiService;
