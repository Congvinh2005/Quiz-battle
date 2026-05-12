"use client";

import React from "react";
import { useEffect, useState } from "react";
import { quizService } from "@/services/quizService";
import { Quiz } from "@/types";

export default function DashboardScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setIsLoading(true);
        const data = await quizService.getAllQuizzes();
        setQuizzes(data);
      } catch (err) {
        setError("Không tải được danh sách quiz.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-syne text-4xl font-extrabold mb-2">Bảng điều khiển</h1>
        <p className="text-text-muted text-sm">Chọn một quiz để tạo phòng hoặc xem dữ liệu hiện có.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-dark-surface2 border border-border-light rounded-card p-6 text-center">
          {isLoading ? (
            <p className="text-text-muted">Đang tải danh sách quiz...</p>
          ) : error ? (
            <p className="text-red-400">{error}</p>
          ) : quizzes.length === 0 ? (
            <p className="text-text-muted">Chưa có quiz nào.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 text-left">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-dark-surface border border-border-light rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="font-syne text-lg font-bold">{quiz.title}</h2>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-brand-green/15 text-brand-green">
                      {quiz.is_public ? "Công khai" : "Riêng tư"}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted mb-3">{quiz.description || "Chưa có mô tả"}</p>
                  <p className="text-xs text-text-muted">ID: {quiz.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
