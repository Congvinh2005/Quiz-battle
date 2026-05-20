"use client";

import React, { useEffect, useMemo, useState } from "react";
import { statisticsService } from "@/services/statisticsService";
import { PlayedQuizStat, StatisticsResponse } from "@/types";

function formatDate(value?: string | null) {
  if (!value) return "Chưa rõ";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function accuracyOf(item: PlayedQuizStat) {
  if (!item.answer_count) return 0;
  return Math.round((item.correct_count / item.answer_count) * 100);
}

const optionLetters = ["A", "B", "C", "D"];

function questionTypeLabel(type?: string | null) {
  return type === "TRUE_FALSE" ? "Đúng / Sai" : "Chọn câu";
}

function formatResponseTime(value?: number | null) {
  if (value === null || value === undefined) return "Chưa rõ";
  return `${Math.round(value)}s`;
}

export default function StatisticsScreen() {
  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const nextData = await statisticsService.getMyStatistics();
        setData(nextData);
        setSelectedResultId(nextData.played_quizzes[0]?.result_id ?? null);
      } catch (err) {
        console.error("Failed to load statistics:", err);
        setError("Không tải được thống kê. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, []);

  const playedQuizzes = data?.played_quizzes ?? [];
  const selectedQuiz = useMemo(
    () => playedQuizzes.find((item) => item.result_id === selectedResultId) ?? playedQuizzes[0],
    [playedQuizzes, selectedResultId],
  );

  if (isLoading) {
    return (
      <main className="statistics-wrap">
        <div className="statistics-empty">Đang tải thống kê...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="statistics-wrap">
        <div className="statistics-empty">{error}</div>
      </main>
    );
  }

  const summary = data?.summary;

  return (
    <main className="statistics-wrap">
      <section className="statistics-hero">
        <div>
          <div className="statistics-kicker">📊 Thống kê cá nhân</div>
          <h1 className="statistics-title">Lịch sử chơi và hiệu suất</h1>
          <p className="statistics-sub">Xem lại các quiz đã làm, điểm số, thứ hạng và từng câu đúng sai.</p>
        </div>

        <div className="statistics-summary">
          <div className="stat-tile">
            <span>{summary?.total_games ?? 0}</span>
            <small>Lượt chơi</small>
          </div>
          <div className="stat-tile">
            <span>{summary?.total_score ?? 0}</span>
            <small>Tổng điểm</small>
          </div>
          <div className="stat-tile">
            <span>{Math.round(summary?.avg_score ?? 0)}</span>
            <small>Điểm TB</small>
          </div>
          <div className="stat-tile">
            <span>{summary?.wins ?? 0}</span>
            <small>Top 1</small>
          </div>
        </div>
      </section>

      {playedQuizzes.length === 0 ? (
        <section className="statistics-empty">
          Bạn chưa hoàn thành quiz nào. Sau khi chơi xong, kết quả sẽ xuất hiện ở đây.
        </section>
      ) : (
        <section className="statistics-layout">
          <aside className="played-list">
            <div className="stats-section-title">Quiz đã làm</div>
            {playedQuizzes.map((item) => (
              <button
                className={`played-item${selectedQuiz?.result_id === item.result_id ? " active" : ""}`}
                key={item.result_id}
                onClick={() => setSelectedResultId(item.result_id)}
                type="button"
              >
                <span className="played-title">{item.quiz_title}</span>
                <span className="played-meta">
                  {item.final_score} điểm · Hạng {item.rank ?? "-"} · {accuracyOf(item)}%
                </span>
                <span className="played-date">{formatDate(item.played_at)}</span>
              </button>
            ))}
          </aside>

          <section className="answer-review">
            {selectedQuiz ? (
              <>
                <div className="review-shell">
                  <aside className="review-summary-card">
                    <h2>Điểm: {selectedQuiz.final_score}</h2>
                    <div className="review-info-box">
                      <h3>Thông tin chi tiết</h3>
                      <p>
                        <span>Thời gian nộp bài:</span>
                        <strong>{formatDate(selectedQuiz.played_at)}</strong>
                      </p>
                      <p>
                        <span>Trắc nghiệm:</span>
                        <strong>
                          {selectedQuiz.correct_count}/{selectedQuiz.answer_count} câu
                        </strong>
                      </p>
                      <p>
                        <span>Xếp hạng:</span>
                        <strong>#{selectedQuiz.rank ?? "-"}</strong>
                      </p>
                      <p>
                        <span>Độ chính xác:</span>
                        <strong>{accuracyOf(selectedQuiz)}%</strong>
                      </p>
                    </div>
                  </aside>

                  <div className="review-detail">
                    <div className="review-topbar">
                      <div className="review-topbar-icon">◧</div>
                      <h2>{selectedQuiz.quiz_title}</h2>
                      <div className="review-topbar-actions">
                        <span className="review-pill correct">Đúng & sai</span>
                        <span className="review-pill shuffle">Đề đảo</span>
                      </div>
                    </div>

                    <div className="review-tab">Trắc nghiệm</div>

                    <div className="answer-list review-question-list">
                      {selectedQuiz.answers.length > 0 ? (
                        selectedQuiz.answers.map((answer, index) => {
                          const correctIndex = answer.options.findIndex((option) => option.is_correct);
                          const selectedIndex = answer.options.findIndex((option) => option.id === answer.selected_option_id);
                          const correctLetter = correctIndex >= 0 ? optionLetters[correctIndex] : "-";

                          return (
                            <article className="review-question-card" key={answer.id}>
                              <div className="review-question-title">
                                <strong>Câu {index + 1}</strong>
                                <span>ID: {answer.question_id.slice(0, 8)}</span>
                                <span className="review-question-chip">{questionTypeLabel(answer.question_type)}</span>
                                <span className="review-question-chip time">
                                  Làm trong {formatResponseTime(answer.response_time)}
                                  {answer.time_limit ? ` / ${answer.time_limit}s` : ""}
                                </span>
                              </div>
                              <h3>{answer.question}</h3>

                              <div className="review-options-grid">
                                {answer.options.map((option, optionIndex) => {
                                  const isCorrect = option.is_correct;
                                  const isSelected = option.id === answer.selected_option_id;
                                  const isWrongSelected = isSelected && !isCorrect;

                                  return (
                                    <div
                                      className={`review-option${isCorrect ? " correct" : ""}${isWrongSelected ? " wrong-selected" : ""}`}
                                      key={option.id}
                                    >
                                      <span>{optionLetters[optionIndex]}.</span>
                                      <p>{option.content}</p>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="review-answer-row">
                                <span className={answer.is_correct ? "review-correct-label" : "review-wrong-label"}>
                                  Đáp án đúng: {correctLetter}
                                </span>
                                <div className="review-answer-buttons">
                                  {answer.options.map((option, optionIndex) => {
                                    const isCorrect = option.is_correct;
                                    const isSelected = option.id === answer.selected_option_id;
                                    const isWrongSelected = isSelected && !isCorrect;

                                    return (
                                      <span
                                        className={`review-answer-chip${isCorrect ? " correct" : ""}${isWrongSelected ? " wrong" : ""}`}
                                        key={option.id}
                                      >
                                        {isCorrect ? "✓ " : isWrongSelected ? "× " : ""}
                                        {optionLetters[optionIndex]}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </article>
                          );
                        })
                      ) : (
                        <div className="statistics-empty compact">Lượt chơi này chưa có câu trả lời được lưu.</div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </section>
        </section>
      )}
    </main>
  );
}
