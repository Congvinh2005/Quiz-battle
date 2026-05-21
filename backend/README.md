# Quiz Battle Backend

Backend của Quiz Battle được xây bằng FastAPI, PostgreSQL, Redis, WebSocket và Redis Pub/Sub.

## Công Nghệ

- FastAPI + Uvicorn
- SQLAlchemy + Alembic
- PostgreSQL
- Redis
- JWT authentication
- WebSocket realtime
- Redis Pub/Sub cho multi-instance broadcast

## Cấu Trúc Chính

```text
app/
├── api/
│   ├── dependencies.py
│   └── v1/
│       ├── api.py
│       ├── import_router.py
│       └── endpoints/
│           ├── auth.py
│           ├── quizzes.py
│           ├── rooms.py
│           ├── statistics.py
│           └── users.py
├── core/
├── db/
├── models/
├── schemas/
├── services/
│   ├── auth_service.py
│   ├── game_service.py
│   ├── quiz_service.py
│   ├── redis_manager.py
│   └── redis_pubsub.py
└── websockets/
    ├── connection_manager.py
    └── game_socket.py
```

## Chạy Local

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Cần PostgreSQL và Redis đang chạy. Có thể chạy bằng Docker Compose từ root:

```bash
docker compose up -d db redis
```

## Biến Môi Trường

```env
DATABASE_URL=postgresql://postgres:quizbattle123@localhost:5432/quiz_battle
REDIS_URL=redis://localhost:6379/0
ROOM_SESSION_TTL_SECONDS=86400
SECRET_KEY=change-this-secret-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM=HS256
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

## API

Base URL:

```text
/api/v1
```

Nhóm endpoint:

- `/auth`: register, login, me, refresh, logout
- `/users`: profile, avatar, password
- `/quizzes`: CRUD quiz, search
- `/rooms`: room, gameplay, leaderboard, chat, results
- `/statistics`: thống kê cá nhân
- `/import`: parse Excel, Word, CSV

Swagger:

```text
http://localhost:8000/docs
```

## WebSocket

Endpoint:

```text
ws://localhost:8000/ws/game/{room_code}?token=<access_token>
```

Event chính:

```text
PLAYER_JOINED
PLAYER_LEFT
ROOM_CLOSED
GAME_STARTED
PLAYER_ANSWERED
CHAT_MESSAGE
GAME_ENDED
```

## Redis

Redis được dùng cho:

- Refresh token store
- Game session cache
- Room/player/score/answer runtime state
- WebSocket Pub/Sub channel

Pub/Sub channel:

```text
quizbattle:ws:broadcast
```

## Kiểm Tra

```bash
python3 -m py_compile app/main.py app/services/redis_pubsub.py app/websockets/connection_manager.py
```
