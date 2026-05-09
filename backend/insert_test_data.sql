-- ============================================================
-- TEST DATA INSERT SCRIPT FOR QUIZ BATTLE
-- ============================================================
-- Paste this entire script into pgAdmin Query Editor and Execute
-- Thay đổi các UUID nếu cần thiết

-- ============================================================
-- 1. QUIZZES (1 quiz)
-- ============================================================
INSERT INTO quizzes (id, title, description, created_by, is_public, created_at, updated_at)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    'GKN về Lập Trình Python',
    'Quiz về các kiến thức cơ bản lập trình Python - Phần 1',
    (SELECT id FROM users WHERE username = 'anthai' LIMIT 1),
    true,
    NOW(),
    NOW()
);

-- ============================================================
-- 2. QUESTIONS (4 câu hỏi)
-- ============================================================
INSERT INTO questions (id, quiz_id, content, question_type, time_limit, points, order_index, created_at, updated_at)
VALUES 
    (
        '550e8400-e29b-41d4-a716-446655440001'::uuid,
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
        'Python là ngôn ngữ lập trình gì?',
        'MCQ',
        30,
        100,
        1,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655440002'::uuid,
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
        'Biến trong Python phải được khai báo kiểu trước không?',
        'MCQ',
        20,
        100,
        2,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655440003'::uuid,
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
        'Cách nào để lặp qua từng phần tử trong list?',
        'MCQ',
        25,
        100,
        3,
        NOW(),
        NOW()
    ),
    (
        '550e8400-e29b-41d4-a716-446655440004'::uuid,
        'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
        'Hàm nào dùng để lấy độ dài của một list?',
        'MCQ',
        15,
        100,
        4,
        NOW(),
        NOW()
    );

-- ============================================================
-- 3. ANSWER OPTIONS (4 lựa chọn cho mỗi câu)
-- ============================================================
-- Câu 1: Python là ngôn ngữ gì?
INSERT INTO answer_options (id, question_id, content, is_correct, created_at, updated_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Biên dịch', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Thông dịch', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Hộp đen', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Quản lý bộ nhớ', false, NOW(), NOW());

-- Câu 2: Biến có cần khai báo kiểu không?
INSERT INTO answer_options (id, question_id, content, is_correct, created_at, updated_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Có, bắt buộc', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Không, Python tự động', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440007'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Tùy chọn', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440008'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Phụ thuộc vào phiên bản', false, NOW(), NOW());

-- Câu 3: Cách lặp qua list?
INSERT INTO answer_options (id, question_id, content, is_correct, created_at, updated_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440009'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'for item in list:', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440010'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'foreach item in list:', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440011'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'while item in list:', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440012'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'loop item in list:', false, NOW(), NOW());

