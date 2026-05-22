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

## Luồng Frontend

Frontend dùng Next.js App Router. Các file trong `frontend/app/*/page.tsx` chủ yếu chỉ map URL sang screen component trong `frontend/components/screens`.

### Providers Và Layout

Luồng layout toàn app:

```text
frontend/app/layout.tsx
  -> frontend/components/layouts/RootLayout.tsx
```

`RootLayout` bọc app theo thứ tự:

```text
ThemeProvider
  -> AuthProvider
    -> GameProvider
      -> Navigation
      -> page content
```

Vai trò:

- `ThemeProvider`: lưu light/dark mode trong `localStorage`, thêm hoặc xóa class `dark-mode` trên document.
- `AuthProvider`: giữ `user`, `isAuthenticated`, `isLoading`, xử lý login/register/logout và check token khi app mount.
- `GameProvider`: giữ state dùng chung cho room/game như current room, question, players, timer và answered state.
- `Navigation`: thanh điều hướng, account modal, settings modal.

### Route Map

| Route | Page file | Screen chính | Mục đích |
| --- | --- | --- | --- |
| `/` | `frontend/app/page.tsx` | `LandingScreen` | Trang giới thiệu |
| `/login` | `frontend/app/login/page.tsx` | `LoginScreen` | Đăng nhập |
| `/register` | `frontend/app/register/page.tsx` | `RegisterScreen` | Đăng ký |
| `/dashboard` | `frontend/app/dashboard/page.tsx` | `DashboardScreen` | Dashboard, quiz của tôi, thư viện công khai, join phòng |
| `/editor` | `frontend/app/editor/page.tsx` | `QuizEditorScreen` | Tạo quiz |
| `/editor/[id]` | `frontend/app/editor/[id]/page.tsx` | `QuizEditorScreen` | Sửa quiz |
| `/create-room` | `frontend/app/create-room/page.tsx` | `CreateRoomScreen` | Chọn quiz và tạo phòng |
| `/room/[roomCode]` | `frontend/app/room/[roomCode]/page.tsx` | `LobbyScreen` | Sảnh chờ phòng |
| `/game/[roomCode]` | `frontend/app/game/[roomCode]/page.tsx` | `GameplayScreen` | Màn chơi realtime |
| `/results/[roomCode]` | `frontend/app/results/[roomCode]/page.tsx` | `ResultScreen` | Kết quả trận |
| `/statistics` | `frontend/app/statistics/page.tsx` | `StatisticsScreen` | Thống kê cá nhân |

### API Client Flow

HTTP client nằm ở:

```text
frontend/services/api.ts
```

Luồng gọi API:

```text
Screen component
  -> service function
  -> apiClient
  -> backend /api/v1/*
```

`apiClient` tự xử lý:

- dùng `NEXT_PUBLIC_API_URL`, mặc định `http://localhost:8000/api/v1`;
- thêm `Authorization: Bearer <access_token>` từ `localStorage`;
- nếu backend trả `401`, gọi `/auth/refresh` bằng `refresh_token`;
- lưu access token mới và retry request cũ;
- nếu refresh fail thì xóa token và chuyển về `/`.

Các service chính:

| File | Phụ trách |
| --- | --- |
| `authService.ts` | login, register, current user, profile, avatar, password, logout, refresh |
| `quizService.ts` | list/get/create/update/delete/search quiz |
| `gameService.ts` | room, join/leave/start, submit answer, next/finish, chat, leaderboard, results |
| `statisticsService.ts` | thống kê cá nhân, xóa lịch sử quiz đã chơi |
| `importService.ts` | import Excel/CSV/DOCX vào editor |
| `websocketService.ts` | kết nối WebSocket, reconnect, emit/listen events |

### Auth Flow

Đăng nhập:

```text
LoginScreen
  -> useAuth().login(username, password)
  -> authService.login()
  -> POST /auth/login
  -> lưu access_token + refresh_token vào localStorage
  -> authService.getCurrentUser()
  -> GET /auth/me
  -> setUser()
  -> router.push("/dashboard") hoặc redirect theo next param
```

Đăng ký:

```text
RegisterScreen
  -> useAuth().register(...)
  -> POST /auth/register
  -> chuyển về login
```

Check phiên đăng nhập khi mở app:

```text
AuthProvider mount
  -> đọc access_token trong localStorage
  -> GET /auth/me
  -> nếu ok setUser
  -> nếu fail xóa access_token + refresh_token
```

Logout:

```text
Navigation / user menu
  -> useAuth().logout()
  -> POST /auth/logout
  -> xóa token
  -> setUser(null)
```

### Dashboard Flow

