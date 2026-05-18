"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { quizService } from "@/services/quizService";
import { gameService } from "@/services/gameService";
import { Quiz, GameRoom } from "@/types";

interface SelectableQuiz {
  id: string;
  title: string;
  icon: string;
  questionCount: number;
  totalDurationSeconds: number;
  isDemo?: boolean;
}

const demoQuizzes: SelectableQuiz[] = [
  {
    id: "demo-geography",
    title: "Địa Lý Thế Giới",
    icon: "🌍",
    questionCount: 10,
    totalDurationSeconds: 330,
    isDemo: true,
  },
  {
    id: "demo-science",
    title: "Khoa Học Tự Nhiên",
    icon: "🔬",
    questionCount: 15,
    totalDurationSeconds: 345,
    isDemo: true,
  },
  {
    id: "demo-music",
    title: "Âm Nhạc Việt Nam",
    icon: "🎵",
    questionCount: 8,
    totalDurationSeconds: 264,
    isDemo: true,
  },
];

const iconBackgrounds = ["rgba(124,58,237,.15)", "rgba(6,182,212,.1)", "rgba(245,158,11,.1)"];

function toSelectableQuiz(quiz: Quiz, index: number): SelectableQuiz {
  const icons = ["🌍", "🔬", "🎵", "💻", "📚", "⚡"];
  const questionCount = quiz.question_count ?? quiz.questions?.length ?? 0;
  const totalDurationSeconds =
    quiz.total_duration_seconds ??
    ((quiz.questions?.reduce((sum, q) => sum + (q.time_limit || 0), 0) ?? 0) + questionCount * 3);

  return {
    id: quiz.id,
    title: quiz.title,
    icon: icons[index % icons.length],
    questionCount,
    totalDurationSeconds,
  };
}

function estimateDuration(totalSeconds: number) {
  if (!totalSeconds) return "~ chưa rõ";
  const minutes = totalSeconds / 60;

  if (minutes < 1) {
    return `~${totalSeconds}s`;
  }
  return `~${Math.round(minutes)} phút`;
}

function makePreviewCode(room?: GameRoom | null) {
  return room?.room_code || "GX7R2K";
}

