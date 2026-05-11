"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { gameService } from "@/services/gameService";
import { wsService } from "@/services/websocketService";
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
  const { user } = useAuth();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatLine[]>(demoChat);
  const [chatInput, setChatInput] = useState("");
  const [joinDisplayName, setJoinDisplayName] = useState(user?.username || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isAutoJoining, setIsAutoJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [roomClosedMessage, setRoomClosedMessage] = useState<string | null>(null);
  const [isRealtimeReady, setIsRealtimeReady] = useState(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoJoinAttemptedRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRedirectedRef = useRef(false);

  const isRoomNotFoundError = useCallback((err: any) => err?.response?.status === 404, []);

  const notifyRoomClosedAndRedirect = useCallback((message: string) => {
    if (redirectTimeoutRef.current) return;

    setRoomClosedMessage(message);
    setError(message);
    redirectTimeoutRef.current = setTimeout(() => {
      router.push("/dashboard");
    }, 3000);
  }, [router]);

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Load room data
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

        // Auto-redirect if game is already playing (late joiners)
        if (roomData?.status === "PLAYING") {
          setTimeout(() => {
            router.push(`/game/${roomCode}`);
          }, 500);
          return;
        }
      } catch (err) {
        if (isRoomNotFoundError(err)) {
          notifyRoomClosedAndRedirect("Host đã rời phòng, phòng đã đóng. Bạn sẽ được chuyển về Dashboard...");
          return;
        }

        setError("Không tải được dữ liệu phòng. Đang hiển thị dữ liệu mẫu để xem giao diện.");
      } finally {
        setIsLoading(false);
      }
    };

    if (roomCode) {
      loadRoom();
    }
  }, [roomCode, isRoomNotFoundError, notifyRoomClosedAndRedirect, router]);

  // Auto-join guests when they enter the room
  useEffect(() => {
    if (!roomCode || !user || isAutoJoining || autoJoinAttemptedRef.current) return;

    const loadedPlayers = players;
    const userAlreadyInRoom = loadedPlayers.some((player) => player.user_id === user.id);

    if (userAlreadyInRoom) {
      autoJoinAttemptedRef.current = true;
      return; // Already in room, no need to auto-join
    }

    // Auto-join guest (non-host users)
    const autoJoin = async () => {
      try {
        setIsAutoJoining(true);
        autoJoinAttemptedRef.current = true;

        await gameService.joinRoom(roomCode, user.username || `Player_${user.id?.slice(0, 4)}`);

        // Refresh players list
        const updatedPlayers = await gameService.getRoomPlayers(roomCode);
        setPlayers(updatedPlayers);
      } catch (err) {
        // If error, let user join manually
        console.error("Auto-join failed:", err);
      } finally {
        setIsAutoJoining(false);
      }
    };

    // Auto-join after short delay to ensure room is loaded
    if (players.length > 0) {
      autoJoin();
    }
  }, [roomCode, user, players, isAutoJoining]);

  // Polling fallback: Check room status every 500ms to catch game start
  useEffect(() => {
    if (!roomCode || hasRedirectedRef.current) return;

    const startPolling = () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }

      pollIntervalRef.current = setInterval(async () => {
        try {
          const roomData = await gameService.getRoomByCode(roomCode);
          if (roomData?.status === "PLAYING" && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            setTimeout(() => {
              router.push(`/game/${roomCode}`);
            }, 100);
          }
        } catch (err) {
          // Silent fail on polling errors
        }
      }, 500);
    };

    startPolling();

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [roomCode, router]);

  // WebSocket realtime updates
  useEffect(() => {
    if (!roomCode || roomClosedMessage) return;

    const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "";

    if (!accessToken) {
      console.warn("Skip realtime lobby connection: missing access token.");
      setIsRealtimeReady(true);
      return;
    }

    const applyRoomState = (data: any) => {
      if (data?.room) {
        setRoom(data.room);
      }

      if (Array.isArray(data?.players)) {
        setPlayers(data.players);
      }
    };

    const handlePlayerJoined = (data: any) => {
      applyRoomState(data);
    };

    const handlePlayerLeft = (data: any) => {
      applyRoomState(data);
    };

    const handleGameStarted = (data: any) => {
      applyRoomState(data);
      // Update room status immediately for UI
      if (data?.room) {
        setRoom(data.room);
      }
      // Clear polling since game started
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      hasRedirectedRef.current = true;
      // Redirect all players to game screen
      setTimeout(() => {
        router.push(`/game/${roomCode}`);
      }, 300);
    };

    const handleRoomClosed = (data: any) => {
      const message = data?.message || "Host đã rời phòng, phòng đã đóng. Bạn sẽ được chuyển về Dashboard...";
      notifyRoomClosedAndRedirect(message);
    };

    const handleChatMessage = (data: any) => {
      if (data?.user?.username && data?.message) {
        setChatMessages(prev => [...prev, {
          name: data.user.username,
          text: data.message,
        }]);
      }
    };

    setIsRealtimeReady(false);

    wsService.on("PLAYER_JOINED", handlePlayerJoined);
    wsService.on("PLAYER_LEFT", handlePlayerLeft);
    wsService.on("GAME_STARTED", handleGameStarted);
    wsService.on("ROOM_CLOSED", handleRoomClosed);
    wsService.on("CHAT_MESSAGE", handleChatMessage);

    wsService.connect(accessToken, roomCode).catch((err) => {
      console.error("Failed to connect websocket:", err);
    }).finally(() => {
      setIsRealtimeReady(true);
    });

    return () => {
      wsService.off("PLAYER_JOINED", handlePlayerJoined);
      wsService.off("PLAYER_LEFT", handlePlayerLeft);
      wsService.off("GAME_STARTED", handleGameStarted);
      wsService.off("ROOM_CLOSED", handleRoomClosed);
      wsService.off("CHAT_MESSAGE", handleChatMessage);
      wsService.disconnect();
    };
  }, [roomCode, roomClosedMessage, notifyRoomClosedAndRedirect, router]);

  const displayPlayers = useMemo<DisplayPlayer[]>(() => {
    if (players.length === 0) return demoPlayers;

    return players.map((player) => ({
      id: player.id,
      display_name: player.display_name,
      score: player.score,
      isHost: player.user_id === room?.host_id,
    }));
  }, [players, room?.host_id]);

  // Check if current user is already in the room
  const currentUserInRoom = useMemo(() => {
    return players.some((player) => player.user_id === user?.id);
  }, [players, user]);

  const displayRoomCode = room?.room_code || roomCode || "GX7R2K";
  const maxPlayers = room?.settings?.max_players || 30;
  const emptySlots = Math.max(0, Math.min(2, maxPlayers - displayPlayers.length));
  const isPlaying = room?.status === "PLAYING";
  const isCurrentUserHost = !!(user?.id && room?.host_id && user.id === room.host_id);

  const handleSendChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || !roomCode) return;

    try {
      await gameService.postChatMessage(roomCode, { message: text });
      setChatInput("");
      // Message will be added via WebSocket listener
    } catch (err) {
      console.error("Failed to send chat:", err);
    }
  };

  const handleStartGame = async () => {
    if (!room) {
      router.push(`/game/${displayRoomCode}`);
      return;
    }

    if (!isCurrentUserHost) {
      setError("Chỉ host mới có quyền bắt đầu game.");
      return;
    }

    try {
      setIsStarting(true);
      setError(null);
      const updatedRoom = await gameService.startGame(displayRoomCode);
      setRoom(updatedRoom);
      // Navigation will be handled by WebSocket GAME_STARTED event
    } catch (err) {
      if (isRoomNotFoundError(err)) {
        notifyRoomClosedAndRedirect("Phòng đã đóng do host rời phòng. Bạn sẽ được chuyển về Dashboard...");
        return;
      }

      setError("Không thể bắt đầu trò chơi. Kiểm tra backend hoặc quyền host rồi thử lại.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      setIsLeaving(true);
      setError(null);
      await gameService.leaveRoom(displayRoomCode);
      router.push("/dashboard");
    } catch (err) {
      setError("Không thể rời phòng lúc này. Vui lòng thử lại.");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="lobby-wrap">
      <div className="lobby-header">
        <div>
          <h1 className="page-title">👥 Sảnh chờ</h1>
          <p className="lobby-subtitle">Chờ mọi người vào đủ rồi bắt đầu!</p>
          {isAutoJoining && (
            <p className="lobby-subtitle" style={{ fontSize: "14px", opacity: 0.75, color: "#4CAF50" }}>
              ✓ Đang tự động vào phòng...
            </p>
          )}
          {!isRealtimeReady && !roomClosedMessage && (
            <p className="lobby-subtitle" style={{ fontSize: "14px", opacity: 0.75 }}>
              Đang kết nối realtime...
            </p>
          )}
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
            <div className="qp-title">{room?.quiz?.title || "Địa Lý Thế Giới"}</div>
            <div className="qp-meta">
              <span>📝 {room?.quiz?.question_count || 10} câu hỏi</span>
              <span>⏱ {room?.quiz?.total_duration_formatted || "~5m 30s"}</span>
              <span>🔀 {room?.settings?.shuffle_questions ? "Câu hỏi bị shuffle" : "Câu hỏi không shuffle"}</span>
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

          {isCurrentUserHost ? (
            <button className="btn-start" onClick={handleStartGame} disabled={isStarting || isPlaying || isLeaving}>
              {isStarting ? "Đang bắt đầu..." : isPlaying ? "Đang chơi" : `🚀 Bắt đầu game! (${displayPlayers.length} người)`}
            </button>
          ) : (
            <button className="btn-start" onClick={handleLeaveRoom} disabled={isLeaving}>
              {isLeaving ? "Đang rời..." : "👋 Rời phòng"}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
}
