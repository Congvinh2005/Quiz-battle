"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { User, AuthTokens } from "@/types";
import { authService } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (code: string) => Promise<void>;
  register: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const tokens: AuthTokens = await authService.login({ username, password });

      // Store tokens
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);

      // Get user data
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (code: string) => {
    try {
      setIsLoading(true);
      const tokens: AuthTokens = await authService.loginWithGoogle(code);

      // Store tokens
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);

      // Get user data
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } finally {
      setIsLoading(false);
    }
  }, []);


  // # nhả token để về trang dashboard, tránh việc tự động đăng nhập sau khi đăng ký
  
  // const register = async (username: string, email: string, password: string, fullName?: string) => {
  //   try {
  //     setIsLoading(true);
  //     const tokens: AuthTokens = await authService.register({
  //       username,
  //       full_name: fullName?.trim() || null,
  //       email,
  //       password,
  //     });

  //     // Store tokens
  //     localStorage.setItem("access_token", tokens.access_token);
  //     localStorage.setItem("refresh_token", tokens.refresh_token);

  //     // Get user data
  //     const currentUser = await authService.getCurrentUser();
  //     setUser(currentUser);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


// # đăng ký xong thì về trang login, tránh việc tự vào dashboard sau khi đăng ký
  const register = useCallback(async (username: string, email: string, password: string, fullName?: string) => {
    try {
      setIsLoading(true);
      await authService.register({
        username,
        full_name: fullName?.trim() || null,
        email,
        password,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
  }), [user, isLoading, login, loginWithGoogle, register, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
