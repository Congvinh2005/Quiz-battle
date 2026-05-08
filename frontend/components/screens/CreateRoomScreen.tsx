"use client";

import React from "react";
import { useEffect, useState } from "react";
import { quizService } from "@/services/quizService";
import { gameService } from "@/services/gameService";
import { Quiz, GameRoom } from "@/types";

export default function CreateRoomScreen() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [createdRoom, setCreatedRoom] = useState<GameRoom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const data = await quizService.getAllQuizzes();
        setQuizzes(data);
        if (data.length > 0) {
          setSelectedQuizId(data[0].id);
        }
      } catch (err) {
        setError("Không tải được danh sách quiz.");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const handleCreateRoom = async () => {
    if (!selectedQuizId) {
      setError("Vui lòng chọn một quiz.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const room = await gameService.createRoom({ quiz_id: selectedQuizId });
      setCreatedRoom(room);
    } catch (err) {
      setError("Không tạo được phòng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-text-muted text-sm mb-2">← Quay lại</p>
        <h1 className="font-syne text-3xl font-extrabold mb-1">Tạo phòng</h1>
        <p className="text-text-muted text-sm">Chọn quiz rồi tạo phòng để mời mọi người vào chơi.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        <div className="lg:col-span-2 bg-dark-surface2 border border-border-light rounded-3xl p-6">
          {isLoading ? (
            <p className="text-text-muted">Đang tải quiz...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-text-muted mb-2">Chọn quiz</label>
                <select
                  className="w-full rounded-2xl bg-dark-surface border border-border-light px-4 py-3 text-sm"
                  value={selectedQuizId}
                  onChange={(e) => setSelectedQuizId(e.target.value)}
                >
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleCreateRoom}
                disabled={isSubmitting || !selectedQuizId}
                className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-brand-green text-white font-semibold text-sm disabled:opacity-60"
              >
                {isSubmitting ? "Đang tạo..." : "Tạo phòng"}
              </button>

              {createdRoom && (
                <div className="rounded-2xl border border-brand-green/40 bg-brand-green/10 p-4">
                  <div className="text-xs uppercase tracking-widest text-brand-green mb-1">Phòng đã tạo</div>
                  <div className="font-jetbrains-mono text-3xl font-bold">{createdRoom.room_code}</div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-dark-surface2 border border-border-light rounded-3xl p-6 sticky top-20">
          <p className="text-xs uppercase tracking-widest text-text-muted mb-3">Preview</p>
          {selectedQuizId ? (
            <div className="text-sm text-text-muted space-y-2">
              <p>Quiz: {quizzes.find((quiz) => quiz.id === selectedQuizId)?.title || "-"}</p>
              <p>Sau khi tạo, mã phòng sẽ hiện ở đây.</p>
            </div>
          ) : (
            <p className="text-text-muted">Chưa chọn quiz.</p>
          )}
        </div>
      </div>
    </div>
  );
}
