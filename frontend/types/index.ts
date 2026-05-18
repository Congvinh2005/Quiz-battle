// Auth Types
export interface User {
  id: string;
  username: string;
  full_name?: string | null;
  email: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  full_name?: string | null;
  email: string;
  password: string;
}

// Quiz Types
export type QuestionType = "MCQ" | "TRUE_FALSE";

export interface Question {
  id: string;
  quiz_id: string;
  content: string;
  question_type: QuestionType;
  time_limit: number;
  points: number;
  order_index: number;
  created_at: string;
  answer_options: AnswerOption[];
}

export interface AnswerOption {
  id: string;
  question_id: string;
  content: string;
  is_correct: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  is_public: boolean;
  created_at: string;
  questions?: Question[];
  question_count?: number;
  total_duration_seconds?: number;
}

// Game Types
export type GameStatus = "WAITING" | "PLAYING" | "FINISHED";

export interface QuizPreview {
  id: string;
  title: string;
  description?: string;
  question_count: number;
  total_duration_seconds: number;
  total_duration_formatted: string;
  created_by?: string;
}

export interface RoomSettings {
  max_players: number;
  shuffle_questions: boolean;
  chat_enabled: boolean;
  current_question_order: number;
}

export interface GameRoom {
  id: string;
  room_code: string;
  host_id: string;
  quiz_id: string;
  status: GameStatus;
  created_at: string;
  started_at?: string;
  ended_at?: string;
  quiz?: QuizPreview;
  settings?: RoomSettings;
  players?: RoomPlayer[];
  player_count?: number;
}

export interface GameStateSnapshot {
  status: GameStatus;
  current_question_order: number;
  current_question: Question | null;
  total_questions: number;
  leaderboard: Array<{
    rank: number;
    user_id: string;
    display_name: string;
    score: number;
  }>;
}

export interface RoomStateResponse {
  room: GameRoom;
  quiz: QuizPreview;
  players: RoomPlayer[];
  player_count: number;
  settings: RoomSettings;
  game_state: GameStateSnapshot;
}

export interface RoomPlayer {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  full_name?: string | null;
  avatar_url?: string | null;
  score: number;
  joined_at: string;
}

export interface GameQuestion {
  id: string;
  room_id: string;
  question_id: string;
  question_order: number;
}

export interface PlayerAnswer {
  id: string;
  room_id: string;
  user_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  response_time: number;
  answered_at: string;
}

export interface GameResult {
  id: string;
  room_id: string;
  user_id: string;
  display_name?: string;
  final_score: number;
  rank: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user?: User;
}

// User Stats
export interface UserStats {
  user_id: string;
  total_games: number;
  total_score: number;
  avg_score: number;
  updated_at: string;
}

// WebSocket Events
export interface WSGameState {
  current_question: Question;
  question_number: number;
  total_questions: number;
  time_remaining: number;
  players_online: RoomPlayer[];
  leaderboard: Array<{
    rank: number;
    user_id: string;
    display_name: string;
    score: number;
  }>;
}

export interface WSPlayerAnswer {
  user_id: string;
  question_id: string;
  selected_option_id: string;
  response_time: number;
}

export interface WSRoomEvent {
  type:
    | "PLAYER_JOINED"
    | "PLAYER_LEFT"
    | "ROOM_CLOSED"
    | "GAME_STARTED"
    | "QUESTION_CHANGED"
    | "ANSWER_SUBMITTED"
    | "GAME_ENDED"
    | "CHAT_MESSAGE"
    | "PLAYER_ANSWERED";
  data: any;
}
