# Quiz Battle

Quiz Battle là ứng dụng thi đấu quiz realtime gồm frontend Next.js, backend FastAPI, PostgreSQL, Redis, WebSocket và Redis Pub/Sub để hỗ trợ scale nhiều backend instance.

## Tính Năng

- Đăng ký, đăng nhập, refresh token và logout bằng JWT.
- Quản lý hồ sơ người dùng, avatar và mật khẩu.
- Tạo, sửa, xóa, tìm kiếm quiz.
- Editor quiz hỗ trợ câu chọn đáp án, đúng/sai, thêm/xóa đáp án, import câu hỏi từ file.
- Tạo phòng, join phòng, rời phòng, kick player.
- Gameplay realtime: chat, leaderboard, trả lời câu hỏi, next question, finish game.
- Thống kê cá nhân: list quiz đã làm, điểm, hạng, câu đúng/sai/chưa trả lời.
- Redis lưu refresh token, game session runtime state và cache phòng chơi.
- Redis Pub/Sub đồng bộ WebSocket events khi chạy nhiều backend instance.

## Công Nghệ

- Frontend: Next.js 14, React, TypeScript, CSS.
- Backend: FastAPI, SQLAlchemy, Alembic, Uvicorn.
- Database: PostgreSQL.
- Cache/message broker: Redis.
- Realtime: WebSocket + Redis Pub/Sub.
- Auth: JWT access token + refresh token.
- Docker: Docker Compose cho local development.

## Kiến Trúc

```text
Browser / Next.js
  | REST API
  | WebSocket
  v
FastAPI Backend
  | SQLAlchemy
  v
PostgreSQL

FastAPI Backend <-> Redis
  - refresh token store
  - game session cache
  - room/player/score/answer runtime state
  - WebSocket Pub/Sub broadcast channel
```

Redis key nhóm chính:

```text
auth:refresh:<jti>
auth:user_refresh:<user_id>
quizbattle:room:<room_code>:meta
quizbattle:room:<room_code>:players
quizbattle:room:<room_code>:scores
quizbattle:room:<room_code>:questions
quizbattle:room:<room_code>:answers
quizbattle:room:<room_code>:active
quizbattle:room:<room_code>:finished
quizbattle:room:<room_code>:left
quizbattle:ws:broadcast
```

## Cấu Trúc Thư Mục

```text
Quiz-battle/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dependencies.py
│   │   │   └── v1/
│   │   │       ├── api.py
│   │   │       ├── import_router.py
│   │   │       └── endpoints/
│   │   │           ├── auth.py
│   │   │           ├── quizzes.py
│   │   │           ├── rooms.py
│   │   │           ├── statistics.py
│   │   │           └── users.py
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── game_service.py
│   │   │   ├── quiz_service.py
│   │   │   ├── redis_manager.py
│   │   │   └── redis_pubsub.py
│   │   └── websockets/
│   │       ├── connection_manager.py
│   │       └── game_socket.py
│   ├── alembic/
│   ├── Dockerfile
│   ├── README.md
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── editor/
│   │   ├── create-room/
│   │   ├── room/[roomCode]/
│   │   ├── game/[roomCode]/
│   │   ├── results/[roomCode]/
│   │   ├── statistics/
│   │   ├── login/
│   │   └── register/
│   ├── components/
│   │   ├── common/
│   │   │   └── Navigation.tsx
│   │   ├── layouts/
│   │   ├── modals/
│   │   └── screens/
│   │       ├── DashboardScreen.tsx
│   │       ├── QuizEditorScreen.tsx
│   │       ├── CreateRoomScreen.tsx
│   │       ├── LobbyScreen.tsx
│   │       ├── GameplayScreen.tsx
│   │       ├── ResultScreen.tsx
│   │       └── StatisticsScreen.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── GameContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── gameService.ts
│   │   ├── quizService.ts
│   │   ├── statisticsService.ts
│   │   └── websocketService.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── dashboard.css
│   │   ├── editor.css
│   │   ├── gameplay.css
│   │   ├── result.css
│   │   ├── statistics.css
│   │   └── dark-mode-overrides.css
│   ├── types/
│   │   └── index.ts
│   ├── Dockerfile
│   ├── README.md
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Cách Chạy Bằng Docker

Yêu cầu: Docker Desktop hoặc Docker Engine.

```bash
docker compose up -d --build
```

Các URL local:

```text
Frontend:      http://localhost:3000
Backend API:   http://localhost:8000
Swagger docs:  http://localhost:8000/docs
ReDoc:         http://localhost:8000/redoc
Health check:  http://localhost:8000/health
pgAdmin:       http://localhost:5050
Redis Insight: http://localhost:5540
```

Xem log:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Tắt service:

```bash
docker compose down
```

Reset database/cache volume:

```bash
docker compose down -v
docker compose up -d --build
```

## Cách Chạy Thủ Công

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend cần PostgreSQL và Redis đang chạy. Có thể chạy riêng bằng Docker Compose:

```bash
docker compose up -d db redis
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Nếu port 3000 bận, Next.js sẽ tự dùng port khác như 3001.

