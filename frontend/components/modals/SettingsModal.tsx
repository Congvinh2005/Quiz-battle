"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import "../../styles/settings-modal.css";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>⚙️ Quản lý cấu hình</h2>
          <button type="button" className="settings-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-modal-body">
          <div className="settings-section">
            <label className="settings-label">Chế độ hiển thị</label>
            <div className="theme-options">
              <button
                type="button"
                className={`theme-option ${theme === "light" ? "active" : ""}`}
                onClick={() => {
                  setTheme("light");
                  onClose();
                }}
              >
                <span className="theme-icon">☀️</span>
                <span className="theme-name">Sáng</span>
              </button>
              <button
                type="button"
                className={`theme-option ${theme === "dark" ? "active" : ""}`}
                onClick={() => {
                  setTheme("dark");
                  onClose();
                }}
              >
                <span className="theme-icon">🌙</span>
                <span className="theme-name">Tối</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}