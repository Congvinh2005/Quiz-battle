"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { quizService } from "@/services/quizService";
import { Quiz } from "@/types";

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

  const myQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.created_by === user?.id),
    [quizzes, user?.id]
  );

  const stats = useMemo(
    () => [
      { value: Math.max(myQuizzes.length * 3, myQuizzes.length), label: "Game đã chơi", color: "purple" },
      { value: myQuizzes.length ? "7,840" : "0", label: "Điểm TB", color: "cyan" },
      { value: myQuizzes.filter((quiz) => quiz.is_public).length, label: "Quiz public", color: "gold" },
    ],
    [myQuizzes]
  );

  const publicQuizzes = useMemo(
    () => quizzes.filter((quiz) => quiz.is_public && quiz.created_by !== user?.id),
    [quizzes, user?.id]
  );

  const pendingQuizCount = myQuizzes.length || 3;
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
            ) : myQuizzes.length > 0 ? (
              myQuizzes.map((quiz) => (
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
                    <div className="quiz-card-actions">
                      <button className="play-btn" onClick={() => router.push(`/create-room?quizId=${quiz.id}`)}>
                        ▶ Chơi ngay
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => router.push(`/editor/${quiz.id}`)}
                        title="Sửa quiz"
                      >
                        ✎ Sửa
                      </button>
                      <button
                        className="delete-btn"
                        onClick={async () => {
                          if (confirm("Bạn chắc chắn muốn xóa quiz này?")) {
                            try {
                              await quizService.deleteQuiz(quiz.id);
                              setQuizzes((prev) => prev.filter((q) => q.id !== quiz.id));
                            } catch (err) {
                              alert("Không xóa được quiz. Vui lòng thử lại.");
                            }
                          }
                        }}
                        title="Xóa quiz"
                      >
                        🗑 Xóa
                      </button>
                    </div>
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
            {publicQuizzes.length > 0 ? (
              publicQuizzes.map((quiz) => (
                <article className="quiz-card" key={quiz.id}>
                  <div className="quiz-card-title">{quiz.title}</div>
                  <div className="quiz-card-meta">
                    <span>{getQuestionCount(quiz) || "Chưa rõ"} câu hỏi</span>
                    <span>{quiz.description || "Chưa có mô tả"}</span>
                  </div>
                  <div className="quiz-card-tags">
                    <span className="tag">Public</span>
                    <span className="tag cyan">Có thể chia sẻ</span>
                  </div>
                  <div className="quiz-card-footer">
                    <span className="quiz-card-note">{formatDate(quiz.created_at)}</span>
                    <button className="play-btn" onClick={() => router.push(`/create-room?quizId=${quiz.id}`)}>
                      ▶ Dùng ngay
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <article className="quiz-card">
                <div className="quiz-card-title">Chưa có quiz public</div>
                <div className="quiz-card-meta">
                  <span>Chưa có quiz công khai từ người dùng khác.</span>
                </div>
                <div className="quiz-card-tags">
                  <span className="tag">Trống</span>
                </div>
                <div className="quiz-card-footer">
                  <span className="quiz-card-note">Quay lại sau</span>
                </div>
              </article>
            )}
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
