"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { gameService } from "@/services/gameService";
import { RoomStateResponse } from "@/types";
import { wsService } from "@/services/websocketService";

interface ResultScreenProps {
  roomCode: string;
}

interface LeaderboardRow {
  id: string;
  userId: string;
  rank: number;
  initials: string;
  name: string;
  score: number;
  gradient: string;
  avatarUrl?: string | null;
  isMe?: boolean;
  isHost?: boolean;
  rankClass?: string;
}

const confetti = [
  { left: "10%", background: "var(--gold)", delay: "0s", duration: "2.5s" },
  { left: "25%", background: "var(--primary)", delay: ".3s", duration: "3s" },
  { left: "40%", background: "var(--accent)", delay: ".6s", rounded: true },
  { left: "60%", background: "var(--green)", delay: ".9s", duration: "2.8s" },
  { left: "75%", background: "var(--gold)", delay: ".2s" },
  { left: "88%", background: "var(--primary-light)", delay: ".5s", rounded: true },
  { left: "50%", background: "#EC4899", delay: "1s", duration: "3.2s" },
  { left: "33%", background: "var(--gold)", delay: ".8s", rounded: true },
];

const podiumGradients = [
  "linear-gradient(135deg,var(--gold),#D97706)",
  "linear-gradient(135deg,var(--primary),var(--primary-light))",
  "linear-gradient(135deg,var(--accent),#0891B2)",
];

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
};

const formatScore = (score: number) => score.toLocaleString("vi-VN");

const getPodiumClass = (rank: number) => {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  return "bronze";
};

const toLeaderboardRows = (leaderboard: any[]): LeaderboardRow[] => {
  return leaderboard
    .slice()
    .sort((left, right) => (left.rank ?? 0) - (right.rank ?? 0))
    .map((item, index) => {
      const name = item.display_name || `Người chơi ${index + 1}`;
      const score = Number(item.final_score ?? item.score ?? 0);
      const rank = Number(item.rank ?? index + 1);

      return {
        id: String(item.id ?? `${item.user_id}-${rank}`),
        userId: String(item.user_id),
        rank,
        initials: getInitials(name),
        name,
        score,
        gradient: podiumGradients[index % podiumGradients.length],
        avatarUrl: item.avatar_url ?? null,
        rankClass: rank === 1 ? "gold-text" : rank === 2 ? "silver-text" : rank === 3 ? "bronze-text" : undefined,
      };
    });
};

