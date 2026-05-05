import client from "@/api/client";
import { User, LoginRequest, RegisterRequest, TokenRefreshResponse, Address } from "@/types/models";

type LoginApiResponse = {
  access: string;
  refresh: string;
};

const authService = {
  login: async (credentials: LoginRequest): Promise<LoginApiResponse> => {
    const response = await client.post("/api/auth/login/", credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await client.post("/api/auth/register/", data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<TokenRefreshResponse> => {
    const response = await client.post("/api/auth/refresh/", {
      refresh: refreshToken,
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await client.get("/api/users/me/");
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await client.put("/api/users/me/", data);
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await client.post("/api/users/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    });
  },

  getAddresses: async (): Promise<Address[]> => {
    const response = await client.get("/api/users/addresses/");
    return response.data;
  },
};

export const login = authService.login;
export const register = authService.register;
export const refreshToken = authService.refreshToken;
export const getMe = authService.getMe;
export const updateProfile = authService.updateProfile;
export const changePassword = authService.changePassword;
export const getAddresses = authService.getAddresses;

export default authService;
