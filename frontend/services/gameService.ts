import apiClient from "./api";
import {
  GameRoom,
  RoomPlayer,
  GameResult,
  ChatMessage,
  RoomStateResponse,
} from "@/types";

export interface CreateRoomPayload {
  quiz_id: string;
  max_players?: number;
  shuffle_questions?: boolean;
  chat_enabled?: boolean;
}

export interface SubmitAnswerPayload {
  selected_option_id: string;
  response_time: number;
}

export interface PostChatPayload {
  message: string;
}

export const gameService = {
  // Create game room
  createRoom: async (data: CreateRoomPayload): Promise<GameRoom> => {
    const response = await apiClient.post<GameRoom>("/rooms", data);
    return response.data;
  },

  // Get room details by code with players, quiz preview, and settings
  getRoomByCode: async (roomCode: string): Promise<any> => {
    const response = await apiClient.get<any>(`/rooms/${roomCode}`);
    return response.data;
  },

  // Get full room state for gameplay refresh
  getRoomState: async (roomCode: string): Promise<RoomStateResponse> => {
    const response = await apiClient.get<RoomStateResponse>(`/rooms/${roomCode}/state`);
    return response.data;
  },

  // Join room
  joinRoom: async (
    roomCode: string,
    displayName: string,
  ): Promise<RoomPlayer> => {
    const response = await apiClient.post<RoomPlayer>(`/rooms/${roomCode}/join`, {
      display_name: displayName,
    });
    return response.data;
  },

  // Leave room
  leaveRoom: async (roomCode: string): Promise<void> => {
    await apiClient.post(`/rooms/${roomCode}/leave`, {});
  },

  // Get room players
  getRoomPlayers: async (roomCode: string): Promise<RoomPlayer[]> => {
    const response = await apiClient.get<RoomPlayer[]>(`/rooms/${roomCode}/players`);
    return response.data;
  },

  // Start game
  startGame: async (roomCode: string): Promise<GameRoom> => {
    const response = await apiClient.post<GameRoom>(`/rooms/${roomCode}/start`, {});
    return response.data;
  },

  // Submit answer
  submitAnswer: async (
    roomCode: string,
    payload: SubmitAnswerPayload,
  ): Promise<any> => {
    const response = await apiClient.post<any>(`/rooms/${roomCode}/answers`, payload);
    return response.data;
  },

  // Move to next question
  nextQuestion: async (roomCode: string): Promise<any> => {
    const response = await apiClient.post<any>(`/rooms/${roomCode}/next-question`, {});
    return response.data;
  },

  // Finish game
  finishGame: async (roomCode: string): Promise<any> => {
    const response = await apiClient.post<any>(`/rooms/${roomCode}/finish`, {});
    return response.data;
  },

  // Get game results
  getGameResults: async (roomCode: string): Promise<GameResult[]> => {
    const response = await apiClient.get<GameResult[]>(`/rooms/${roomCode}/results`);
    return response.data;
  },

  // Get room leaderboard
  getLeaderboard: async (roomCode: string): Promise<any> => {
    const response = await apiClient.get<any>(`/rooms/${roomCode}/leaderboard`);
    return response.data;
  },

  // Get chat messages
  getChatMessages: async (roomCode: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/rooms/${roomCode}/chat`);
    return response.data;
  },

  // Post chat message
  postChatMessage: async (
    roomCode: string,
    payload: PostChatPayload,
  ): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatMessage>(`/rooms/${roomCode}/chat`, payload);
    return response.data;
  },

  // Kick player from room
  kickPlayer: async (roomCode: string, userId: string): Promise<any> => {
    const response = await apiClient.post<any>(`/rooms/${roomCode}/kick/${userId}`, {});
    return response.data;
  },
};