-- Câu 4: Hàm lấy độ dài?
INSERT INTO answer_options (id, question_id, content, is_correct, created_at, updated_at)
VALUES 
    ('660e8400-e29b-41d4-a716-446655440013'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'len()', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440014'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'size()', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440015'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'count()', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440016'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'length()', false, NOW(), NOW());

-- ============================================================
-- 4. GAME ROOMS (1 phòng, anthai là host)
-- ============================================================
INSERT INTO game_rooms (id, room_code, host_id, quiz_id, status, max_players, shuffle_questions, chat_enabled, current_question_order, started_at, ended_at, created_at, updated_at)
VALUES (
    '770e8400-e29b-41d4-a716-446655440001'::uuid,
    'ABC123',
    (SELECT id FROM users WHERE username = 'anthai' LIMIT 1),
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::uuid,
    'WAITING',
    30,
    true,
    true,
    1,
    NULL,
    NULL,
    NOW(),
    NOW()
);

-- ============================================================
-- 5. ROOM PLAYERS (anthai + 2 test players)
-- ============================================================
-- Thêm anthai vào room
INSERT INTO room_players (id, room_id, user_id, display_name, score, created_at, updated_at)
VALUES (
    '880e8400-e29b-41d4-a716-446655440001'::uuid,
    '770e8400-e29b-41d4-a716-446655440001'::uuid,
    (SELECT id FROM users WHERE username = 'anthai' LIMIT 1),
    'anthai (Host)',
    0,
    NOW(),
    NOW()
);

-- Tạo 2 user test (nếu chưa tồn tại)
INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
VALUES 
    (
        '990e8400-e29b-41d4-a716-446655440001'::uuid,
        'player1_test',
        'player1@test.com',
        'hashed_password_here',
        NOW(),
        NOW()
    ),
    (
        '990e8400-e29b-41d4-a716-446655440002'::uuid,
        'player2_test',
        'player2@test.com',
        'hashed_password_here',
        NOW(),
        NOW()
    )
ON CONFLICT (username) DO NOTHING;

-- Thêm 2 players vào room
INSERT INTO room_players (id, room_id, user_id, display_name, score, created_at, updated_at)
VALUES 
    (
        '880e8400-e29b-41d4-a716-446655440002'::uuid,
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        (SELECT id FROM users WHERE username = 'player1_test' LIMIT 1),
        'Player 1',
        0,
        NOW(),
        NOW()
    ),
    (
        '880e8400-e29b-41d4-a716-446655440003'::uuid,
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        (SELECT id FROM users WHERE username = 'player2_test' LIMIT 1),
        'Player 2',
        0,
        NOW(),
        NOW()
    )
ON CONFLICT (room_id, user_id) DO NOTHING;

-- ============================================================
-- 6. GAME QUESTIONS (Thêm 4 câu vào room)
-- ============================================================
INSERT INTO game_questions (id, room_id, question_id, question_order, created_at, updated_at)
VALUES 
    ('aa0e8400-e29b-41d4-a716-446655440001'::uuid, '770e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 1, NOW(), NOW()),
    ('aa0e8400-e29b-41d4-a716-446655440002'::uuid, '770e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 2, NOW(), NOW()),
    ('aa0e8400-e29b-41d4-a716-446655440003'::uuid, '770e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 3, NOW(), NOW()),
    ('aa0e8400-e29b-41d4-a716-446655440004'::uuid, '770e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 4, NOW(), NOW());

-- ============================================================
-- 7. PLAYER ANSWERS (anthai trả lời câu 1 và 2)
-- ============================================================
INSERT INTO player_answers (id, room_id, user_id, question_id, selected_option_id, is_correct, response_time, created_at, updated_at)
VALUES 
    (
        'bb0e8400-e29b-41d4-a716-446655440001'::uuid,
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        (SELECT id FROM users WHERE username = 'anthai' LIMIT 1),
        '550e8400-e29b-41d4-a716-446655440001'::uuid,
        '660e8400-e29b-41d4-a716-446655440002'::uuid,
        true,
        5000,
        NOW(),
        NOW()
    ),
    (
        'bb0e8400-e29b-41d4-a716-446655440002'::uuid,
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        (SELECT id FROM users WHERE username = 'anthai' LIMIT 1),
        '550e8400-e29b-41d4-a716-446655440002'::uuid,
        '660e8400-e29b-41d4-a716-446655440006'::uuid,
        true,
        3000,
        NOW(),
        NOW()
    );

-- ============================================================
-- 8. GAME RESULTS (Nếu game đã kết thúc)
-- ============================================================
-- Bỏ qua hiện tại vì game còn ở trạng thái WAITING

-- ============================================================
-- 9. CHAT MESSAGES (Vài tin nhắn test)
-- ============================================================
INSERT INTO chat_messages (id, room_id, user_id, message, created_at, updated_at)
VALUES 
    (
        'cc0e8400-e29b-41d4-a716-446655440001'::uuid,
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        (SELECT id FROM users WHERE username = 'anthai' LIMIT 1),
        'Chào mọi người! Bắt đầu chơi thôi',
        NOW() - INTERVAL '10 minutes',
        NOW() - INTERVAL '10 minutes'
    ),
    (
        'cc0e8400-e29b-41d4-a716-446655440002'::uuid,
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        (SELECT id FROM users WHERE username = 'player1_test' LIMIT 1),
        'Sẵn sàng rồi!',
        NOW() - INTERVAL '8 minutes',
        NOW() - INTERVAL '8 minutes'
    ),
    (
        'cc0e8400-e29b-41d4-a716-446655440003'::uuid,
        '770e8400-e29b-41d4-a716-446655440001'::uuid,
        (SELECT id FROM users WHERE username = 'player2_test' LIMIT 1),
        'Tôi cũng sẵn sàng!',
        NOW() - INTERVAL '7 minutes',
        NOW() - INTERVAL '7 minutes'
    );

-- ============================================================
-- 10. USER STATS (Khởi tạo stats cho các players)
-- ============================================================
INSERT INTO user_stats (user_id, total_games, total_score, avg_score, created_at, updated_at)
SELECT u.id, 0, 0, 0, NOW(), NOW()
FROM users u
WHERE u.username IN ('anthai', 'player1_test', 'player2_test')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- SUMMARY
-- ============================================================
-- ✅ Đã tạo:
-- - 1 Quiz: "GKN về Lập Trình Python"
-- - 4 Questions với 4 answer options mỗi câu
-- - 1 Game Room với code "ABC123" (status: WAITING)
-- - 3 Players (anthai + 2 test players)
-- - 4 Game Questions
-- - 2 Player Answers từ anthai
-- - 3 Chat Messages
--
-- 🎮 Để kiểm tra dữ liệu, chạy:
-- SELECT * FROM quizzes;
-- SELECT * FROM game_rooms WHERE room_code = 'ABC123';
-- SELECT * FROM room_players WHERE room_id = (SELECT id FROM game_rooms WHERE room_code = 'ABC123');
-- SELECT * FROM chat_messages WHERE room_id = (SELECT id FROM game_rooms WHERE room_code = 'ABC123');
