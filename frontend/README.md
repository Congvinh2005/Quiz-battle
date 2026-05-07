# Quiz Battle Frontend

A real-time multiplayer quiz platform built with **Next.js 14** + **TypeScript** + **Tailwind CSS**.

## 📋 Project Structure

```
frontend/
├── app/                      # Next.js 14 App Router
│   ├── page.tsx            # Login page
│   ├── register/           # Registration page
│   ├── dashboard/          # Dashboard
│   ├── editor/             # Quiz editor
│   ├── create-room/        # Create game room
│   ├── room/[roomCode]/    # Lobby
│   ├── game/[roomCode]/    # Gameplay
│   └── results/[roomCode]/ # Results
├── components/
│   ├── layouts/            # Layout components
│   ├── screens/            # Page-level components
│   ├── common/             # Reusable components
│   └── ui/                 # UI components (buttons, inputs, etc.)
├── contexts/               # React Context (Auth, Game)
├── services/               # API & WebSocket services
│   ├── api.ts             # Axios client with interceptors
│   ├── authService.ts     # Auth API calls
│   ├── gameService.ts     # Game/Room API calls
│   ├── quizService.ts     # Quiz API calls
│   └── websocketService.ts # WebSocket/Socket.io
├── types/                  # TypeScript types
├── styles/                 # Global styles & Tailwind
├── utils/                  # Helper functions
├── public/                 # Static assets
└── config files            # tsconfig, next.config, tailwind.config, etc.
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend running on `http://localhost:8000`

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NODE_ENV=development
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## 📦 Dependencies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client with interceptors
- **Socket.io-client**: Real-time WebSocket communication
- **React Context**: State management (Auth, Game)

## 🎨 Design System

Colors (from Tailwind config):
- **Primary**: `#7C3AED` (Purple)
- **Accent**: `#06B6D4` (Cyan)
- **Gold**: `#F59E0B`
- **Green**: `#10B981`
- **Red**: `#EF4444`
- **Background**: `#0A0A0F`
- **Surface**: `#12121A`

## 🔐 Authentication Flow

1. User registers/logs in → Backend returns `access_token` + `refresh_token`
2. Tokens stored in localStorage
3. API interceptor adds token to every request
4. If 401 response → Automatically refresh token
5. Failed refresh → Redirect to login

## 🔌 WebSocket Events

### Client → Server
- `message`: Generic message with type and data
- Event types: `PLAYER_JOINED`, `ANSWER_SUBMITTED`, `CHAT_MESSAGE`, etc.

### Server → Client
- `PLAYER_JOINED`: New player joined
- `GAME_STARTED`: Game started
- `QUESTION_CHANGED`: New question
- `PLAYER_ANSWERED`: Player submitted answer
- `GAME_ENDED`: Game finished
- `CHAT_MESSAGE`: Chat message received

## 📝 Key Features

### Authentication
- ✅ Registration with email validation
- ✅ Login with JWT tokens
- ✅ Auto token refresh
- ✅ Secure logout

### Quiz Management
- ✅ Create/Edit/Delete quizzes
- ✅ Add multiple choice & true/false questions
- ✅ Time limit per question
- ✅ Point system

### Game Room
- ✅ Host creates room with quiz
- ✅ 6-character room code
- ✅ Players join with code
- ✅ Real-time player list
- ✅ Host starts game

### Gameplay
- ✅ Real-time question delivery
- ✅ Countdown timer
- ✅ Players submit answers
- ✅ Show results per question
- ✅ Live leaderboard
- ✅ Chat in room

### Results
- ✅ Final leaderboard
- ✅ Podium for top 3
- ✅ Player stats
- ✅ Play again option

## 🛠️ Development Tips

### Add a New Component

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  // ...
}
```

### Use API Service

```typescript
import { quizService } from '@/services/quizService';

const quizzes = await quizService.getAllQuizzes();
```

### Listen to WebSocket Events

```typescript
import { wsService } from '@/services/websocketService';

wsService.on('PLAYER_JOINED', (data) => {
  console.log('Player joined:', data);
});
```

### Use Auth Context

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuth();
```

## 🐛 Troubleshooting

### Port already in use
```bash
# Use different port
npm run dev -- -p 3001
```

### WebSocket connection fails
- Check backend is running on correct port
- Verify `NEXT_PUBLIC_WS_URL` in `.env.local`
- Check CORS settings in backend

### Build errors
```bash
npm run type-check  # Check TypeScript errors
```

## 📚 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## 📄 License

MIT
