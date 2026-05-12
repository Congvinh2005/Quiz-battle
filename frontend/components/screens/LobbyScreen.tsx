"use client";

import React from "react";
import { useEffect, useState } from "react";
import { gameService } from "@/services/gameService";
import { GameRoom, RoomPlayer } from "@/types";

interface LobbyScreenProps {
  roomCode: string;
}

export default function LobbyScreen({ roomCode }: LobbyScreenProps) {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setIsLoading(true);
        const [roomData, playersData] = await Promise.all([
          gameService.getRoomByCode(roomCode),
          gameService.getRoomPlayers(roomCode),
        ]);
        setRoom(roomData);
        setPlayers(playersData);
      } catch (err) {
        setError("Không tải được dữ liệu phòng.");
      } finally {
        setIsLoading(false);
      }
    };

    if (roomCode) {
      loadRoom();
    }
  }, [roomCode]);

  const handleStartGame = async () => {
    try {
      setIsStarting(true);
      setError(null);
      const updatedRoom = await gameService.startGame(roomCode);
      setRoom(updatedRoom);
    } catch (err) {
      setError("Không thể bắt đầu trò chơi.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div className="bg-dark-surface2 border border-border-light rounded-2xl p-6">
          <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Room Code</div>
          <div className="font-jetbrains-mono text-4xl font-bold tracking-wider">{roomCode}</div>
          <div className="text-xs opacity-70 mt-1">Chia sẻ mã này cho bạn bè</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-dark-surface2 border border-border-light rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne text-sm font-bold">
              Người chơi <span className="text-brand-primary-light">{players.length}</span>
            </h2>
            <div className="text-xs text-text-muted flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              {room?.status === "PLAYING" ? "Đang chơi" : "Đang chờ người chơi..."}
            </div>
          </div>
          {isLoading ? (
            <p className="text-text-muted text-sm">Đang tải phòng...</p>
          ) : error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : players.length === 0 ? (
            <p className="text-text-muted text-sm">Chưa có người chơi nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {players.map((player) => (
                <div key={player.id} className="rounded-2xl border border-border-light bg-dark-surface p-4">
                  <div className="font-semibold">{player.display_name}</div>
                  <div className="text-xs text-text-muted mt-1">Điểm: {player.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-dark-surface2 border border-border-light rounded-3xl p-5">
            <div className="text-xs font-bold mb-3">Quiz Preview</div>
            <p className="text-text-muted text-sm">Quiz ID: {room?.quiz_id || "-"}</p>
          </div>

          <div className="bg-dark-surface2 border border-border-light rounded-3xl p-4 flex-1">
            <div className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <span>💬</span> Chat
              <span className="text-xs bg-brand-green text-white px-2 py-0.5 rounded-full">Live</span>
            </div>
            <div className="text-text-muted text-sm">Chat sẽ được nối sau khi có websocket thật.</div>
          </div>

          <button
            onClick={handleStartGame}
            disabled={isStarting || room?.status === "PLAYING"}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-light text-white font-semibold text-sm cursor-pointer transition-all disabled:opacity-50"
          >
            {isStarting ? "Đang bắt đầu..." : room?.status === "PLAYING" ? "Đang chơi" : "Bắt đầu trò chơi"}
          </button>
        </div>
      </div>
    </div>
  );
}
