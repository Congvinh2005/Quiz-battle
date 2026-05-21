# Quiz Battle Frontend

Frontend của Quiz Battle được xây bằng Next.js, React và TypeScript. Ứng dụng kết nối với FastAPI backend qua REST API và WebSocket.

## Công Nghệ

- Next.js 14
- React 18
- TypeScript
- Axios
- Socket.IO client / WebSocket service
- CSS modules theo từng màn hình

## Cấu Trúc Chính

```text
app/
├── dashboard/
├── editor/
├── create-room/
├── room/[roomCode]/
├── game/[roomCode]/
├── results/[roomCode]/
├── statistics/
├── login/
└── register/

components/
├── common/
│   └── Navigation.tsx
├── layouts/
├── modals/
└── screens/
    ├── DashboardScreen.tsx
    ├── QuizEditorScreen.tsx
    ├── CreateRoomScreen.tsx
    ├── LobbyScreen.tsx
    ├── GameplayScreen.tsx
    ├── ResultScreen.tsx
    └── StatisticsScreen.tsx

contexts/
├── AuthContext.tsx
├── GameContext.tsx
└── ThemeContext.tsx

services/
├── api.ts
├── authService.ts
├── gameService.ts
├── quizService.ts
├── statisticsService.ts
└── websocketService.ts

styles/
├── globals.css
├── dashboard.css
├── editor.css
├── gameplay.css
├── result.css
├── statistics.css
└── dark-mode-overrides.css
```

## Chạy Local

```bash
cd frontend
npm install
npm run dev
```

URL mặc định:

```text
http://localhost:3000
```

Nếu port 3000 bận, Next.js có thể tự chuyển sang 3001.

## Biến Môi Trường

Tạo `frontend/.env.local` nếu cần:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Khi deploy HTTPS:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain/api/v1
NEXT_PUBLIC_WS_URL=wss://your-backend-domain
```

## Route Chính

| Route | Mô tả |
| --- | --- |
| `/` | Landing page |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/dashboard` | Dashboard quiz |
| `/editor` | Tạo quiz |
| `/editor/[id]` | Sửa quiz |
| `/create-room` | Tạo phòng |
| `/room/[roomCode]` | Lobby |
| `/game/[roomCode]` | Gameplay |
| `/results/[roomCode]` | Kết quả phòng |
| `/statistics` | Thống kê cá nhân |

## Service API

- `api.ts`: axios instance, tự gắn access token và refresh token khi 401.
- `authService.ts`: login/register/logout/profile.
- `quizService.ts`: CRUD quiz.
- `gameService.ts`: room/gameplay/chat/results.
- `statisticsService.ts`: thống kê cá nhân.
- `websocketService.ts`: kết nối WebSocket game.

## Kiểm Tra

```bash
npm run type-check
```

Build production:

```bash
npm run build
```
