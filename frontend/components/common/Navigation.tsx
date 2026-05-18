"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import SettingsModal from "../modals/SettingsModal.tsx";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    router.push("/");
  };

  const handleManageProfile = () => {
    setIsProfileMenuOpen(false);
  };

  const handleManageSettings = () => {
    setIsProfileMenuOpen(false);
    setIsSettingsOpen(true);
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
  const isEditorPage = pathname === "/editor";
  const isEditQuizPage = pathname.startsWith("/editor/");
  const editQuizId = isEditQuizPage ? pathname.split("/")[2] : null;

  const navItems = [
    { href: "/dashboard", label: "🏠 Dashboard", active: pathname === "/dashboard" },
    {
      href: "/editor",
      label: "✏️ Tạo Quiz",
      active: isEditorPage,
    },
    ...(isEditQuizPage && editQuizId
      ? [{ href: `/editor/${editQuizId}`, label: "✏️ Sửa Quiz", active: true }]
      : []),
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
          <Link key={item.href} href={item.href} className={`nav-tab${item.active ? " active" : ""}`}>
            {item.label}
          </Link>
        ))}
        {isAuthenticated && (
          <div className="nav-profile-menu" style={{ marginLeft: "auto", position: "relative" }}>
            <button
              type="button"
              className="nav-tab nav-profile-btn"
              style={{ color: "var(--accent)" }}
              onClick={() => setIsProfileMenuOpen((current) => !current)}
            >
              👤 {user?.username || "Profile"}
            </button>
            {isProfileMenuOpen && (
              <div className="nav-profile-dropdown">
                <button type="button" className="nav-profile-item" onClick={handleManageProfile}>
                  🗂️ Quản lý thông tin
                </button>
                <button type="button" className="nav-profile-item" onClick={handleManageSettings}>
                  ⚙️ Quản lý cấu hình
                </button>
                <button type="button" className="nav-profile-item nav-profile-logout" onClick={handleLogout}>
                  🚪 Đăng xuất
                </button>
              </div>
            )}
          </div>
        )}
        {!isAuthenticated && (
          <Link href="/login" className="nav-tab" style={{ color: "var(--accent)", marginLeft: "auto" }}>
            🚪 Đăng nhập
          </Link>
        )}
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </nav>
  );
}