```text
DashboardScreen mount
  -> quizService.getAllQuizzes()
  -> statisticsService.getMyStatistics()
  -> tách quiz thành myQuizzes và publicQuizzes
  -> search theo title ở client
  -> phân trang Quiz của tôi và Thư viện công khai
  -> stat cards lấy dữ liệu thật:
       total_games từ statistics summary
       avg_score từ statistics summary
       quiz private/public từ myQuizzes
```

Join phòng nhanh:

```text
Nhập mã phòng
  -> router.push("/room/{code}")
```

### Quiz Editor Flow

Tạo quiz:

```text
/editor
  -> QuizEditorScreen không có quizId
  -> chọn Dùng câu mẫu / Tạo từ đầu / Import file
  -> chỉnh câu hỏi, đáp án, điểm, thời gian
  -> quizService.createQuiz()
  -> POST /quizzes
```

Sửa quiz:

```text
/editor/[id]
  -> QuizEditorScreen có quizId
  -> quizService.getQuizById(id)
  -> đổ dữ liệu vào editor
  -> quizService.updateQuiz(id, payload)
  -> PUT /quizzes/{quiz_id}
```

Import câu hỏi:

```text
Chọn file .xlsx/.xls/.csv/.docx
  -> importService.importQuestions(file)
  -> POST /import/parse-excel hoặc /parse-csv hoặc /parse-docx
  -> convert response thành EditorQuestion[]
  -> đưa vào editor
```

### Tạo Phòng Và Lobby Flow

Tạo phòng:

```text
/create-room
  -> load quiz list
  -> chọn quiz + settings
  -> gameService.createRoom()
  -> POST /rooms
  -> router.push("/room/{room_code}")
```

Lobby:

```text
/room/[roomCode]
  -> LobbyScreen
  -> get room info, players, chat history
  -> nếu user chưa trong phòng: show nút Vào phòng
  -> join: POST /rooms/{room_code}/join
  -> mở WebSocket /ws/game/{room_code}?token=...
  -> nghe PLAYER_JOINED, PLAYER_LEFT, PLAYER_KICKED, GAME_STARTED, ROOM_CLOSED, CHAT_MESSAGE
```

Host bắt đầu game:

```text
Host bấm bắt đầu
  -> POST /rooms/{room_code}/start
  -> backend broadcast GAME_STARTED
  -> lobby chuyển sang /game/{roomCode}
```

### Gameplay Realtime Flow

```text
/game/[roomCode]
  -> GameplayScreen
  -> GET /rooms/{room_code}/state
  -> mở WebSocket
  -> render câu hỏi hiện tại, timer, answers, leaderboard, chat
```

Người chơi gửi đáp án:

```text
Chọn answer
  -> setSelectedAnswer
  -> bấm Trả lời
  -> POST /rooms/{room_code}/answers
  -> backend chấm điểm
  -> backend broadcast PLAYER_ANSWERED
  -> frontend cập nhật leaderboard
```

Host chuyển câu:

```text
Host bấm Câu Tiếp
  -> POST /rooms/{room_code}/next-question
  -> backend broadcast QUESTION_CHANGED
  -> frontend reset selectedAnswer, feedback, timer
  -> render câu mới
```

Kết thúc game:

```text
POST /rooms/{room_code}/finish
  -> backend lưu GameResult
  -> backend broadcast GAME_ENDED
  -> frontend chuyển sang /results/{roomCode}
```

Chat:

```text
Mặc định gửi REST:
  -> POST /rooms/{room_code}/chat
  -> backend broadcast CHAT_MESSAGE

Nếu REST lỗi mạng:
  -> wsService.emit("CHAT_MESSAGE", { message })
```

### Results Và Statistics Flow

Result screen:

```text
/results/[roomCode]
  -> get room results/state
  -> hiển thị ranking cuối trận
  -> có thể nghe WebSocket GAME_ENDED / PLAYER_ANSWERED để cập nhật
```

Statistics screen:

```text
/statistics
  -> statisticsService.getMyStatistics()
  -> GET /statistics/me
  -> render summary, quiz đã chơi, review câu trả lời
  -> có thể DELETE /statistics/me/results/{result_id}
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

Endpoint ngoài version API:

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/` | Thông tin app backend |
| GET | `/health` | Kiểm tra trạng thái backend |

Các endpoint yêu cầu đăng nhập dùng header:

```http
Authorization: Bearer <access_token>
```

Ghi chú: các path bên dưới đều tính từ base URL `/api/v1`, trừ WebSocket và health check.

### Auth

| Method | Path | Mô tả |
| --- | --- | --- |
| POST | `/auth/register` | Đăng ký và tự đăng nhập |
| POST | `/auth/login` | Đăng nhập |
| GET | `/auth/me` | Lấy user hiện tại |
| POST | `/auth/refresh` | Lấy access token mới |
| POST | `/auth/logout` | Đăng xuất |

