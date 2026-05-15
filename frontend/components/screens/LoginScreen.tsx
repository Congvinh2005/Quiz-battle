"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <Link className="login-back-btn" href="/">
        <span aria-hidden="true">←</span>
        Quay lại trang giới thiệu
      </Link>
      <div className="login-left">
        <div className="brand-badge"><span className="dot" /> Quiz đấu thời gian thực</div>
        <h1 className="login-title">Chào mừng trở lại <span>QuizBattle</span></h1>
        <p className="login-sub">Nền tảng đấu quiz thời gian thực. Tạo phòng, mời bạn bè và thi đấu ngay!</p>

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
            <label className="form-label">Tên tài khoản</label>
            <input
              className="form-input"
              type="text"
              placeholder="Nhập tên tài khoản..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <div className="password-wrapper">
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <button className="btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập →"}
          </button>
        </form>

        <div className="login-divider">hoặc</div>
        <button className="btn-outline" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Tiếp tục với Google
        </button>
        <p className="login-footer">Chưa có tài khoản? <Link className="link" href="/register">Đăng ký miễn phí</Link></p>
      </div>

      <div className="login-right">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="floating-demo">
          <div className="demo-card">
            <div className="demo-card-title">Thống kê hôm nay</div>
            <div className="demo-stat-row">
              <div className="demo-stat">
                <div className="demo-stat-val">1,247</div>
                <div className="demo-stat-lbl">Phòng đang chơi</div>
              </div>
              <div className="demo-stat">
                <div className="demo-stat-val" style={{ color: "var(--accent)" }}>8,931</div>
                <div className="demo-stat-lbl">Người online</div>
              </div>
            </div>
          </div>
          <div className="demo-card">
            <div className="demo-card-title">Leaderboard</div>
            <div className="demo-players">
              <div className="demo-player"><div className="demo-avatar" style={{ background: "rgba(245,158,11,.2)", color: "var(--gold)" }}>🥇</div><span className="demo-player-name">Minh Khoa</span><span className="demo-player-score">9,850</span></div>
              <div className="demo-player"><div className="demo-avatar" style={{ background: "rgba(148,163,184,.15)", color: "#94A3B8" }}>🥈</div><span className="demo-player-name">Lan Anh</span><span className="demo-player-score">8,600</span></div>
              <div className="demo-player"><div className="demo-avatar" style={{ background: "rgba(205,127,50,.15)", color: "#CD7F32" }}>🥉</div><span className="demo-player-name">Tuấn Hùng</span><span className="demo-player-score">7,200</span></div>
            </div>
          </div>
          <div className="demo-card">
            <div className="demo-card-title">Quiz đang hot</div>
            <div style={{ fontSize: "13px", marginBottom: "6px", fontWeight: 600 }}>Địa Lý Thế Giới</div>
            <div style={{ fontSize: "11px", color: "var(--muted)" }}>234 người đã chơi hôm nay • 10 câu hỏi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
