"use client";

import React, { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/authService";
import { gameService } from "@/services/gameService";
import { wsService } from "@/services/websocketService";
import { GameRoom, RoomPlayer } from "@/types";

interface LobbyScreenProps {
  roomCode: string;
}

interface DisplayPlayer {
  id: string;
  display_name: string;
  full_name?: string | null;
  avatar_url?: string | null;
  score: number;
  isHost?: boolean;
}

interface ChatLine {
  id?: string;
  userId?: string;
  isHost?: boolean;
  name: string;
  text: string;
  createdAt?: string;
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

function formatChatTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

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
  const [chatMessages, setChatMessages] = useState<ChatLine[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [joinDisplayName, setJoinDisplayName] = useState(user?.full_name || user?.username || "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [roomClosedMessage, setRoomClosedMessage] = useState<string | null>(null);
  const [isRealtimeReady, setIsRealtimeReady] = useState(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRedirectedRef = useRef(false);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const pendingOptimisticMessageIdRef = useRef<string | null>(null);
  const lastAlertedErrorRef = useRef<string | null>(null);

  const isRoomNotFoundError = useCallback((err: any) => err?.response?.status === 404, []);
  const getErrorMessage = useCallback((err: any, fallback: string) => {
    return err?.response?.data?.detail || err?.message || fallback;
  }, []);
  const hostUserId = room?.host_id || null;
  const isChatEnabled = room?.settings?.chat_enabled === true;

  const toChatLine = useCallback((message: any, overrideHostUserId?: string | null): ChatLine => {
    const userId = message?.user_id || message?.user?.id;
    const effectiveHostId = overrideHostUserId !== undefined ? overrideHostUserId : hostUserId;
    return {
      id: message?.id,
      userId,
      isHost: !!(effectiveHostId && userId && String(userId) === String(effectiveHostId)),
      name: message?.user?.username || message?.name || "Người chơi",
      text: message?.message || message?.text || "",
      createdAt: message?.created_at || message?.createdAt || new Date().toISOString(),
    };
  }, [hostUserId]);
  const ensureFreshAccessToken = useCallback(async () => {
    if (typeof window === "undefined") return "";

    const currentToken = localStorage.getItem("access_token") || "";
    const refreshToken = localStorage.getItem("refresh_token") || "";

    if (!refreshToken) {
      return currentToken;
    }

    try {
      await authService.getCurrentUser();
      return currentToken;
    } catch {
      try {
        const tokens = await authService.refreshToken(refreshToken);
        localStorage.setItem("access_token", tokens.access_token);
        if (tokens.refresh_token) {
          localStorage.setItem("refresh_token", tokens.refresh_token);
        }
        return tokens.access_token;
      } catch {
        return currentToken;
      }
    }
  }, []);
  const mergeChatMessages = useCallback((current: ChatLine[], incoming: ChatLine[]) => {
    if (!incoming.length) return current;

    const existingIds = new Set(current.map((message) => message.id).filter(Boolean));
    const appended = incoming.filter((message) => {
      if (!message.id) return true;
      return !existingIds.has(message.id);
    });

    if (!appended.length) return current;
    return [...current, ...appended];
  }, []);

  useEffect(() => {
    if (!chatMessagesRef.current) return;
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [chatMessages.length]);

  useEffect(() => {
    if (!error) {
      lastAlertedErrorRef.current = null;
      return;
    }

    if (lastAlertedErrorRef.current === error) {
      return;
    }

    lastAlertedErrorRef.current = error;
    window.alert(error);
  }, [error]);

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

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [roomData, playersData, chatHistory] = await Promise.all([
          gameService.getRoomByCode(roomCode),
          gameService.getRoomPlayers(roomCode),
          gameService.getChatMessages(roomCode),
        ]);
        setRoom(roomData);
        setPlayers(playersData);
        // Use host_id from roomData directly, not from component state
        const hostIdFromRoom = roomData?.host_id || null;
        setChatMessages(
          chatHistory.map((message) => toChatLine(message, hostIdFromRoom))
        );

        // Auto-redirect if game is already playing
        if (roomData?.status === "PLAYING") {
          // Check if current user is a player in the room
          const isUserPlayer = playersData.some((player: any) => player.user_id === user?.id);

          if (!isUserPlayer) {
            // User hasn't joined the room, show notification and redirect to dashboard
            notifyRoomClosedAndRedirect("Phòng chơi đã bắt đầu. Bạn sẽ được chuyển về Dashboard...");
            return;
          }

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

  // Re-map chat messages when hostUserId is available to ensure host highlight is correct
  useEffect(() => {
    if (!hostUserId || chatMessages.length === 0) return;

    setChatMessages((prev) => {
      // Check if any message doesn't have proper isHost flag set yet
      const needsUpdate = prev.some((msg) => {
        const userId = msg.userId;
        const shouldBeHost = !!(hostUserId && userId && String(userId) === String(hostUserId));
        return msg.isHost !== shouldBeHost;
      });

      if (!needsUpdate) return prev;

      // Re-map messages with correct host highlighting
      return prev.map((msg) => {
        const userId = msg.userId;
        const isHost = !!(hostUserId && userId && String(userId) === String(hostUserId));
        return {
          ...msg,
          isHost,
        };
      });
    });
  }, [hostUserId]);

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
            // Check if current user is actually a player in the room
            const playersData = await gameService.getRoomPlayers(roomCode);
            const isUserPlayer = playersData.some((player: any) => player.user_id === user?.id);

            hasRedirectedRef.current = true;
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }

            if (!isUserPlayer) {
              // User hasn't joined, notify and redirect to dashboard
              notifyRoomClosedAndRedirect("Phòng chơi đã bắt đầu. Bạn sẽ được chuyển về Dashboard...");
              return;
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
  }, [roomCode, router, user?.id, notifyRoomClosedAndRedirect]);

  useEffect(() => {
    if (!roomCode || roomClosedMessage) return;

    let cancelled = false;

    const applyRoomState = (data: any) => {
      if (data?.room) {
        setRoom(data.room);
      }

      if (Array.isArray(data?.players)) {
        setPlayers(data.players);
      }
    };

    const handlePlayerJoined = async (data: any) => {
      applyRoomState(data);
      try {
        const refreshed = await gameService.getRoomByCode(roomCode);
        if (refreshed) setRoom(refreshed);
      } catch {
        // ignore refresh errors
      }
    };

    const handlePlayerLeft = async (data: any) => {
      applyRoomState(data);
      try {
        const refreshed = await gameService.getRoomByCode(roomCode);
        if (refreshed) setRoom(refreshed);
      } catch {
        // ignore refresh errors
      }
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

      // Check if current user is a player in the room
      const players = data?.players || [];
      const isCurrentUserPlayer = players.some((player: any) => player.user_id === user?.id);

      if (!isCurrentUserPlayer) {
        // User hasn't joined the room yet, show notification and redirect to dashboard
        notifyRoomClosedAndRedirect("Phòng chơi đã bắt đầu. Bạn sẽ được chuyển về Dashboard...");
        return;
      }

      // Redirect all players to game screen
      setTimeout(() => {
        router.push(`/game/${roomCode}`);
      }, 300);
    };

    const handleRoomClosed = (data: any) => {
      const message = data?.message || "Host đã rời phòng, phòng đã đóng. Bạn sẽ được chuyển về Dashboard...";
      notifyRoomClosedAndRedirect(message);
    };

    const handlePlayerKicked = (data: any) => {
      // Check if current user was kicked
      if (data?.kicked_user_id === user?.id) {
        // Show notification and redirect
        notifyRoomClosedAndRedirect("Bạn đã bị loại khỏi phòng bởi host. Bạn sẽ được chuyển về Dashboard...");
        return;
      }

      // Update players list for other users
      applyRoomState(data);
    };

    const handleChatMessage = (data: any) => {
      if (data?.message) {
        setChatMessages((prev) => {
          const incomingId = typeof data?.id === "string" ? data.id : undefined;

          // Check if this message already exists (prevents duplicates from broadcast)
          if (incomingId && prev.some((msg) => msg.id === incomingId)) {
            return prev;
          }

          // Just append - if this is from current user, it should have been replaced
          // by POST response already. If from others, append it.
          return [
            ...prev,
            toChatLine({
              id: incomingId,
              user_id: data?.user_id,
              user: data?.user,
              message: data.message,
              created_at: data?.created_at,
            }),
          ];
        });
      }
    };

    setIsRealtimeReady(false);

    const connectRealtime = async () => {
      const accessToken = await ensureFreshAccessToken();
      if (cancelled || !accessToken) {
        setIsRealtimeReady(true);
        return;
      }

      wsService.on("PLAYER_JOINED", handlePlayerJoined);
      wsService.on("PLAYER_LEFT", handlePlayerLeft);
      wsService.on("PLAYER_KICKED", handlePlayerKicked);
      wsService.on("GAME_STARTED", handleGameStarted);
      wsService.on("ROOM_CLOSED", handleRoomClosed);
      wsService.on("CHAT_MESSAGE", handleChatMessage);

      wsService.connect(accessToken, roomCode).catch((err) => {
        console.error("Failed to connect websocket:", err);
      }).finally(() => {
        if (!cancelled) {
          setIsRealtimeReady(true);
        }
      });
    };

    void connectRealtime();

    return () => {
      cancelled = true;
      wsService.off("PLAYER_JOINED", handlePlayerJoined);
      wsService.off("PLAYER_LEFT", handlePlayerLeft);
      wsService.off("PLAYER_KICKED", handlePlayerKicked);
      wsService.off("GAME_STARTED", handleGameStarted);
      wsService.off("ROOM_CLOSED", handleRoomClosed);
      wsService.off("CHAT_MESSAGE", handleChatMessage);
      wsService.disconnect();
      setIsRealtimeReady(true);
    };
  }, [roomCode, roomClosedMessage, notifyRoomClosedAndRedirect, router, ensureFreshAccessToken]);

  useEffect(() => {
    if (!roomCode) return;

    const syncTimer = setInterval(async () => {
      try {
        const latest = await gameService.getChatMessages(roomCode);
        const mapped: ChatLine[] = latest.map((message) => toChatLine(message));

        setChatMessages((prev) => mergeChatMessages(prev, mapped));
      } catch {
        // Keep silent: websocket remains primary channel.
      }
    }, 1500);

    return () => {
      clearInterval(syncTimer);
    };
  }, [roomCode, mergeChatMessages, toChatLine]);

  const displayPlayers = useMemo<DisplayPlayer[]>(() => {
    if (players.length === 0) return demoPlayers;

    return players.map((player) => ({
      id: player.id,
      display_name: player.full_name || player.display_name,
      full_name: player.full_name,
      avatar_url: player.avatar_url,
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
    if (!currentUserInRoom || !text || !roomCode) return;

    try {
      setIsSendingChat(true);
      setError(null);

      // Show optimistic message immediately
      const optimisticMessageId = `local-${Date.now()}`;
      const optimisticMessage = {
        id: optimisticMessageId,
        user_id: user?.id,
        user: { id: user?.id, username: user?.username },
        message: text,
        created_at: new Date().toISOString(),
      };

      // Track this optimistic message so we can replace it when server responds
      pendingOptimisticMessageIdRef.current = optimisticMessageId;
      setChatMessages((prev) => mergeChatMessages(prev, [toChatLine(optimisticMessage)]));

      try {
        // Send message to server
        const savedMessage = await gameService.postChatMessage(roomCode, { message: text });

        // Replace optimistic message with real message from server response
        // This way we don't wait for broadcast and avoid duplicates
        setChatMessages((prev) => {
          const index = prev.findIndex((msg) => msg.id === optimisticMessageId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = toChatLine({
              id: savedMessage.id,
              user_id: savedMessage.user_id,
              user: savedMessage.user,
              message: savedMessage.message,
              created_at: savedMessage.created_at,
            });
            pendingOptimisticMessageIdRef.current = null;
            return updated;
          }
          return prev;
        });
      } catch (chatError: any) {
        // If network error (no response), try WebSocket fallback
        if (!chatError?.response) {
          const accessToken = await ensureFreshAccessToken();
          if (accessToken) {
            if (!wsService.isConnected()) {
              await wsService.connect(accessToken, roomCode);
            }
            wsService.emit("CHAT_MESSAGE", { message: text });
          } else {
            throw chatError;
          }
        } else {
          // If HTTP error (with response), remove optimistic message and show error
          setChatMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessageId));
          pendingOptimisticMessageIdRef.current = null;
          throw chatError;
        }
      }
      setChatInput("");
    } catch (err) {
      setError(getErrorMessage(err, "Không gửi được tin nhắn. Vui lòng thử lại."));
      console.error("Failed to send chat:", err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleJoinRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedJoinDisplayName = joinDisplayName.trim();
    if (!normalizedJoinDisplayName) {
      setError("Vui lòng nhập tên hiển thị.");
      return;
    }

    const normalizedTargetName = normalizedJoinDisplayName.toLowerCase();
    const duplicatedName = players.some(
      (player) => player.display_name.trim().toLowerCase() === normalizedTargetName
    );

    if (duplicatedName) {
      const duplicateNameMessage = "tên đã tồn tại trong phòng";
      setError(duplicateNameMessage);
      return;
    }

    try {
      setIsJoining(true);
      setError(null);
      await gameService.joinRoom(displayRoomCode, normalizedJoinDisplayName);
      // Refresh players list after joining
      const updatedPlayers = await gameService.getRoomPlayers(displayRoomCode);
      setPlayers(updatedPlayers);
    } catch (err: any) {
      if (isRoomNotFoundError(err)) {
        notifyRoomClosedAndRedirect("Phòng đã đóng do host rời phòng. Bạn sẽ được chuyển về Dashboard...");
        return;
      }

      // Get error message from backend
      const errorMessage = err?.response?.data?.detail || "Không thể vào phòng. Kiểm tra mã phòng hoặc backend rồi thử lại.";
      setError(errorMessage);
    } finally {
      setIsJoining(false);
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
      router.push(`/game/${displayRoomCode}`);
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

  const handleKickPlayer = async (playerId: string) => {
    const playerToKick = players.find((p) => p.id === playerId);
    if (!playerToKick) return;

    if (!confirm(`Bạn chắc chắn muốn loại ${playerToKick.display_name} khỏi phòng?`)) {
      return;
    }

    try {
      setError(null);
      await gameService.kickPlayer(displayRoomCode, playerToKick.user_id);
      // Refresh players list after kicking
      const updatedPlayers = await gameService.getRoomPlayers(displayRoomCode);
      setPlayers(updatedPlayers);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.detail || "Không thể loại người chơi khỏi phòng.";
      setError(errorMsg);
      console.error("Failed to kick player:", err);
    }
  };

  return (
    <div className="lobby-wrap">
      <div className="lobby-header">
        <div>
          <h1 className="page-title">👥 Sảnh chờ</h1>
          <p className="lobby-subtitle">Chờ mọi người vào đủ rồi bắt đầu!</p>
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

      {!currentUserInRoom && (
        <form className="join-form-card" onSubmit={handleJoinRoom}>
          <div className="join-form-title">📍 Nhập tên để vào phòng</div>
          <div className="join-form-row">
            <input
              className="join-input"
              type="text"
              placeholder="Tên của bạn..."
              value={joinDisplayName}
              onChange={(e) => setJoinDisplayName(e.target.value)}
              disabled={isJoining}
            />
            <button className="join-btn" type="submit" disabled={isJoining}>
              {isJoining ? "Đang vào..." : "Tham gia"}
            </button>
          </div>
        </form>
      )}

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
              <div className={`player-chip${player.isHost ? " host" : ""}`} key={player.id} style={{ position: "relative" }}>
                <div className="player-av" style={{ background: player.avatar_url ? undefined : avatarGradients[index % avatarGradients.length] }}>
                  {player.avatar_url ? (
                    <img src={player.avatar_url} alt="" />
                  ) : (
                    getInitials(player.display_name)
                  )}
                </div>
                <div className="player-name">{player.display_name}</div>
                {player.isHost && <div className="player-badge">👑 Host</div>}
                {isCurrentUserHost && !player.isHost && (
                  <button
                    className="player-kick-btn"
                    onClick={() => handleKickPlayer(player.id)}
                    title="Kick player"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(239, 68, 68, 0.9)",
                      border: "none",
                      color: "white",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                )}
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
            <div className="qp-title">Bộ quiz: &quot;{room?.quiz?.title || "Địa Lý Thế Giới"}&quot;</div>
            <div className="qp-meta">
              <span>📝 {room?.quiz?.question_count || 10} câu hỏi</span>
              <span>⏱ {room?.quiz?.total_duration_formatted || "~5m 30s"}</span>

              <span>🔀 {room?.settings?.shuffle_questions ? "Câu hỏi bị shuffle" : "Câu hỏi không shuffle"}</span>
              {room?.quiz_id && <span>Quiz ID: {room.quiz_id}</span>}
            </div>
          </div>

          {isChatEnabled && (
            <div className="chat-card">
              <div className="chat-title">
                💬 Chat phòng <span className="chat-live">LIVE</span>
              </div>
              <div className="chat-messages" ref={chatMessagesRef}>
                {chatMessages.map((message, index) => (
                  <div
                    className={`chat-msg-row ${message.userId === user?.id ? "me" : "other"}${message.isHost ? " host" : ""}`}
                    key={message.id || `${message.name}-${index}`}
                  >
                    <div className="chat-msg-bubble">
                      <div className="chat-msg-meta">
                        <span className="chat-msg-name">{message.userId === user?.id ? "Bạn" : message.name}</span>
                        {message.isHost && <span className="chat-host-badge">HOST</span>}
                        {message.createdAt && <span className="chat-msg-time">{formatChatTime(message.createdAt)}</span>}
                      </div>
                      <div className="chat-msg-text">{message.text}</div>
                    </div>
                  </div>
                ))}
                {!chatMessages.length && !isLoading && <div className="chat-empty">Chưa có tin nhắn nào.</div>}
              </div>
              <form className="chat-input-row" onSubmit={handleSendChat}>
                <input
                  className="chat-input"
                  placeholder={currentUserInRoom ? "Nhắn gì đó..." : "Bạn phải tham gia để chat"}
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  disabled={isSendingChat || !currentUserInRoom}
                />
                <button className="chat-send" type="submit" disabled={isSendingChat || !currentUserInRoom}>
                  ➤
                </button>
              </form>
              {!currentUserInRoom && (
                <div className="chat-join-hint" style={{ fontSize: 12, marginTop: 8, opacity: 0.85 }}>
                  Bạn chưa tham gia phòng — tham gia để nhắn tin.
                </div>
              )}
            </div>
          )}

          {isCurrentUserHost ? (
            <button className="btn-start" onClick={handleStartGame} disabled={isStarting || isPlaying || isLeaving}>
              {isStarting ? "Đang bắt đầu..." : isPlaying ? "Đang chơi" : `🚀 Bắt đầu game! (${displayPlayers.length} người)`}
            </button>
          ) : (
            <button className="btn-start" disabled>
              <span className="waiting-hourglass" aria-hidden="true">⌛</span> Chờ host bắt đầu game
            </button>
          )}
          <button className="btn-leave" onClick={handleLeaveRoom} disabled={isLeaving}>
            {isLeaving ? "Đang rời phòng..." : "↩ Rời phòng"}
          </button>
        </aside>
      </div>
    </div>
  );
}
