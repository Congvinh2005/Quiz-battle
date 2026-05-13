"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navigation from "@/components/common/Navigation";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GameProvider>
          <div className="flex flex-col min-h-screen" style={{ background: "var(--bg)" }}>
            <Navigation />
            <main className="flex-1">{children}</main>
          </div>
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
