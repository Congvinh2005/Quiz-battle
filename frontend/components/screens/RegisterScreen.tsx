"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [strengthText, setStrengthText] = useState("");
  const [strengthColor, setStrengthColor] = useState("var(--border2)");
  const [strengthWidth, setStrengthWidth] = useState("0%");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const evaluatePassword = (value: string) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const pct = `${(score / 4) * 100}%`;
    setStrengthWidth(pct);

    if (score === 0) {
      setStrengthText("");
      setStrengthColor("var(--border2)");
      return;
    }

    if (score === 1) {
      setStrengthText("Yếu");
      setStrengthColor("var(--red)");
      return;
    }

    if (score <= 3) {
      setStrengthText("Trung bình");
      setStrengthColor("var(--gold)");
      return;
    }

    setStrengthText("Mạnh");
    setStrengthColor("var(--green)");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password, fullName);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-wrap">
      <Link className="register-back-btn" href="/">
        <span aria-hidden="true">←</span>
        Quay lại trang giới thiệu
      </Link>
      <div className="register-bg" />
      <div className="register-card">
        <div className="step-dots">
          <div className="step-dot active" />
          <div className="step-dot" />
          <div className="step-dot" />
        </div>

        <div className="register-header">
          <h2 className="register-title">Tạo tài khoản</h2>
          <p className="register-sub">Tham gia hàng nghìn người chơi đang đấu quiz mỗi ngày</p>
        </div>

        {error && (
          <div style={{
            marginBottom: "16px",
            padding: "10px 12px",
            background: "rgba(239,68,68,.15)",
            border: "1px solid rgba(239,68,68,.4)",
            borderRadius: "10px",
            color: "#EF4444",
            fontSize: "13px",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên ..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tên tài khoản </label>
            <input className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nhập tên tài khoản ..." required />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="password-wrapper">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  evaluatePassword(value);
                }}
                placeholder="Ít nhất 8 ký tự, có chữ hoa, số và ký tự đặc biệt"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
            <div className="strength-bar">
              <div className="strength-fill" style={{ width: strengthWidth, background: strengthColor }} />
            </div>
            <div style={{ fontSize: "11px", color: strengthColor, marginTop: "4px" }}>
              {strengthText ? `Độ mạnh: ${strengthText}` : ""}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu</label>
            <div className="password-wrapper">
              <input
                className="form-input"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu để xác nhận"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showConfirmPassword ? "👁" : "👁‍🗨"}
              </button>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản →"}
          </button>
        </form>

        <p className="register-footer">
          Đã có tài khoản? <Link href="/login" className="link">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
