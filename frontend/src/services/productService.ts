import client from "@/api/client";
import { Product, Category, Brand, ProductFilters, PaginatedResponse } from "@/types/models";

export interface CreateProductPayload {
  name: string;
  slug: string;
  sku: string;
  description: string;
  image_url?: string;
  brand: number;
  list_price: number;
  price: number;
  category_id: number;
  product_type: "book" | "electronics" | "fashion";
  is_active?: boolean;
  stock: number;
}

const productService = {
  listProducts: async (filters?: ProductFilters): Promise<PaginatedResponse<Product> | Product[]> => {
    const params = new URLSearchParams();
    if (filters?.category_id) params.append("category_id", String(filters.category_id));
    // Backend filter key is `brand` (not `brand_id`)
    if (filters?.brand_id) params.append("brand", String(filters.brand_id));
    if (filters?.min_price) params.append("min_price", String(filters.min_price));
    if (filters?.max_price) params.append("max_price", String(filters.max_price));
    if (filters?.search) params.append("search", filters.search);
    if (filters?.ordering) params.append("ordering", filters.ordering);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.page_size) params.append("page_size", String(filters.page_size || 12));

    const response = await client.get(`/api/products/?${params.toString()}`);
    return response.data;
  },

  getProduct: async (slug: string): Promise<Product> => {
    const response = await client.get(`/api/products/${slug}/`);
    return response.data;
  },

  listCategories: async (): Promise<Category[]> => {
    const response = await client.get("/api/categories/");
    return response.data.results || response.data;
  },

  listBrands: async (): Promise<Brand[]> => {
    const response = await client.get("/api/brands/");
    return response.data.results || response.data;
  },

  createProduct: async (payload: CreateProductPayload): Promise<Product> => {
    const response = await client.post("/api/products/", payload);
    return response.data;
  },
};

// Export named functions for convenience
export const listProducts = productService.listProducts;
export const getProduct = productService.getProduct;
export const listCategories = productService.listCategories;
export const listBrands = productService.listBrands;
export const createProduct = productService.createProduct;

export default productService;
