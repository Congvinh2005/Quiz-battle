import apiClient from "./api";
import { User, AuthTokens, LoginRequest, RegisterRequest } from "@/types";

export interface UpdateProfileRequest {
  username: string;
  full_name?: string | null;
  email: string;
  avatar_url?: string | null;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

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

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>("/users/me", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.put("/users/me/password", data);
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
