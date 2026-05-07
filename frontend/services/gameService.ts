import apiClient from "./api";
import { GameRoom, RoomPlayer, GameResult, ChatMessage } from "@/types";

export const gameService = {
  // Create game room
  createRoom: async (data: { quiz_id: string }): Promise<GameRoom> => {
    const response = await apiClient.post<GameRoom>("/rooms", data);
    return response.data;
  },

  // Get room by code
  getRoomByCode: async (roomCode: string): Promise<GameRoom> => {
    const response = await apiClient.get<GameRoom>(`/rooms/${roomCode}`);
    return response.data;
  },

  // Join room
  joinRoom: async (roomCode: string, displayName: string): Promise<RoomPlayer> => {
    const response = await apiClient.post<RoomPlayer>(`/rooms/${roomCode}/join`, {
      display_name: displayName,
    });
    return response.data;
  },

  // Leave room
  leaveRoom: async (roomCode: string): Promise<void> => {
    await apiClient.post(`/rooms/${roomCode}/leave`);
  },

  // Get room players
  getRoomPlayers: async (roomCode: string): Promise<RoomPlayer[]> => {
    const response = await apiClient.get<RoomPlayer[]>(`/rooms/${roomCode}/players`);
    return response.data;
  },

  // Start game
  startGame: async (roomCode: string): Promise<GameRoom> => {
    const response = await apiClient.post<GameRoom>(`/rooms/${roomCode}/start`);
    return response.data;
  },

  // Get game results
  getGameResults: async (roomCode: string): Promise<GameResult[]> => {
    const response = await apiClient.get<GameResult[]>(`/rooms/${roomCode}/results`);
    return response.data;
  },

  // Get chat messages
  getChatMessages: async (roomCode: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/rooms/${roomCode}/chat`);
    return response.data;
  },
};