## Biến Môi Trường

Backend:

```env
DATABASE_URL=postgresql://postgres:quizbattle123@localhost:5432/quiz_battle
POSTGRES_USER=postgres
POSTGRES_PASSWORD=quizbattle123
POSTGRES_DB=quiz_battle
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

REDIS_URL=redis://localhost:6379/0
ROOM_SESSION_TTL_SECONDS=86400

DEBUG=true
SECRET_KEY=change-this-secret-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM=HS256

API_V1_STR=/api/v1
PROJECT_NAME=Quiz Battle
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

Frontend:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Khi deploy HTTPS:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend-domain
```

## API Tổng Quan

Base URL:

```text
http://localhost:8000/api/v1
```

Các endpoint yêu cầu đăng nhập dùng header:

```http
Authorization: Bearer <access_token>
```

### Auth

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/auth/register` | Đăng ký và tự đăng nhập |
| POST | `/auth/login` | Đăng nhập |
| GET | `/auth/me` | Lấy user hiện tại |
| POST | `/auth/refresh` | Lấy access token mới |
| POST | `/auth/logout` | Đăng xuất |

Ví dụ đăng ký:

```json
{
  "username": "alice",
  "full_name": "Alice Nguyen",
  "email": "alice@example.com",
  "password": "secret123"
}
```

### Users

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/users` | Danh sách user |
| GET | `/users/me` | Hồ sơ user hiện tại |
| PUT | `/users/me` | Cập nhật hồ sơ |
| POST | `/users/me/avatar` | Upload avatar |
| PUT | `/users/me/password` | Đổi mật khẩu |
| GET | `/users/{user_id}` | Lấy user theo id |

### Quizzes

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/quizzes` | Danh sách quiz của user và quiz public |
| GET | `/quizzes/search?q=...` | Tìm quiz |
| GET | `/quizzes/{quiz_id}` | Chi tiết quiz |
| POST | `/quizzes` | Tạo quiz |
| PUT | `/quizzes/{quiz_id}` | Cập nhật quiz |
| DELETE | `/quizzes/{quiz_id}` | Xóa quiz |

Ví dụ tạo quiz:

```json
{
  "title": "Địa lý cơ bản",
  "description": "Có 3 câu hỏi",
  "is_public": false,
  "questions": [
    {
      "content": "Úc là một lục địa?",
      "question_type": "TRUE_FALSE",
      "time_limit": 20,
      "points": 100,
      "order_index": 0,
      "answer_options": [
        { "content": "Đúng", "is_correct": true },
        { "content": "Sai", "is_correct": false }
      ]
    }
  ]
}
```

### Rooms / Gameplay

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/rooms` | Tạo phòng chơi |
| GET | `/rooms/{room_code}` | Lấy thông tin phòng |
| GET | `/rooms/{room_code}/state` | Lấy state đầy đủ của phòng/game |
| GET | `/rooms/{room_code}/leaderboard` | Lấy leaderboard |
| POST | `/rooms/{room_code}/join` | Join phòng |
| POST | `/rooms/{room_code}/leave` | Rời phòng |
| GET | `/rooms/{room_code}/players` | Danh sách player |
| POST | `/rooms/{room_code}/start` | Host bắt đầu game |
| POST | `/rooms/{room_code}/answers` | Gửi đáp án |
| POST | `/rooms/{room_code}/next-question` | Qua câu tiếp theo |
| POST | `/rooms/{room_code}/finish` | Host kết thúc game |
| GET | `/rooms/{room_code}/results` | Kết quả phòng |
| GET | `/rooms/{room_code}/chat` | Lịch sử chat |
| POST | `/rooms/{room_code}/chat` | Gửi chat qua REST |
| POST | `/rooms/{room_code}/kick/{user_id}` | Host kick player |

Ví dụ tạo phòng:

```json
{
  "quiz_id": "uuid",
  "max_players": 30,
  "shuffle_questions": true,
  "chat_enabled": true
}
```

