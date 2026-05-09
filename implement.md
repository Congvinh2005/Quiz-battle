# IMPLEMENT PLAN - DÙNG DỮ LIỆU THẬT CHO CÁC MÀN HÌNH QUIZBATTLE

## Mục tiêu

Hiện tại frontend đã có giao diện cho Dashboard, Editor, Create Room, Lobby, Gameplay và Result, nhưng nhiều màn hình đang dùng dữ liệu demo/fallback. Để các màn hình thao tác dữ liệu thật từ DB, cần hoàn thiện luồng sau:

1. FE gọi API thật.
2. BE validate request, xử lý nghiệp vụ, ghi/đọc DB.
3. BE phát realtime event qua WebSocket khi room/game thay đổi.
4. FE lắng nghe event và cập nhật UI ngay lập tức.

---

# Kiến trúc đề xuất

* Backend: FastAPI + SQLAlchemy + PostgreSQL.
* Realtime: nên dùng 1 cách duy nhất.

  * Cách đơn giản: FastAPI native WebSocket tại `/ws/game/{room_code}`.
  * Nếu dùng frontend `socket.io-client` hiện tại thì backend phải chạy Socket.IO server tương ứng. FastAPI WebSocket native không tương thích trực tiếp với socket.io-client.

Khuyến nghị:

* Dùng FastAPI native WebSocket.
* Sửa `frontend/services/websocketService.ts` sang `new WebSocket(...)`.

---

# Tình trạng hiện tại

DB đã có các bảng chính:

* `users`, `refresh_tokens`
* `quizzes`, `questions`, `answer_options`
* `game_rooms`, `room_players`, `game_questions`, `player_answers`, `game_results`, `chat_messages`
* `user_stats`

API hiện có nhưng còn thiếu:

* `GET /quizzes`: mới trả quiz, chưa trả questions/options/count.
* `GET /quizzes/{id}`: mới trả quiz, chưa trả questions/options.
* `POST /quizzes`: mới tạo quiz title/description/is_public, chưa tạo questions/options.
* Chưa có `PUT /quizzes/{id}`, `DELETE /quizzes/{id}`.
* Chưa có API riêng cho questions/options hoàn chỉnh.
* `POST /rooms`: tạo room nhưng chưa lưu settings, chưa auto add host vào `room_players`.
* `POST /rooms/{code}/start`: chỉ đổi status, chưa tạo `game_questions`, chưa set câu hỏi hiện tại, chưa broadcast.
* `GET /rooms/{code}/results`: mới tính tạm từ `room_players`, chưa dùng `game_results`.
* `GET /rooms/{code}/chat`: đang return empty.
* Chưa có API submit answer, next question, finish game.

---

# PHẦN 1 - BỔ SUNG DB/MIGRATION

## 1. Thêm room settings vào `game_rooms`

```sql
ALTER TABLE game_rooms
ADD COLUMN max_players INT NOT NULL DEFAULT 30,
ADD COLUMN allow_late_join BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN shuffle_questions BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN chat_enabled BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN current_question_order INT DEFAULT 1;
```

## 2. Thêm metadata quiz nếu cần

```sql
ALTER TABLE quizzes
ADD COLUMN category VARCHAR(100),
ADD COLUMN difficulty VARCHAR(30) DEFAULT 'MEDIUM',
ADD COLUMN play_count INT NOT NULL DEFAULT 0,
ADD COLUMN rating FLOAT DEFAULT 0;
```

## 3. Chuẩn hóa timestamp

Tất cả serializer nên trả:

* `created_at`
* `updated_at`

---

# PHẦN 2 - API AUTH/USER

Đã có:

* `POST /auth/register`
* `POST /auth/login`
* `GET /auth/me`
* `POST /auth/refresh`
* `POST /auth/logout`

## Cần thêm:

### GET /users/me/stats

