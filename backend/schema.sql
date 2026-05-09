-- Quiz Battle Database Schema
-- Organized by feature domains: Auth, Quiz Management, Game Play, Real-time Chat, User Stats
-- All UUIDs are generated at application layer using uuid4()

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DOMAIN 1: AUTHENTICATION & USER MANAGEMENT
-- ============================================================
-- Purpose: Store user credentials and refresh tokens
-- Lifecycle: User registration → Token management → Session expiry

CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN 2: QUIZ CONTENT MANAGEMENT
-- ============================================================
-- Purpose: Store reusable quiz templates and questions
-- Lifecycle: Create quiz → Add questions → Configure answer options → Use in game room

CREATE TABLE quizzes (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE questions (
    id UUID PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL,
    time_limit INT,
    points INT DEFAULT 100,
    order_index INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE answer_options (
    id UUID PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN 3: GAME PLAY MANAGEMENT
-- ============================================================
-- Purpose: Manage game sessions, player participation, and real-time interactions
-- Lifecycle: Room creation → Player join → Question sequence → Answer submission → End game

-- Game room: Container for a multiplayer game session
CREATE TABLE game_rooms (
    id UUID PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id UUID REFERENCES users(id) ON DELETE SET NULL,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',  -- WAITING, PLAYING, FINISHED
    max_players INT NOT NULL DEFAULT 30,
    shuffle_questions BOOLEAN NOT NULL DEFAULT TRUE,
    chat_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    current_question_order INT DEFAULT 1,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Room players: Link between user and room (join relationship)
CREATE TABLE room_players (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    score INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (room_id, user_id)
);

-- Game questions: Sequence of questions in a specific game room
CREATE TABLE game_questions (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (room_id, question_order)
);

-- Player answers: Individual answer submissions during game play
CREATE TABLE player_answers (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES answer_options(id),
    is_correct BOOLEAN,
    response_time FLOAT,  -- milliseconds
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (room_id, user_id, question_id)
);

-- Game results: Final scores and rankings after game completion
CREATE TABLE game_results (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    final_score INT,
    rank INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (room_id, user_id)
);

-- Chat messages: In-game chat during multiplayer sessions
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DOMAIN 4: USER STATISTICS & ANALYTICS
-- ============================================================
-- Purpose: Cache aggregated player statistics for quick retrieval
-- Note: Denormalized data - updated after each game completion

CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_games INT DEFAULT 0,
    total_score INT DEFAULT 0,
    avg_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES (Query performance optimization)
-- ============================================================

-- Authentication lookups
CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

-- Quiz content queries
CREATE INDEX idx_questions_quiz_id ON questions (quiz_id);
CREATE INDEX idx_answer_options_question_id ON answer_options (question_id);

-- Game room lookups
CREATE INDEX idx_game_rooms_room_code ON game_rooms (room_code);
CREATE INDEX idx_game_rooms_host_id ON game_rooms (host_id);
CREATE INDEX idx_game_rooms_quiz_id ON game_rooms (quiz_id);

-- Player participation queries
CREATE INDEX idx_room_players_room_id ON room_players (room_id);
CREATE INDEX idx_room_players_user_id ON room_players (user_id);

-- Game question sequence queries
CREATE INDEX idx_game_questions_room_id ON game_questions (room_id);
CREATE INDEX idx_game_questions_question_id ON game_questions (question_id);

-- Player answer submission queries
CREATE INDEX idx_player_answers_room_id ON player_answers (room_id);
CREATE INDEX idx_player_answers_user_id ON player_answers (user_id);
CREATE INDEX idx_player_answers_question_id ON player_answers (question_id);
CREATE INDEX idx_player_answers_selected_option_id ON player_answers (selected_option_id);

-- Game results queries
CREATE INDEX idx_game_results_room_id ON game_results (room_id);
CREATE INDEX idx_game_results_user_id ON game_results (user_id);

-- Chat message queries
CREATE INDEX idx_chat_messages_room_id ON chat_messages (room_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages (user_id);
