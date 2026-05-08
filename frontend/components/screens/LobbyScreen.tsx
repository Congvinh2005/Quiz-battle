"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { gameService } from "@/services/gameService";
import { GameRoom, RoomPlayer } from "@/types";

interface LobbyScreenProps {
  roomCode: string;
}

interface DisplayPlayer {
  id: string;
  display_name: string;
  score: number;
  isHost?: boolean;
}

interface ChatLine {
  name: string;
  text: string;
}

const demoPlayers: DisplayPlayer[] = [
  { id: "demo-host", display_name: "Minh Khoa", score: 0, isHost: true },
  { id: "demo-1", display_name: "Lan Anh", score: 0 },
  { id: "demo-2", display_name: "Tuấn Hùng", score: 0 },
  { id: "demo-3", display_name: "Nam Quân", score: 0 },
  { id: "demo-4", display_name: "Hồng Vân", score: 0 },
  { id: "demo-5", display_name: "Bảo Khang", score: 0 },
  { id: "demo-6", display_name: "Thùy Linh", score: 0 },
];

const demoChat: ChatLine[] = [
  { name: "Lan Anh", text: "Sẵn sàng! 🎮" },
  { name: "Tuấn Hùng", text: "Hy vọng câu về địa lý 😅" },
  { name: "Nam Quân", text: "Ai biết thủ đô Nhật không? 😂" },
  { name: "Hồng Vân", text: "Tokyo duhh 🤣" },
];

const avatarGradients = [
  "linear-gradient(135deg,var(--gold),#D97706)",
  "linear-gradient(135deg,var(--primary),var(--primary-light))",
  "linear-gradient(135deg,var(--accent),#0891B2)",
  "linear-gradient(135deg,var(--green),#059669)",
  "linear-gradient(135deg,#EC4899,#BE185D)",
  "linear-gradient(135deg,#F59E0B,#D97706)",
  "linear-gradient(135deg,#6366F1,#4F46E5)",
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : name.slice(0, 2);
  return initials.toUpperCase();
}

export default function LobbyScreen({ roomCode }: LobbyScreenProps) {
  const router = useRouter();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatLine[]>(demoChat);
  const [chatInput, setChatInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [roomData, playersData] = await Promise.all([
          gameService.getRoomByCode(roomCode),
          gameService.getRoomPlayers(roomCode),
        ]);
        setRoom(roomData);
        setPlayers(playersData);
      } catch (err) {
        setError("Không tải được dữ liệu phòng. Đang hiển thị dữ liệu mẫu để xem giao diện.");
      } finally {
        setIsLoading(false);
      }
    };

    if (roomCode) {
      loadRoom();
    }
  }, [roomCode]);

  const displayPlayers = useMemo<DisplayPlayer[]>(() => {
    if (players.length === 0) return demoPlayers;

    return players.map((player, index) => ({
      id: player.id,
      display_name: player.display_name,
      score: player.score,
      isHost: index === 0,
    }));
  }, [players]);

  const displayRoomCode = room?.room_code || roomCode || "GX7R2K";
  const maxPlayers = 30;
  const emptySlots = Math.max(0, Math.min(2, maxPlayers - displayPlayers.length));
  const isPlaying = room?.status === "PLAYING";

  const handleSendChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setChatMessages((current) => [...current, { name: "Bạn", text }]);
    setChatInput("");
  };

  const handleStartGame = async () => {
    if (!room) {
      router.push(`/game/${displayRoomCode}`);
      return;
    }

    try {
      setIsStarting(true);
      setError(null);
      const updatedRoom = await gameService.startGame(displayRoomCode);
      setRoom(updatedRoom);
      router.push(`/game/${displayRoomCode}`);
    } catch (err) {
      setError("Không thể bắt đầu trò chơi. Kiểm tra backend hoặc quyền host rồi thử lại.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="lobby-wrap">
      <div className="lobby-header">
        <div>
          <h1 className="page-title">👥 Sảnh chờ</h1>
          <p className="lobby-subtitle">Chờ mọi người vào đủ rồi bắt đầu!</p>
        </div>
        <div className="lobby-code-block">
          <div className="lobby-code-label">Mã phòng</div>
          <div className="lobby-code">{displayRoomCode}</div>
        </div>
      </div>

      {error && <div className="lobby-error">{error}</div>}

      <div className="lobby-grid">
        <section className="players-area">
          <div className="players-area-header">
            <span className="players-count">
              Người chơi <span>({displayPlayers.length}/{maxPlayers})</span>
            </span>
            <span className="waiting-text">
              <span className="waiting-dot" />
              {isLoading ? "Đang tải..." : isPlaying ? "Đang chơi" : "Đang chờ..."}
            </span>
          </div>

          <div className="players-grid">
            {displayPlayers.map((player, index) => (
              <div className={`player-chip${player.isHost ? " host" : ""}`} key={player.id}>
                <div className="player-av" style={{ background: avatarGradients[index % avatarGradients.length] }}>
                  {getInitials(player.display_name)}
                </div>
                <div className="player-name">{player.display_name}</div>
                {player.isHost && <div className="player-badge">👑 Host</div>}
              </div>
            ))}

            {Array.from({ length: emptySlots }).map((_, index) => (
              <div className="player-chip empty" key={`empty-${index}`}>
                <div className="player-av" style={{ background: "var(--border2)" }}>
                  ?
                </div>
                <div className="player-name muted">Chờ join...</div>
              </div>
            ))}
          </div>
        </section>

        <aside className="lobby-right">
          <div className="quiz-preview-card">
            <div className="qp-icon">🌍</div>
            <div className="qp-title">Địa Lý Thế Giới</div>
            <div className="qp-meta">
              <span>📝 10 câu hỏi</span>
              <span>⏱ 30 giây / câu</span>
              <span>⭐ Độ khó: Trung bình</span>
              <span>🔀 Câu hỏi bị shuffle</span>
              {room?.quiz_id && <span>Quiz ID: {room.quiz_id}</span>}
            </div>
          </div>

          <div className="chat-card">
            <div className="chat-title">
              💬 Chat phòng <span className="chat-live">LIVE</span>
            </div>
            <div className="chat-messages">
              {chatMessages.map((message, index) => (
                <div className="chat-msg" key={`${message.name}-${index}`}>
                  <span className="chat-msg-name">{message.name}: </span>
                  {message.text}
                </div>
              ))}
            </div>
            <form className="chat-input-row" onSubmit={handleSendChat}>
              <input
                className="chat-input"
                placeholder="Nhắn gì đó..."
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
              />
              <button className="chat-send" type="submit">
                ➤
              </button>
            </form>
          </div>

          <button className="btn-start" onClick={handleStartGame} disabled={isStarting || isPlaying}>
            {isStarting ? "Đang bắt đầu..." : isPlaying ? "Đang chơi" : `🚀 Bắt đầu game! (${displayPlayers.length} người)`}
          </button>
        </aside>
      </div>
    </div>
  );
}