```json
{
  "user_id": "...",
  "total_games": 24,
  "total_score": 188160,
  "avg_score": 7840,
  "wins": 8,
  "public_quizzes": 3,
  "streak_days": 5
}
```

---

# PHẦN 3 - API QUIZ/EDITOR

## GET /quizzes

Support:

* `mine=true`
* `public=true`
* `include_questions=true`

Ví dụ:

* `GET /quizzes?mine=true`
* `GET /quizzes?public=true&limit=20`
* `GET /quizzes?mine=true&include_counts=true`

## GET /quizzes/{quiz_id}

Trả quiz đầy đủ gồm:

* questions
* answer_options
* question_type
* time_limit
* points

## POST /quizzes

Validate:

* title không rỗng
* ít nhất 1 question
* MCQ có 2-4 options
* đúng đúng 1 answer correct
* points > 0

DB transaction:

* tạo quiz
* tạo questions
* tạo answer_options
* rollback nếu lỗi

## PUT /quizzes/{quiz_id}

Giai đoạn đầu:

* xóa questions/options cũ
* tạo lại toàn bộ

## DELETE /quizzes/{quiz_id}

Chỉ owner được xóa.

## POST /quizzes/{quiz_id}/duplicate

Copy quiz public về quiz của user.

---

# PHẦN 4 - API DASHBOARD

## GET /dashboard

Trả:

* stats
* my_quizzes
* public_quizzes
* recent_activities

---

# PHẦN 5 - API CREATE ROOM/LOBBY

## POST /rooms

BE cần:

* validate quiz
* validate quyền
* validate questions/options
* tạo room_code unique
* auto add host

## GET /rooms/{room_code}

Trả:

* room info
* quiz preview
* players
* settings

## POST /rooms/{room_code}/join

Rules:

* reject nếu room full
* reject nếu playing và không cho late join
* broadcast PLAYER_JOINED

## POST /rooms/{room_code}/leave

* broadcast PLAYER_LEFT
* transfer host hoặc close room nếu host leave

## POST /rooms/{room_code}/start

Chỉ host được start.

BE cần:

* tạo game_questions
* set current_question_order
* broadcast GAME_STARTED
* broadcast QUESTION_CHANGED

---

# PHẦN 6 - API GAMEPLAY

## GET /rooms/{room_code}/state

Dùng khi refresh trang game.

## POST /rooms/{room_code}/answers

BE cần:

* validate room
* validate player
* validate current question
* tính điểm
* insert player_answers
* update score
* broadcast leaderboard

## POST /rooms/{room_code}/next-question

* chuyển câu tiếp theo
* broadcast QUESTION_CHANGED
* nếu hết câu -> finish game

## POST /rooms/{room_code}/finish

BE cần:

* update game_results
* update user_stats
* broadcast GAME_ENDED

## GET /rooms/{room_code}/leaderboard

Mini leaderboard realtime.

---

# PHẦN 7 - API RESULT

## GET /rooms/{room_code}/results

Trả:

* rank
* final_score
* correct_count
* total_questions

---

# PHẦN 8 - CHAT API

## GET /rooms/{room_code}/chat

Support:

* limit
* pagination

## POST /rooms/{room_code}/chat

BE cần:

* validate room/chat_enabled
* insert chat_messages
* broadcast CHAT_MESSAGE

---

# PHẦN 9 - WEBSOCKET EVENTS

Endpoint:

```txt
WS /ws/game/{room_code}?token=<access_token>
```

Event format:

```json
{
  "type": "EVENT_NAME",
  "data": {...}
}
```

Server -> Client:

1. ROOM_STATE
2. PLAYER_JOINED
3. PLAYER_LEFT
4. CHAT_MESSAGE
5. GAME_STARTED
6. QUESTION_CHANGED
7. PLAYER_ANSWERED
8. LEADERBOARD_UPDATED
9. GAME_ENDED
10. ROOM_CLOSED

Khuyến nghị:

* REST cho action chính
* WebSocket để broadcast realtime

