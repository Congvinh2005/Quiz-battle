"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-100 bg-dark-bg border-b border-border">
      <div className="flex items-center justify-between px-5 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="font-syne font-extrabold text-lg text-brand-primary-light">
            Quiz<span className="text-brand-accent">Battle</span>
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          <Link href="/dashboard">
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${
                activeTab === "dashboard"
                  ? "bg-dark-surface2 text-text-main border-border-light"
                  : "bg-transparent text-text-muted border-transparent hover:text-text-main"
              }`}
              onClick={() => setActiveTab("dashboard")}
            >
              Dashboard
            </button>
          </Link>
          <Link href="/create-room">
            <button
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all border ${
                activeTab === "create"
                  ? "bg-dark-surface2 text-text-main border-border-light"
                  : "bg-transparent text-text-muted border-transparent hover:text-text-main"
              }`}
              onClick={() => setActiveTab("create")}
            >
              Create Room
            </button>
          </Link>
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted">{user?.username}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs font-medium text-text-main border border-border-light rounded-lg hover:bg-dark-surface2 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
