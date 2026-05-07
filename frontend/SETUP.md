# Frontend Setup Guide

## 📋 Checklist

Before running the frontend, ensure:

- [ ] Backend running on `http://localhost:8000`
- [ ] PostgreSQL database is running
- [ ] Redis is running (for real-time features)
- [ ] Environment variables configured

## 🔧 Installation Steps

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Create Environment File
Create `.env.local` in the `frontend` directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Environment
NODE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📁 Key Files & Folders

| Path | Purpose |
|------|---------|
| `app/` | Next.js 14 App Router - pages |
| `components/` | Reusable React components |
| `contexts/` | React Context for Auth & Game state |
| `services/` | API clients & WebSocket service |
| `types/` | TypeScript type definitions |
| `styles/` | Global CSS & Tailwind config |
| `utils/` | Helper functions |

## 🔑 Important Services

### API Client (`services/api.ts`)
- Axios instance with auto token refresh
- Request interceptor adds JWT token
- Response interceptor handles 401 errors

### Auth Service (`services/authService.ts`)
- `login(credentials)` - User login
- `register(data)` - User registration
- `getCurrentUser()` - Get current user
- `logout()` - User logout

### Game Service (`services/gameService.ts`)
- `createRoom(quiz_id)` - Create game room
- `joinRoom(roomCode, displayName)` - Join room
- `startGame(roomCode)` - Start the game
- `getGameResults(roomCode)` - Get results

### WebSocket Service (`services/websocketService.ts`)
- `connect(token, roomCode)` - Connect to room
- `emit(eventType, data)` - Send event
- `on(eventType, callback)` - Listen to event
- `disconnect()` - Disconnect from room

## 🎮 Pages & Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | LoginScreen | User login |
| `/register` | RegisterScreen | User registration |
| `/dashboard` | DashboardScreen | Quiz management & room creation |
| `/editor` | QuizEditorScreen | Create/edit quizzes |
| `/create-room` | CreateRoomScreen | Create new game room |
| `/room/[roomCode]` | LobbyScreen | Wait for players before game |
| `/game/[roomCode]` | GameplayScreen | Active gameplay with timer & questions |
| `/results/[roomCode]` | ResultScreen | Game results & leaderboard |

## 🔌 WebSocket Connection Flow

1. User joins room → API call returns room data
2. On game start → Connect WebSocket with JWT token
3. Server sends questions in real-time
4. Client emits answer submissions
5. Server broadcasts leaderboard updates
6. Game ends → Disconnect WebSocket

## 🎨 Component Development

### Example: Create a Button Component

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded-xl font-semibold text-sm transition-all';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-brand-primary to-brand-primary-light text-white',
    secondary: 'bg-dark-surface2 text-text-main border border-border-light',
    outline: 'bg-transparent border border-border-light text-text-main',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
}
```

### Example: Use Auth Context

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.username}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🐛 Common Issues

### Issue: WebSocket not connecting
**Solution:** 
- Verify backend is running on `ws://localhost:8000`
- Check token is valid
- Check room code is correct

### Issue: API calls failing
**Solution:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running
- Check network tab in browser DevTools

### Issue: Tailwind styles not applied
**Solution:**
- Run `npm run build` and check for errors
- Verify `tailwind.config.js` paths are correct
- Restart dev server

## 📦 Building for Production

```bash
# Build
npm run build

# Start production server
npm start

# Build + export as static (if applicable)
npm run build
```

## 🚀 Deployment Checklist

- [ ] Update `.env.local` with production URLs
- [ ] Run `npm run type-check` - no errors
- [ ] Run `npm run build` - successful
- [ ] Test all pages and features
- [ ] Check WebSocket connection
- [ ] Test on different devices (mobile, tablet)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for errors
3. Check network tab in DevTools
4. Create an issue on GitHub