---

# PHẦN 10 - FRONTEND CẦN SỬA

## Types

Update:

* QuizSummary
* QuizDetail
* DashboardResponse
* RoomDetail
* GameState
* ResultsResponse

## Services

Update:

* quizService
* gameService
* dashboardService
* websocketService

Nếu dùng native WebSocket:

```ts
new WebSocket(...)
```

## DashboardScreen

* gọi API thật
* loading/error state
* bỏ demo fallback

## QuizEditorScreen

Validate FE:

* title required
* question required
* đúng 1 đáp án correct

## CreateRoomScreen

* load quiz thật
* create room thật

## LobbyScreen

* realtime players/chat
* start game

## GameplayScreen

* render current question thật
* realtime leaderboard
* submit answer thật

## ResultScreen

* render results thật
* podium top 3

---

# PHẦN 11 - SERVICE LAYER BACKEND

## quiz_service.py

* list_quizzes
* get_quiz_detail
* create_quiz_with_questions
* update_quiz_with_questions
* delete_quiz
* duplicate_quiz

## game_service.py

* create_room
* join_room
* leave_room
* start_room
* get_game_state
* submit_answer
* advance_question
* finish_room
* get_results
* get_leaderboard
* send_chat

---

# PHẦN 12 - VALIDATION/SECURITY

Cần đảm bảo:

* write API cần auth
* chỉ owner sửa quiz
* chỉ host start game
* chỉ player trong room submit answer
* mỗi user answer 1 lần/câu
* không trả is_correct quá sớm
* limit chat message
* room code unique

---

# PHẦN 13 - THỨ TỰ IMPLEMENT

## Giai đoạn 1 - Quiz CRUD

1. Hoàn thiện schema
2. Hoàn thiện CRUD API
3. Sửa EditorScreen
4. Sửa Dashboard/CreateRoom

## Giai đoạn 2 - Room/Lobby

1. Migration settings
2. Room APIs
3. Chat REST
4. Lobby realtime

## Giai đoạn 3 - Gameplay

1. Start room
2. State API
3. Submit answer
4. Leaderboard
5. Finish game

## Giai đoạn 4 - Result/Stats

1. game_results
2. user_stats
3. results API

## Giai đoạn 5 - Realtime

1. Đồng bộ WebSocket
2. Broadcast events
3. Remove demo fallback

---

# PHẦN 14 - API SUMMARY

## Auth

* POST /auth/register
* POST /auth/login
* GET /auth/me
* POST /auth/refresh
* POST /auth/logout

## Dashboard

* GET /dashboard

## Quiz

* GET /quizzes
* GET /quizzes/{quiz_id}
* POST /quizzes
* PUT /quizzes/{quiz_id}
* DELETE /quizzes/{quiz_id}
* POST /quizzes/{quiz_id}/duplicate

## Room

* POST /rooms
* GET /rooms/{room_code}
* POST /rooms/{room_code}/join
* POST /rooms/{room_code}/leave
* GET /rooms/{room_code}/players
* POST /rooms/{room_code}/start

## Gameplay

* GET /rooms/{room_code}/state
* POST /rooms/{room_code}/answers
* GET /rooms/{room_code}/leaderboard
* POST /rooms/{room_code}/next-question
* POST /rooms/{room_code}/finish

## Chat

* GET /rooms/{room_code}/chat
* POST /rooms/{room_code}/chat

## Result

* GET /rooms/{room_code}/results

## Realtime

WS /ws/game/{room_code}?token=<access_token>

---

# PHẦN 15 - GHI CHÚ QUAN TRỌNG

1. UI hiện tại còn dùng demo data.
2. Nên dùng Alembic migration.
3. Bỏ socket.io-client nếu backend không dùng Socket.IO.
4. Nên có seed data.
5. Nên viết test:

* Quiz CRUD
* Room create/join/start
* Submit answer
* Finish game/result/user_stats
