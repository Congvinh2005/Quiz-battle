"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { quizService } from "@/services/quizService";
import { Quiz } from "@/types";

const publicLibrary = [
  {
    title: "🇻🇳 Lịch Sử Việt Nam",
    meta: ["20 câu hỏi", "By @hoa_nguyen"],
    tags: ["Lịch sử", "⭐ 4.9"],
    plays: "1,204 lượt",
  },
  {
    title: "💻 Lập Trình Python",
    meta: ["12 câu hỏi", "By @dev_tuan"],
    tags: ["Tech", "⭐ 4.7"],
    plays: "892 lượt",
  },
];

const recentActivities = [
  {
    dot: "gold",
    title: "Thắng 🥇 Địa Lý Thế Giới",
    detail: "9,850 điểm",
    time: "2h trước",
  },
  {
    dot: "green",
    title: "Tạo quiz Khoa Học",
    detail: "15 câu hỏi",
    time: "hôm qua",
  },
  {
    dot: "cyan",
    title: "Tham gia phòng TF82KL",
    detail: "Hạng 3 - 7,200 điểm",
    time: "2 ngày",
  },
];

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 11) return "Chào buổi sáng";
  if (hour < 14) return "Chào buổi trưa";
  if (hour < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function formatDate(value?: string) {
  if (!value) return "Vừa tạo";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa tạo";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getQuestionCount(quiz: Quiz) {
  return quiz.questions?.length ?? 0;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await quizService.getAllQuizzes();
        setQuizzes(data);
      } catch (err) {
        setError("Không tải được danh sách quiz. Kiểm tra backend hoặc đăng nhập rồi thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const stats = useMemo(
    () => [
      { value: Math.max(quizzes.length * 3, quizzes.length), label: "Game đã chơi", color: "purple" },
      { value: quizzes.length ? "7,840" : "0", label: "Điểm TB", color: "cyan" },
      { value: quizzes.filter((quiz) => quiz.is_public).length, label: "Quiz public", color: "gold" },
    ],
    [quizzes]
  );

  const pendingQuizCount = quizzes.length || 3;
  const displayName = user?.username || "Minh Khoa";

  const handleJoinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;

    router.push(`/room/${code}`);
  };

  return (
    <div className="home-wrap">
      <section className="home-hero">
        <div className="hero-text">
          <p className="hero-greeting">{getGreeting()} 👋</p>
          <h1 className="hero-title">
            Xin chào, <span>{displayName}!</span>
          </h1>
          <p className="hero-subtitle">
            Bạn có {pendingQuizCount} quiz đang chờ được chơi. Sẵn sàng chiến chưa?
          </p>
          <div className="hero-cta">
            <button className="btn-hero-primary" onClick={() => router.push("/create-room")}>
              ⚡ Tạo phòng chơi
            </button>
            <button className="btn-hero-secondary" onClick={() => document.getElementById("join-room")?.focus()}>
              🔍 Join phòng
            </button>
            <button className="btn-hero-secondary" onClick={() => router.push("/editor")}>
              + Tạo quiz mới
            </button>
          </div>
        </div>

        <div className="hero-stats">
          {stats.map((stat) => (
            <div className="hero-stat-card" key={stat.label}>
              <div className={`hero-stat-val ${stat.color}`}>{stat.value}</div>
              <div className="hero-stat-lbl">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="home-body">
        <main>
          <div className="section-header">
            <span className="section-title">📚 Quiz của tôi</span>
            <button className="section-action" onClick={() => router.push("/editor")}>
              + Tạo quiz mới
            </button>
          </div>

          {error && <div className="section-error">{error}</div>}

          <div className="quiz-grid">
            {isLoading ? (
              <div className="quiz-card">
                <div className="quiz-card-title">Đang tải danh sách quiz...</div>
                <div className="quiz-card-meta">
                  <span>Vui lòng chờ trong giây lát</span>
                </div>
              </div>
            ) : quizzes.length > 0 ? (
              quizzes.map((quiz) => (
                <article className="quiz-card" key={quiz.id}>
                  <div className="quiz-card-title">{quiz.title}</div>
                  <div className="quiz-card-meta">
                    <span>{getQuestionCount(quiz) || "Chưa rõ"} câu hỏi</span>
                    <span>{quiz.description || "Chưa có mô tả"}</span>
                  </div>
                  <div className="quiz-card-tags">
                    <span className="tag">{quiz.is_public ? "Public" : "Private"}</span>
                    {quiz.is_public && <span className="tag cyan">Có thể chia sẻ</span>}
                  </div>
                  <div className="quiz-card-footer">
                    <span className="quiz-card-note">{formatDate(quiz.created_at)}</span>
                    <button className="play-btn" onClick={() => router.push("/create-room")}>
                      ▶ Chơi ngay
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <article className="quiz-card">
                <div className="quiz-card-title">Chưa có quiz nào</div>
                <div className="quiz-card-meta">
                  <span>Tạo quiz đầu tiên để dashboard hiển thị dữ liệu thật.</span>
                </div>
                <div className="quiz-card-tags">
                  <span className="tag gold">Bắt đầu</span>
                </div>
                <div className="quiz-card-footer">
                  <span className="quiz-card-note">Dữ liệu API đang rỗng</span>
                  <button className="play-btn" onClick={() => router.push("/editor")}>
                    + Tạo quiz
                  </button>
                </div>
              </article>
            )}

            <button className="quiz-card quiz-create-card" onClick={() => router.push("/editor")}>
              <div className="quiz-create-icon">+</div>
              <div className="quiz-create-text">Tạo quiz mới</div>
            </button>
          </div>

          <div className="section-header" style={{ marginTop: 28 }}>
            <span className="section-title">📖 Thư viện công khai</span>
            <button className="section-action">Xem tất cả →</button>
          </div>
          <div className="quiz-grid">
            {publicLibrary.map((quiz) => (
              <article className="quiz-card" key={quiz.title}>
                <div className="quiz-card-title">{quiz.title}</div>
                <div className="quiz-card-meta">
                  {quiz.meta.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
                <div className="quiz-card-tags">
                  <span className="tag">{quiz.tags[0]}</span>
                  <span className="tag gold">{quiz.tags[1]}</span>
                </div>
                <div className="quiz-card-footer">
                  <span className="quiz-card-note">{quiz.plays}</span>
                  <button className="play-btn" onClick={() => router.push("/create-room")}>
                    ▶ Dùng ngay
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>

        <aside className="sidebar">
          <div className="sidebar-card">
            <div className="sidebar-card-title">🎯 Join phòng nhanh</div>
            <div className="sidebar-card-subtitle">Nhập mã phòng 6 ký tự:</div>
            <form className="join-input-row" onSubmit={handleJoinRoom}>
              <input
                id="join-room"
                className="join-input"
                placeholder="AB12CD"
                maxLength={6}
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              />
              <button className="btn-join" type="submit">
                Join
              </button>
            </form>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-card-title">🕐 Hoạt động gần đây</div>
            <div className="activity-list">
              {recentActivities.map((activity) => (
                <div className="activity-item" key={activity.title}>
                  <div className={`activity-dot ${activity.dot}`} />
                  <div className="activity-text">
                    {activity.title}
                    <div className="activity-detail">{activity.detail}</div>
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-card streak-card">
            <div className="streak-icon">🔥</div>
            <div className="streak-title">Streak 5 ngày!</div>
            <div className="streak-subtitle">Chơi thêm hôm nay để duy trì streak</div>
            <div className="streak-track">
              {Array.from({ length: 7 }).map((_, index) => (
                <div className={`streak-bar${index < 5 ? " active" : ""}`} key={index} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