export default function CreateRoomScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [createdRoom, setCreatedRoom] = useState<GameRoom | null>(null);
  const [animatedCode, setAnimatedCode] = useState<string>("GX7R2K");
  const [maxPlayers, setMaxPlayers] = useState(30);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [roomChat, setRoomChat] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setError(null);
        const data = await quizService.getAllQuizzes();
        setQuizzes(data);

        // Kiểm tra quizId từ URL params
        const quizIdFromUrl = searchParams.get('quizId');
        if (quizIdFromUrl && data.some(quiz => quiz.id === quizIdFromUrl)) {
          setSelectedQuizId(quizIdFromUrl);
        } else if (data.length > 0) {
          setSelectedQuizId(data[0].id);
        } else {
          setSelectedQuizId(demoQuizzes[0].id);
        }
      } catch (err) {
        setError("Không tải được danh sách quiz. Đang hiển thị dữ liệu mẫu để bạn xem giao diện.");
        setSelectedQuizId(demoQuizzes[0].id);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, [searchParams]);

  // Animate room code when not yet created
  useEffect(() => {
    if (createdRoom) return;

    const interval = setInterval(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      setAnimatedCode(code);
    }, 80);

    return () => clearInterval(interval);
  }, [createdRoom]);

  const selectableQuizzes = useMemo(() => {
    if (quizzes.length > 0) return quizzes.map(toSelectableQuiz);
    return demoQuizzes;
  }, [quizzes]);

  // Pagination for quiz list
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 6;

  useEffect(() => {
    // reset to first page when quizzes list changes
    setCurrentPage(1);
  }, [selectableQuizzes.length]);

  // ensure selected quiz is visible on page change/load
  useEffect(() => {
    if (!selectedQuizId) return;
    const idx = selectableQuizzes.findIndex((q) => q.id === selectedQuizId);
    if (idx === -1) return;
    const pageForIdx = Math.floor(idx / PAGE_SIZE) + 1;
    if (pageForIdx !== currentPage) setCurrentPage(pageForIdx);
  }, [selectedQuizId, selectableQuizzes]);

  const totalPages = Math.max(1, Math.ceil(selectableQuizzes.length / PAGE_SIZE));
  const pageQuizzes = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return selectableQuizzes.slice(start, start + PAGE_SIZE);
  }, [selectableQuizzes, currentPage]);

  const selectedQuiz = useMemo(
    () => selectableQuizzes.find((quiz) => quiz.id === selectedQuizId) || selectableQuizzes[0],
    [selectableQuizzes, selectedQuizId]
  );

  const selectedRealQuiz = useMemo(() => quizzes.find((quiz) => quiz.id === selectedQuiz?.id), [quizzes, selectedQuiz]);

  const adjustPlayers = (delta: number) => {
    setMaxPlayers((current) => Math.max(2, Math.min(100, current + delta)));
  };

  const handleCreateRoom = async () => {
    if (!selectedQuiz) {
      setError("Vui lòng chọn một quiz.");
      return;
    }

    if (selectedQuiz.isDemo || !selectedRealQuiz) {
      setError("Bạn cần có quiz thật từ backend trước khi tạo phòng. Dữ liệu hiện tại chỉ là mẫu giao diện.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const room = await gameService.createRoom({
        quiz_id: selectedRealQuiz.id,
        max_players: maxPlayers,
        shuffle_questions: shuffleQuestions,
        chat_enabled: roomChat,
      });
      setCreatedRoom(room);
      router.push(`/room/${room.room_code}`);
    } catch (err) {
      setError("Không tạo được phòng. Kiểm tra backend hoặc trạng thái đăng nhập rồi thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-room-wrap">
      <button className="page-back" onClick={() => router.push("/dashboard")}>
        ← Quay lại Dashboard
      </button>
      <h1 className="page-title">⚡ Tạo phòng chơi</h1>
      <p className="page-sub">Chọn quiz, cấu hình phòng và mời bạn bè tham gia</p>

      <div className="create-room-grid">
        <div className="create-room-left">
          <section className="step-card">
            <div className="step-badge">
              <div className="step-num">1</div>
              <span className="step-label">Chọn quiz</span>
            </div>

            <div className="quiz-select-list">
              {isLoading ? (
                <div className="quiz-select-item selected">
                  <div className="quiz-icon" style={{ background: iconBackgrounds[0] }}>
                    …
                  </div>
                  <div className="quiz-info">
                    <div className="quiz-name">Đang tải quiz...</div>
                    <div className="quiz-meta-small">Vui lòng chờ trong giây lát</div>
                  </div>
                  <div className="quiz-check checked">✓</div>
                </div>
              ) : (
                pageQuizzes.map((quiz, index) => {
                  const selected = quiz.id === selectedQuizId;

                  return (
                    <button
                      className={`quiz-select-item${selected ? " selected" : ""}`}
                      key={quiz.id}
                      onClick={() => {
                        setSelectedQuizId(quiz.id);
                        setCreatedRoom(null);
                      }}
                    >
                      <div className="quiz-icon" style={{ background: iconBackgrounds[index % iconBackgrounds.length] }}>
                        {quiz.icon}
                      </div>
                      <div className="quiz-info">
                        <div className="quiz-name">{quiz.title}</div>
                        <div className="quiz-meta-small">
                          {quiz.questionCount || "Chưa rõ"} câu • {estimateDuration(quiz.totalDurationSeconds)}
                        </div>
                      </div>
                      <div className={`quiz-check${selected ? " checked" : ""}`}>{selected ? "✓" : ""}</div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Pagination controls */}
            {selectableQuizzes.length > PAGE_SIZE && (
              <div className="pagination-row">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Trước
                </button>

                <div className="pagination-info">
                  Trang {currentPage} / {totalPages}
                </div>

                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Tiếp →
                </button>
              </div>
            )}
          </section>

          <section className="step-card">
            <div className="step-badge">
              <div className="step-num">2</div>
              <span className="step-label">Cấu hình phòng</span>
            </div>

            <div className="settings-grid">
              <div className="setting-item">
                <div className="setting-label">Số người tối đa</div>
                <div className="setting-val" style={{ color: "var(--primary-light)" }}>
                  {maxPlayers}
                </div>
                <div className="setting-stepper">
                  <button type="button" className="stepper-btn" onClick={() => adjustPlayers(-5)}>
                    −
                  </button>
                  <input
                    className="setting-range"
                    type="range"
                    min={2}
                    max={100}
                    step={1}
                    value={maxPlayers}
                    onChange={(event) => setMaxPlayers(Number(event.target.value))}
                    aria-label="Kéo để chỉnh số người tối đa"
                  />
                  <button type="button" className="stepper-btn" onClick={() => adjustPlayers(5)}>
                    +
                  </button>
                </div>
              </div>


              <div className="setting-item">
                <div className="setting-label">Shuffle câu hỏi</div>
                <div className="setting-toggle-row">
                  <div className="setting-toggle-label">{shuffleQuestions ? "Bật" : "Tắt"}</div>
                  <button
                    className={`setting-toggle${shuffleQuestions ? " on-green is-on" : " is-off"}`}
                    onClick={() => setShuffleQuestions((value) => !value)}
                    aria-label="Bật tắt shuffle câu hỏi"
                  />
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-label">Chat trong phòng</div>
                <div className="setting-toggle-row">
                  <div className="setting-toggle-label">{roomChat ? "Bật" : "Tắt"}</div>
                  <button
                    className={`setting-toggle${roomChat ? " on-green is-on" : " is-off"}`}
                    onClick={() => setRoomChat((value) => !value)}
                    aria-label="Bật tắt chat trong phòng"
                  />
                </div>
              </div>
            </div>
          </section>

          {error && <div className="create-room-error">{error}</div>}
        </div>

        <aside className="preview-card">
          <div className="preview-title">📋 Preview phòng</div>
          <div className="room-code-preview">
            <div className="room-code-label">Mã phòng</div>
            <div className="room-code-val">{createdRoom?.room_code || animatedCode}</div>
            {/* <div className="room-code-sub">
              {createdRoom ? "Phòng đã tạo, đang vào lobby" : "Chia sẻ mã này cho bạn bè"}
            </div> */}
          </div>

          <div className="preview-detail">
            <div className="preview-row">
              <span className="preview-row-label">Quiz</span>
              <span className="preview-row-val">
                {selectedQuiz ? `${selectedQuiz.icon} ${selectedQuiz.title}` : "-"}
              </span>
            </div>
            <div className="preview-row">
              <span className="preview-row-label">Số câu hỏi</span>
              <span className="preview-row-val">{selectedRealQuiz?.questions?.length || selectedQuiz?.questionCount || "Chưa rõ"} câu</span>
            </div>
            <div className="preview-row">
              <span className="preview-row-label">Thời gian</span>
              <span className="preview-row-val">
                {selectedQuiz ? estimateDuration(selectedQuiz.totalDurationSeconds) : "-"}
              </span>
            </div>
            <div className="preview-row">
              <span className="preview-row-label">Tối đa</span>
              <span className="preview-row-val">{maxPlayers} người</span>
            </div>
            <div className="preview-row">
              <span className="preview-row-label">Host</span>
              <span className="preview-row-val">{user?.username || "Minh Khoa"} 👑</span>
            </div>
          </div>

          <button className="btn-create" onClick={handleCreateRoom} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "Đang tạo..." : "🚀 Tạo phòng ngay"}
          </button>
        </aside>
      </div>
    </div>
  );
}
