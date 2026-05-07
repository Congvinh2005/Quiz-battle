-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =======================
-- USERS & AUTH
-- =======================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =======================
-- QUIZ
-- =======================

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    question_type VARCHAR(20) CHECK (question_type IN ('MCQ', 'TRUE_FALSE')),
    time_limit INT,
    points INT DEFAULT 100,
    order_index INT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE answer_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);

-- =======================
-- GAME
-- =======================

CREATE TABLE game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id UUID REFERENCES users(id) ON DELETE SET NULL,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    status VARCHAR(20) CHECK (status IN ('WAITING', 'PLAYING', 'FINISHED')),
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE TABLE room_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    score INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (room_id, user_id) -- tránh join 2 lần
);

CREATE TABLE game_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    question_order INT,
    UNIQUE (room_id, question_order)
);

CREATE TABLE player_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES answer_options(id),
    is_correct BOOLEAN,
    response_time FLOAT,
    answered_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (room_id, user_id, question_id) -- mỗi câu trả lời 1 lần
);

CREATE TABLE game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    final_score INT,
    rank INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (room_id, user_id)
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =======================
-- USER STATS
-- =======================

CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_games INT DEFAULT 0,
    total_score INT DEFAULT 0,
    avg_score FLOAT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

