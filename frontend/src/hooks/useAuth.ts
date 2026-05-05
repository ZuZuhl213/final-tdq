import { useEffect } from "react";
import useAuthStore from "@/stores/authStore";
import authService from "@/services/authService";
import useToastStore from "@/stores/toastStore";

export const useAuth = () => {
  const { user, isAuthenticated, role, setUser, setTokens, logout, initializeFromStorage } =
    useAuthStore();
  const addToast = useToastStore((state) => state.addToast || state.push);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    initializeFromStorage();
    if (useAuthStore.getState().isAuthenticated && !user) {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password });
      setTokens({
        access: response.access,
        refresh: response.refresh,
      });
      const user = await authService.getMe();
      setUser(user);
      addToast("Logged in successfully!", "success");
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        "Login failed";
      addToast(errorMessage, "error");
      throw error;
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await authService.register({
        username,
        email,
        password,
        password_confirm: password,
      });
      setUser(response);
      addToast("Registered successfully!", "success");
      return response;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.non_field_errors?.[0] ||
        "Registration failed";
      addToast(errorMessage, "error");
      throw error;
    }
  };

  const logoutUser = () => {
    logout();
    addToast("Logged out successfully!", "info");
  };

  return {
    user,
    isAuthenticated,
    role,
    login,
    register,
    logout: logoutUser,
    fetchUser,
  };
};
