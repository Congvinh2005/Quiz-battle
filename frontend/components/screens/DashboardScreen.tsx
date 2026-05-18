"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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

const SEARCH_DEBOUNCE_MS = 250;

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
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getQuestionCount(quiz: Quiz) {
  return quiz.question_count ?? quiz.questions?.length ?? 0;
}

function getApiErrorMessage(err: unknown, fallback: string) {
  const status = (err as { response?: { status?: number } })?.response?.status;

  if (status === 401) {
    return "Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.";
  }

  if (status === 403) {
    return "Bạn không có quyền truy cập dữ liệu quiz này.";
  }

  return fallback;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [greeting, setGreeting] = useState("Chào buổi sáng");

  // Fix hydration error: update greeting after client hydration
  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  const loadQuizzes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await quizService.getAllQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Không tải được danh sách quiz. Kiểm tra backend rồi thử lại."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      setIsLoading(false);
      setError("Bạn chưa đăng nhập. Đang chuyển về trang đăng nhập...");
      router.push("/");
      return;
    }

    void loadQuizzes();
  }, [isAuthLoading, user, router, loadQuizzes]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAppliedSearchQuery(searchQuery.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

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

  const filteredMyQuizzes = useMemo(() => {
    if (!appliedSearchQuery) return myQuizzes;

    const normalizedQuery = normalizeSearchText(appliedSearchQuery);
    return myQuizzes.filter((quiz) => normalizeSearchText(quiz.title).includes(normalizedQuery));
  }, [myQuizzes, appliedSearchQuery]);

  const filteredPublicQuizzes = useMemo(() => {
    if (!appliedSearchQuery) return publicQuizzes;

    const normalizedQuery = normalizeSearchText(appliedSearchQuery);
    return publicQuizzes.filter((quiz) => normalizeSearchText(quiz.title).includes(normalizedQuery));
  }, [publicQuizzes, appliedSearchQuery]);

  const pendingQuizCount = myQuizzes.length || 3;
  const displayName = user?.full_name || user?.username || "Minh Khoa";

  const handleJoinRoom = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return;

    router.push(`/room/${code}`);
  };

  const handleSearch = () => {
    setAppliedSearchQuery(searchQuery.trim());
  };

  const handleRefreshQuizzes = () => {
    setSearchQuery("");
    setAppliedSearchQuery("");
    void loadQuizzes();
  };

  return (
    <div className="home-wrap">
      <section className="home-hero">
        <div className="hero-text">
          <p className="hero-greeting">{greeting} 👋</p>
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
            <div className="hero-search">
              <input
                className="hero-search-input"
                placeholder="Tìm quiz theo tên..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <button
                className="btn-hero-secondary hero-refresh-btn"
                onClick={handleRefreshQuizzes}
                disabled={isLoading}
                type="button"
                title="Làm mới danh sách quiz"
              >
                ↻ Làm mới
              </button>
            </div>
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

          <div className={`quiz-grid${filteredMyQuizzes.length > 6 ? " quiz-grid-scroll" : ""}`}>
            {isLoading ? (
              <div className="quiz-card">
                <div className="quiz-card-title">Đang tải danh sách quiz...</div>
                <div className="quiz-card-meta">
                  <span>Vui lòng chờ trong giây lát</span>
                </div>
              </div>
            ) : filteredMyQuizzes.length > 0 ? (
              filteredMyQuizzes.map((quiz) => (
                <article className="quiz-card" key={quiz.id}>
                  <div className="quiz-card-title">{quiz.title}</div>
                  <div className="quiz-card-meta">
                    <div className="quiz-card-meta-info">
                      <span>{quiz.description || "Chưa có mô tả"}</span>
                    </div>
                    <div className="quiz-card-tags">
                      <span className={`tag ${quiz.is_public ? "public" : "private"}`}>
                        {quiz.is_public ? "Public" : "Private"}
                      </span>
                      {quiz.is_public && <span className="tag cyan">Có thể chia sẻ</span>}
                    </div>
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
                <div className="quiz-card-title">
                  {appliedSearchQuery ? "Không có quiz phù hợp trong Quiz của tôi" : "Chưa có quiz nào"}
                </div>
                <div className="quiz-card-meta">
                  <span>
                    {appliedSearchQuery
                      ? "Thử từ khóa khác hoặc bấm Tìm với từ khóa mới."
                      : "Tạo quiz đầu tiên để dashboard hiển thị dữ liệu thật."}
                  </span>
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

          </div>

          <div className="section-header" style={{ marginTop: 28 }}>
            <span className="section-title">📖 Thư viện công khai</span>
            <button className="section-action">Xem tất cả →</button>
          </div>
          <div className={`quiz-grid${filteredPublicQuizzes.length > 6 ? " quiz-grid-scroll" : ""}`}>
            {filteredPublicQuizzes.length > 0 ? (
              filteredPublicQuizzes.map((quiz) => (
                <article className="quiz-card" key={quiz.id}>
                  <div className="quiz-card-title">{quiz.title}</div>
                  <div className="quiz-card-meta">
                    <div className="quiz-card-meta-info">
                      {/* <span>{getQuestionCount(quiz) || "Chưa rõ"} câu hỏi</span> */}
                      <span>{quiz.description || "Chưa có mô tả"}</span>
                    </div>
                    <div className="quiz-card-tags">
                      <span className="tag public">Public</span>
                      <span className="tag cyan">Có thể chia sẻ</span>
                    </div>
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
                <div className="quiz-card-title">
                  {appliedSearchQuery ? "Không có quiz phù hợp trong Thư viện công khai" : "Chưa có quiz public"}
                </div>
                <div className="quiz-card-meta">
                  <span>
                    {appliedSearchQuery
                      ? "Thử từ khóa khác để tìm quiz công khai."
                      : "Chưa có quiz công khai từ người dùng khác."}
                  </span>
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
                placeholder="......."
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
