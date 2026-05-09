import apiClient from "./api";
import { GameRoom, RoomPlayer, GameResult, ChatMessage } from "@/types";

export interface CreateRoomPayload {
  quiz_id: string;
  max_players?: number;
  shuffle_questions?: boolean;
  chat_enabled?: boolean;
}

export const gameService = {
  // Create game room
  createRoom: async (data: CreateRoomPayload): Promise<GameRoom> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await apiClient.post<GameRoom>("/rooms", data, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  // Get room details by code with players, quiz preview, and settings
  getRoomByCode: async (roomCode: string): Promise<any> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await apiClient.get<any>(`/rooms/${roomCode}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  // Join room
  joinRoom: async (roomCode: string, displayName: string): Promise<RoomPlayer> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await apiClient.post<RoomPlayer>(`/rooms/${roomCode}/join`, {
      display_name: displayName,
    }, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  // Leave room
  leaveRoom: async (roomCode: string): Promise<void> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    await apiClient.post(`/rooms/${roomCode}/leave`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // Get room players
  getRoomPlayers: async (roomCode: string): Promise<RoomPlayer[]> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await apiClient.get<RoomPlayer[]>(`/rooms/${roomCode}/players`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  // Start game
  startGame: async (roomCode: string): Promise<GameRoom> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await apiClient.post<GameRoom>(`/rooms/${roomCode}/start`, {}, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  // Get game results
  getGameResults: async (roomCode: string): Promise<GameResult[]> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await apiClient.get<GameResult[]>(`/rooms/${roomCode}/results`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  // Get chat messages
  getChatMessages: async (roomCode: string): Promise<ChatMessage[]> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const response = await apiClient.get<ChatMessage[]>(`/rooms/${roomCode}/chat`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },
};
