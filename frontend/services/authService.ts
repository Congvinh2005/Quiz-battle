import apiClient from "./api";
import { User, AuthTokens, LoginRequest, RegisterRequest } from "@/types";

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>("/auth/register", data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },
};