export default function ResultScreen({ roomCode }: ResultScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [results, setResults] = useState<LeaderboardRow[]>([]);
  const [roomState, setRoomState] = useState<RoomStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplaying, setIsReplaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousRanksRef = useRef<Map<string, number>>(new Map());
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyLeaderboard = (leaderboard: any[]) => {
    const nextRows = toLeaderboardRows(leaderboard);
    const previousRanks = previousRanksRef.current;
    const changedRows = nextRows.filter((row) => previousRanks.get(row.userId) !== row.rank);

    previousRanksRef.current = new Map(nextRows.map((row) => [row.userId, row.rank]));
    setResults(nextRows);

    if (highlightTimerRef.current) {
      clearTimeout(highlightTimerRef.current);
    }

    if (changedRows.length) {
      setHighlightedRowIds(changedRows.map((row) => row.id));
      highlightTimerRef.current = setTimeout(() => {
        setHighlightedRowIds([]);
        highlightTimerRef.current = null;
      }, 900);
    } else {
      setHighlightedRowIds([]);
    }
  };

  const [highlightedRowIds, setHighlightedRowIds] = useState<string[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    let cancelled = false;

    const loadResults = async () => {
      try {
        const [nextRoomState, nextResults] = await Promise.all([
          gameService.getRoomState(roomCode),
          gameService.getGameResults(roomCode),
        ]);

        if (cancelled) return;

        setRoomState(nextRoomState);
        applyLeaderboard(nextResults as any[]);
        setError(null);
        setIsLoading(false);
      } catch (loadError) {
        if (cancelled) return;
        console.error("Failed to load results:", loadError);
        setError("Không thể tải bảng xếp hạng realtime. Đang thử lại...");
        setIsLoading(false);
      }
    };

    void loadResults();

    const handleLeaderboardUpdate = (payload: any) => {
      try { console.debug("Result handler PLAYER_ANSWERED ->", payload); } catch (e) { }
      if (cancelled) return;

      const leaderboard = payload?.leaderboard;
      if (Array.isArray(leaderboard)) {
        applyLeaderboard(leaderboard);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Fallback: fetch results if payload doesn't include leaderboard
      void (async () => {
        try {
          const latest = await gameService.getGameResults(roomCode);
          if (cancelled) return;
          applyLeaderboard(latest as any[]);
          setError(null);
          setIsLoading(false);
        } catch (err) {
          // keep existing error state
        }
      })();
    };

    const handleGameEnded = async () => {
      if (cancelled) return;
      await loadResults();
    };

    const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "";
    wsService.on("PLAYER_ANSWERED", handleLeaderboardUpdate);
    wsService.on("GAME_ENDED", handleGameEnded);

    if (accessToken) {
      wsService.connect(accessToken, roomCode).catch((connectError) => {
        console.error("Failed to connect results websocket:", connectError);
      });
    }

    return () => {
      cancelled = true;
      if (highlightTimerRef.current) {
        clearTimeout(highlightTimerRef.current);
        highlightTimerRef.current = null;
      }
      wsService.off("PLAYER_ANSWERED", handleLeaderboardUpdate);
      wsService.off("GAME_ENDED", handleGameEnded);
      wsService.disconnect();
    };
  }, [roomCode]);

  const room = roomState?.room;
  const cameFromStatistics = searchParams.get("from") === "statistics";
  const rows = useMemo<LeaderboardRow[]>(() => {
    const hostId = roomState?.room?.host_id;

    return results.map((result) => ({
      ...result,
      score: result.score,
      isMe: result.userId === user?.id,
      isHost: result.userId === hostId,
    }));
  }, [results, roomState?.room?.host_id, user?.id]);

  const topThree = rows.slice(0, 3);
  const podiumRows = [2, 1, 3]
    .map((rank) => topThree.find((row) => row.rank === rank))
    .filter((row): row is LeaderboardRow => Boolean(row));
  const miniBoardRows = rows.slice(0, 8);
  const quizTitle = roomState?.quiz?.title || "Kết quả Quiz";
  const subtitle = room
    ? `Phòng ${roomCode} • ${roomState?.game_state.total_questions ?? 0} câu hỏi • ${room.player_count ?? roomState?.player_count ?? rows.length} người chơi`
    : `Phòng ${roomCode}`;

  const handlePlayAgain = async () => {
    const quizId = room?.quiz_id;
    if (!quizId) {
      setError("Không tìm thấy bộ quiz của phòng hiện tại.");
      return;
    }

    try {
      setIsReplaying(true);
      setError(null);

      const recreatedRoom = await gameService.createRoom({
        quiz_id: quizId,
        max_players: roomState?.settings?.max_players,
        shuffle_questions: roomState?.settings?.shuffle_questions,
        chat_enabled: roomState?.settings?.chat_enabled,
      });

      router.push(`/room/${recreatedRoom.room_code}`);
    } catch (replayError) {
      console.error("Failed to create replay room:", replayError);
      setError("Không thể chơi lại lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsReplaying(false);
    }
  };

  return (
    <div className="result-wrap">
      <div className="result-layout">
        <main className="result-main">
          <section className="result-hero">
            <div className="result-confetti">
              {confetti.map((item, index) => (
                <div
                  className="confetti-bit"
                  key={index}
                  style={{
                    left: item.left,
                    background: item.background,
                    animationDelay: item.delay,
                    animationDuration: item.duration,
                    borderRadius: item.rounded ? "50%" : undefined,
                  }}
                />
              ))}
            </div>
            <div className="result-trophy">🏆</div>
            <h1 className="result-title">
              Bảng xếp hạng
              <span>
                <span className="result-quiz-label">Bộ quiz:</span> &quot;{quizTitle}&quot;
              </span>
            </h1>
            <p className="result-sub">{subtitle}</p>
            {error && <p className="result-sub">{error}</p>}
            {isLoading && <p className="result-sub">Đang tải bảng xếp hạng...</p>}
          </section>

          <section className="podium">
            {podiumRows.map((row) => {
              const podiumClass = getPodiumClass(row.rank);

              return (
                <div className={`podium-item rank-${row.rank}`} key={`${row.rank}-${row.name}`}>
                  <div
                    className={`podium-av ${podiumClass}`}
                  style={{ background: podiumGradients[row.rank - 1] }}
                >
                    {row.avatarUrl ? (
                      <img className="result-av-img" src={row.avatarUrl} alt="" />
                    ) : (
                      row.initials
                    )}
                  </div>
                  <div className={`podium-name${row.isMe ? " podium-name-small" : ""}`}>
                    {row.name}
                    {row.isMe && (
                      <>
                        <br />
                        <span className="podium-me">(Bạn)</span>
                      </>
                    )}
                    {row.isHost && (
                      <>
                        <br />
                        <span className="podium-host">HOST</span>
                      </>
                    )}
                  </div>
                  <div className="podium-score">{formatScore(row.score)}</div>
                  <div className={`podium-bar ${podiumClass}`}>
                    <div className={`podium-pos ${podiumClass}`}>{row.rank}</div>
                  </div>
                </div>
              );
            })}
          </section>
          <div className="full-leaderboard">
            <div className="lb-header">
              <span className="lb-title">📊 Bảng xếp hạng đầy đủ</span>
              <span className="lb-total">{rows.length} người chơi</span>
            </div>
            {rows.map((row) => (
              <div key={row.id} className={`lb-row${row.isMe ? " me" : ""}`}>
                <div className={`lb-rank-num${row.rankClass ? ` ${row.rankClass}` : ""}`}>
                  {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : row.rank}
                </div>
                <div className="lb-av" style={{ background: row.gradient }}>
                  {row.avatarUrl ? (
                    <img className="result-av-img" src={row.avatarUrl} alt="" />
                  ) : (
                    row.initials
                  )}
                </div>
                <div className="lb-name">
                  {row.name} {row.isMe && <span className="lb-you">(Bạn)</span>}
                </div>
                <div className="lb-score-val">{formatScore(row.score)} điểm</div>
              </div>
            ))}
          </div>
          <div className="result-actions">
            <button className="btn-play-again" onClick={handlePlayAgain} disabled={isReplaying}>
              {isReplaying ? "Đang tạo phòng mới..." : "🔄 Chơi lại"}
            </button>
            <button className="btn-home" onClick={() => router.push("/dashboard")} disabled={isReplaying}>
              🏠 Về trang chủ
            </button>
            {cameFromStatistics && (
              <button className="btn-home btn-statistics-back" onClick={() => router.push("/statistics")} disabled={isReplaying}>
                📊 Quay lại thống kê
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
