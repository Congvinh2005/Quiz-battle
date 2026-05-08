"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isAuthPage = pathname === "/" || pathname === "/register";

  const navItems = [
    { href: "/dashboard", label: "🏠 Dashboard", active: pathname === "/dashboard" },
    { href: "/editor", label: "✏️ Tạo Quiz", active: pathname === "/editor" },
    { href: "/create-room", label: "🎮 Tạo phòng", active: pathname === "/create-room" },
    { href: "/room/demo", label: "👥 Lobby", active: pathname.startsWith("/room/") },
    { href: "/game/demo", label: "⚡ Gameplay", active: pathname.startsWith("/game/") },
    { href: "/results/demo", label: "🏆 Kết quả", active: pathname.startsWith("/results/") },
  ];

  return (
    <nav className="app-nav">
      <Link href="/dashboard" className="nav-logo">
        Quiz<span>Battle</span>
      </Link>

      {!isAuthPage && (
        <div className="nav-tabs">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <button className={`nav-tab${item.active ? " active" : ""}`}>{item.label}</button>
            </Link>
          ))}
          {isAuthenticated && (
            <button
              className="nav-tab"
              style={{ color: "var(--accent)", marginLeft: "auto" }}
              onClick={handleLogout}
            >
              🚪 Đăng xuất
            </button>
          )}
          {!isAuthenticated && (
            <Link href="/">
              <button className="nav-tab" style={{ color: "var(--accent)", marginLeft: "auto" }}>
                🚪 Đăng xuất
              </button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
