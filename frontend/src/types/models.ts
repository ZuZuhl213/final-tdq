// User & Auth
export type UserRole = "admin" | "staff" | "customer";

export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

// Product & Category
export type ProductType = "book" | "electronics" | "fashion";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  parent?: Category;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  list_price?: number;
  price: number;
  cost?: number;
  brand_id?: number;
  brand?: Brand;
  category_id: number;
  category?: Category;
  product_type: ProductType;
  stock: number;
  is_active: boolean;
  rating?: number;
  total_reviews?: number;
  image_url?: string;
  images?: string[];
  created_at: string;
  updated_at: string;
}

export interface Book extends Product {
  author?: string;
  isbn?: string;
  publisher?: string;
  pages?: number;
  language?: string;
}

export interface Electronics extends Product {
  brand_name?: string;
  warranty_months?: number;
  color?: string;
}

export interface Fashion extends Product {
  size?: string;
  color?: string;
  material?: string;
}

// Cart
export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: number;
  subtotal?: number;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
  total_quantity?: number;
  total_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface AddCartItemRequest {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Address
export interface Address {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  address_line: string;
  district: string;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Order & Payment
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "success" | "failed";
export type PaymentMethod = "cod" | "transfer";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal?: number;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_number?: string;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  shipping_address?: Address;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  shipping_address?: Address;
  notes?: string;
  payment_method: PaymentMethod;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  status: PaymentStatus;
  transaction_code: string;
  created_at: string;
  updated_at: string;
}

// AI & Chatbot
export interface RecommendationResponse {
  products: Product[];
  reason?: string;
}

export interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  user_id?: number;
  query: string;
}

export interface ChatSource {
  id: number;
  title: string;
  content: string;
  tags: string[];
}

export interface ChatResponse {
  answer: string;
  products: Product[];
  sources?: ChatSource[];
  query?: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Filter & Query
export interface ProductFilters {
  category_id?: number;
  brand_id?: number;
  min_price?: number;
  max_price?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}
