-- Schema generated to match SQLAlchemy models in backend/app/models
-- UUID defaults are handled by the application layer (uuid4)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =======================
-- USERS & AUTH
-- =======================

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
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =======================
-- QUIZ
-- =======================

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

-- =======================
-- GAME
-- =======================

CREATE TABLE game_rooms (
    id UUID PRIMARY KEY,
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id UUID REFERENCES users(id) ON DELETE SET NULL,
    quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

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

CREATE TABLE game_questions (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    question_order INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (room_id, question_order)
);

CREATE TABLE player_answers (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES answer_options(id),
    is_correct BOOLEAN,
    response_time FLOAT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (room_id, user_id, question_id)
);

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

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =======================
-- USER STATS
-- =======================

CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_games INT DEFAULT 0,
    total_score INT DEFAULT 0,
    avg_score FLOAT DEFAULT 0.0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =======================
-- Indexes (matching SQLAlchemy index=True)
-- =======================

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);

CREATE INDEX idx_questions_quiz_id ON questions (quiz_id);
CREATE INDEX idx_answer_options_question_id ON answer_options (question_id);

CREATE INDEX idx_game_rooms_room_code ON game_rooms (room_code);
CREATE INDEX idx_game_rooms_host_id ON game_rooms (host_id);
CREATE INDEX idx_game_rooms_quiz_id ON game_rooms (quiz_id);

CREATE INDEX idx_room_players_room_id ON room_players (room_id);
CREATE INDEX idx_room_players_user_id ON room_players (user_id);

CREATE INDEX idx_game_questions_room_id ON game_questions (room_id);
CREATE INDEX idx_game_questions_question_id ON game_questions (question_id);

CREATE INDEX idx_player_answers_room_id ON player_answers (room_id);
CREATE INDEX idx_player_answers_user_id ON player_answers (user_id);
CREATE INDEX idx_player_answers_question_id ON player_answers (question_id);
CREATE INDEX idx_player_answers_selected_option_id ON player_answers (selected_option_id);

CREATE INDEX idx_game_results_room_id ON game_results (room_id);
CREATE INDEX idx_game_results_user_id ON game_results (user_id);

CREATE INDEX idx_chat_messages_room_id ON chat_messages (room_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages (user_id);
