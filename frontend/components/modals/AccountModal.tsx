"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import "../../styles/settings-modal.css";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function getErrorMessage(error: unknown, fallback: string) {
  const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
  return detail || fallback;
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;
    setUsername(user.username);
    setFullName(user.full_name || "");
    setEmail(user.email);
    setAvatarUrl(user.avatar_url || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage(null);
    setError(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSavingProfile(true);
      setError(null);
      setMessage(null);
      const updatedUser = await authService.updateProfile({
        username,
        full_name: fullName.trim() || null,
        email,
        avatar_url: avatarUrl.trim() || null,
      });
      updateUser(updatedUser);
      setMessage("Đã cập nhật thông tin tài khoản.");
    } catch (err) {
      setError(getErrorMessage(err, "Không cập nhật được thông tin tài khoản."));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      setMessage(null);
      return;
    }

    try {
      setIsSavingPassword(true);
      setError(null);
      setMessage(null);
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Đã đổi mật khẩu thành công.");
    } catch (err) {
      setError(getErrorMessage(err, "Không đổi được mật khẩu."));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal-content account-modal-content" onClick={(event) => event.stopPropagation()}>
        <div className="settings-modal-header">
          <h2>🗂️ Quản lý thông tin</h2>
          <button type="button" className="settings-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="settings-modal-body account-modal-body">
          {message && <div className="account-alert success">{message}</div>}
          {error && <div className="account-alert error">{error}</div>}

          <form className="account-section" onSubmit={handleUpdateProfile}>
            <div>
              <div className="settings-label">Thông tin tài khoản</div>
              <p className="account-help">Xem và cập nhật tên hiển thị, email đăng nhập.</p>
            </div>
            <label className="account-field">
              <span>Họ và tên</span>
              <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nhập họ và tên ..." />
            </label>
            <label className="account-field">
              <span>Tên tài khoản</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} required />
            </label>
            <label className="account-field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="account-field">
              <span>Avatar URL</span>
              <input
                type="url"
                value={avatarUrl}
                onChange={(event) => setAvatarUrl(event.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
            </label>
            <div className="account-avatar-preview">
              <div className="account-avatar-frame">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar preview" />
                ) : (
                  <span>{username.trim().slice(0, 1).toUpperCase() || "?"}</span>
                )}
              </div>
              <span>Ảnh đại diện sẽ hiện ở menu và lobby.</span>
            </div>
            <button type="submit" className="account-primary-btn" disabled={isSavingProfile}>
              {isSavingProfile ? "Đang lưu..." : "Lưu thông tin"}
            </button>
          </form>

          <form className="account-section" onSubmit={handleChangePassword}>
            <div>
              <div className="settings-label">Đổi mật khẩu</div>
              <p className="account-help">Nhập mật khẩu hiện tại trước khi đặt mật khẩu mới.</p>
            </div>
            <label className="account-field">
              <span>Mật khẩu hiện tại</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                required
              />
            </label>
            <label className="account-field">
              <span>Mật khẩu mới</span>
              <input
                type="password"
                value={newPassword}
                minLength={6}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </label>
            <label className="account-field">
              <span>Xác nhận mật khẩu mới</span>
              <input
                type="password"
                value={confirmPassword}
                minLength={6}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </label>
            <button type="submit" className="account-primary-btn" disabled={isSavingPassword}>
              {isSavingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