Auth request/response chính:

| Endpoint | Body |
| --- | --- |
| `POST /auth/register` | `username`, `full_name`, `email`, `password` |
| `POST /auth/login` | `username`, `password` |
| `POST /auth/refresh` | `refresh_token` |

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

Ví dụ cập nhật hồ sơ:

```json
{
  "username": "alice",
  "full_name": "Alice Nguyen",
  "email": "alice@example.com",
  "avatar_url": "http://localhost:8000/static/uploads/avatars/file.jpg"
}
```

Ví dụ đổi mật khẩu:

```json
{
  "current_password": "secret123",
  "new_password": "newsecret123"
}
```

Upload avatar dùng `multipart/form-data` với field `file`. Backend chấp nhận JPEG, PNG, WebP, GIF và tối đa 2MB.

### Quizzes

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/quizzes` | Danh sách quiz của user và quiz public |
| GET | `/quizzes/search?q=...` | Tìm quiz |
| GET | `/quizzes/{quiz_id}` | Chi tiết quiz |
| POST | `/quizzes` | Tạo quiz |
| PUT | `/quizzes/{quiz_id}` | Cập nhật quiz |
| DELETE | `/quizzes/{quiz_id}` | Xóa quiz |

Các endpoint quiz đều yêu cầu đăng nhập. `POST /quizzes` và `PUT /quizzes/{quiz_id}` nhận cùng cấu trúc body gồm `title`, `description`, `is_public`, `questions[]`.

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
| GET | `/rooms/{room_code}/players` | Danh sách player trong phòng |
| POST | `/rooms/{room_code}/start` | Host bắt đầu game |
| POST | `/rooms/{room_code}/answers` | Gửi đáp án |
| POST | `/rooms/{room_code}/next-question` | Qua câu tiếp theo |
| POST | `/rooms/{room_code}/finish` | Host kết thúc game |
| GET | `/rooms/{room_code}/results` | Kết quả phòng |
| GET | `/rooms/{room_code}/chat?limit=50&offset=0` | Lịch sử chat, có phân trang |
| POST | `/rooms/{room_code}/chat` | Gửi chat qua REST |
| POST | `/rooms/{room_code}/kick/{user_id}` | Host kick player |

Các endpoint room/gameplay yêu cầu đăng nhập, trừ `GET /rooms/{room_code}/players`, `GET /rooms/{room_code}/results` và `GET /rooms/{room_code}/chat` hiện không khai báo dependency auth trong router.

Ví dụ tạo phòng:

```json
{
  "quiz_id": "uuid",
  "max_players": 30,
  "shuffle_questions": true,
  "chat_enabled": true
}
```

Ví dụ join phòng:

```json
{
  "display_name": "Alice"
}
```

Ví dụ submit answer:

```json
{
  "selected_option_id": "uuid",
  "response_time": 3.2
}
```

Ví dụ gửi chat qua REST:

```json
{
  "message": "Hello everyone!"
}
```

### Statistics

| Method | Path | Mô tả |
| --- | --- | --- |
| GET | `/statistics/me` | Thống kê cá nhân, quiz đã làm, chi tiết đúng/sai từng câu |
| DELETE | `/statistics/me/results/{result_id}` | Xóa một kết quả quiz khỏi lịch sử cá nhân |

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
| POST | `/import/parse-excel` | Parse câu hỏi từ Excel `.xlsx`, `.xls` |
| POST | `/import/parse-docx` | Parse câu hỏi từ Word `.docx` |
| POST | `/import/parse-csv` | Parse câu hỏi từ CSV `.csv` |

Các endpoint import dùng `multipart/form-data` với field `file`. Response trả về:

```json
{
  "questions": [
    {
      "text": "Câu hỏi?",
      "type": "MCQ",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "timeLimit": 30,
      "points": 100
    }
  ],
  "total": 1,
  "file_name": "questions.csv"
}
```

Quy ước file import:

| Định dạng | Quy ước |
| --- | --- |
| Excel | Dòng đầu là header; cột A là câu hỏi, B-E là đáp án, F là thời gian, G là điểm; đáp án đúng được tô màu xanh nhạt |
| DOCX | Mỗi câu gồm 1 dòng câu hỏi và 4 dòng đáp án; đáp án đúng được highlight vàng |
| CSV | Dòng đầu là header; các cột lần lượt là câu hỏi, type, 4 đáp án, correctIndex, timeLimit, points |

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

Client hiện chỉ gửi event `CHAT_MESSAGE` qua WebSocket. Các thao tác gameplay như join, start, submit answer, next question, finish và kick gọi qua REST API; server sẽ broadcast event realtime cho các client trong phòng.

Server broadcast các event chính:

```text
PLAYER_JOINED
PLAYER_LEFT
PLAYER_KICKED
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
