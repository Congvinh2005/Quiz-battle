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

  const isLandingPage = pathname === "/" || pathname === "/login" || pathname === "/register";

  if (isLandingPage) {
    return null;
  }

  const roomMatch = pathname.match(/^\/(room|game|results)\/([^/]+)/);
  const activeRoomCode = roomMatch?.[2] || null;
  const isRoomPage = pathname.startsWith("/room/");
  const isGamePage = pathname.startsWith("/game/");
  const isResultsPage = pathname.startsWith("/results/");

  const navItems = [
    { href: "/dashboard", label: "🏠 Dashboard", active: pathname === "/dashboard" },
    { href: "/editor", label: "✏️ Tạo Quiz", active: pathname === "/editor" },
    { href: "/create-room", label: "🎮 Tạo phòng", active: pathname === "/create-room" },
    ...(activeRoomCode && isRoomPage
      ? [{ href: `/room/${activeRoomCode}`, label: "👥 Lobby", active: true }]
      : []),
    ...(activeRoomCode && isGamePage
      ? [{ href: `/game/${activeRoomCode}`, label: "⚡ Gameplay", active: true }]
      : []),
    ...(activeRoomCode && isResultsPage
      ? [{ href: `/results/${activeRoomCode}`, label: "🏆 Kết quả", active: true }]
      : []),
  ];

  return (
    <nav className="app-nav">
      <Link href="/dashboard" className="nav-logo">
        Quiz<span>Battle</span>
      </Link>

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
          <Link href="/login">
            <button className="nav-tab" style={{ color: "var(--accent)", marginLeft: "auto" }}>
              🚪 Đăng xuất
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