Ví dụ submit answer:

```json
{
  "selected_option_id": "uuid",
  "response_time": 3.2
}
```

### Statistics

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/statistics/me` | Thống kê cá nhân, quiz đã làm, chi tiết đúng/sai từng câu |

Response gồm:

```text
summary.total_games
summary.total_score
summary.avg_score
summary.wins
played_quizzes[]
played_quizzes[].answers[]
```

Các câu chưa trả lời vẫn xuất hiện trong review và được tính là sai.

### Import

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/import/parse-excel` | Parse câu hỏi từ Excel |
| POST | `/import/parse-docx` | Parse câu hỏi từ Word |
| POST | `/import/parse-csv` | Parse câu hỏi từ CSV |

Các endpoint import dùng `multipart/form-data` với field file.

## WebSocket

WebSocket endpoint:

```text
ws://localhost:8000/ws/game/{room_code}?token=<access_token>
```

Khi deploy HTTPS:

```text
wss://your-backend-domain/ws/game/{room_code}?token=<access_token>
```

Client gửi chat qua WebSocket:

```json
{
  "type": "CHAT_MESSAGE",
  "data": {
    "message": "Hello"
  }
}
```

Server broadcast các event chính:

```text
PLAYER_JOINED
PLAYER_LEFT
ROOM_CLOSED
GAME_STARTED
QUESTION_CHANGED
PLAYER_ANSWERED
CHAT_MESSAGE
HOST_LEFT
GAME_ENDED
```

Ví dụ event:

```json
{
  "type": "PLAYER_ANSWERED",
  "data": {
    "user_id": "uuid",
    "question_order": 1,
    "is_correct": true,
    "points_earned": 100,
    "leaderboard": []
  }
}
```

## Redis Pub/Sub

Redis Pub/Sub được dùng để đồng bộ WebSocket broadcast giữa nhiều backend instance.

Luồng:

```text
Backend A gọi manager.broadcast(room_code, message)
  -> gửi WebSocket local
  -> publish vào Redis channel quizbattle:ws:broadcast

Backend B subscribe channel
  -> nhận event
  -> broadcast_local tới WebSocket client đang nối vào Backend B
```

Nếu chỉ chạy 1 backend instance, Pub/Sub không làm thay đổi flow realtime hiện tại. Nếu scale nhiều backend instance, Pub/Sub giúp chat, leaderboard, player joined/left và game ended đồng bộ giữa các instance.

## Database Và Migration

Model SQLAlchemy nằm trong:

```text
backend/app/models
```

Alembic migration nằm trong:

```text
backend/alembic/versions
```

Backend startup hiện:

```text
1. Base.metadata.create_all(bind=engine)
2. alembic upgrade head
3. start Redis Pub/Sub listener
```

## Scripts Kiểm Tra

Frontend:

```bash
cd frontend
npm run type-check
```

Backend syntax check:

```bash
python3 -m py_compile backend/app/main.py backend/app/services/redis_pubsub.py
```

## Troubleshooting

### Không gọi được API từ frontend

- Kiểm tra `NEXT_PUBLIC_API_URL`.
- Kiểm tra `ALLOWED_ORIGINS` trong backend.
- Mở `http://localhost:8000/health`.

### WebSocket không kết nối

- Kiểm tra `NEXT_PUBLIC_WS_URL`.
- Access token phải còn hạn.
- URL phải đúng dạng `/ws/game/{room_code}?token=...`.
- Nếu dùng HTTPS thì WebSocket phải dùng `wss://`.

### Redis không kết nối

- Kiểm tra `REDIS_URL`.
- Docker local dùng `redis://redis:6379/0` trong container.
- Chạy ngoài Docker dùng `redis://localhost:6379/0`.
- Mở Redis Insight ở `http://localhost:5540`.

### Room cache không mất

- Game kết thúc đúng flow sẽ persist kết quả về PostgreSQL rồi xóa cache room.
- Room bị bỏ dở sẽ tự hết hạn theo `ROOM_SESSION_TTL_SECONDS`.
- Auth token key `auth:*` là refresh token, TTL theo `REFRESH_TOKEN_EXPIRE_DAYS`.

## Deploy Gợi Ý

Nên deploy tách service:

```text
frontend: Next.js
backend: FastAPI
database: PostgreSQL
redis/key-value: Redis-compatible service
```

Backend production env:

```env
DATABASE_URL=...
REDIS_URL=...
SECRET_KEY=...
ALLOWED_ORIGINS=["https://your-frontend-domain"]
```

Frontend production env:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend-domain
```
