# 🎮 Nút Next Question + Auto-Sync Guests Implementation

## 📋 Tóm Tắt

Đã implement 2 tính năng chính:

### 1. **Nút "Next Question" trong GameplayScreen** ✅
- Chỉ host có thể thấy và sử dụng
- Cho phép host chuyển sang câu hỏi tiếp theo
- Tự động kết thúc game nếu đã hết câu

### 2. **Auto-Sync Guests Join Room** ✅
- Khi guest vào phòng code, tự động join mà không cần click nút
- WebSocket realtime broadcast PLAYER_JOINED cho tất cả
- Host và guest đồng bộ thời gian qua WebSocket

---

## 🔄 Workflow

### **Phase 1: Host Tạo Phòng**
```
Host → POST /rooms (create room)
↓
Backend: Tạo GameRoom + auto-add host vào RoomPlayer
↓
Frontend: Navigate tới /room/{roomCode} (Lobby)
```

### **Phase 2: Guests Vào Phòng (Auto-Sync)**
```
Guest → Navigate tới /room/{roomCode}
↓
Frontend LobbyScreen:
  1. Load room data
  2. Check if user in room?
  3. NO → Auto-join (POST /rooms/{code}/join)
  4. YES → Skip join
  5. Connect WebSocket
↓
Backend broadcasts PLAYER_JOINED
↓
All clients (host + guests) see new player in real-time
```

### **Phase 3: Host Starts Game**
```
Host → Click "🚀 Bắt đầu game!"
↓
Backend:
  1. POST /rooms/{code}/start
  2. Create GameQuestion records
  3. Broadcast GAME_STARTED
  4. Broadcast QUESTION_CHANGED (Q1)
↓
All players redirect to /game/{roomCode}
```

### **Phase 4: Gameplay (Players Answer)**
```
Player → Select option + Click "Trả lời"
↓
Frontend:
  1. Record response_time (ms since question load)
  2. POST /rooms/{code}/answers
  3. {selected_option_id, response_time}
↓
Backend:
  1. Calculate score (correct & fast = 100%, etc)
  2. Update RoomPlayer.score
  3. Create PlayerAnswer record
  4. Broadcast PLAYER_ANSWERED + leaderboard
↓
All players see updated leaderboard real-time
```

### **Phase 5: Host Advances Question**
```
Host → Click "Câu Tiếp →"
↓
Backend:
  1. POST /rooms/{code}/next-question
  2. Increment current_question_order
  3. Check if last question?
    - YES → auto-call finish_game
    - NO → Broadcast QUESTION_CHANGED
↓
All players:
  1. Reset answer selections
  2. Show new question
  3. Start new timer
```

### **Phase 6: Game Ends & Results**
```
Last question answered
↓
Host → Auto-next or manual finish
↓
Backend:
  1. POST /rooms/{code}/finish
  2. Create GameResult for each player
  3. Update UserStats
  4. Broadcast GAME_ENDED + final_leaderboard
↓
All players redirect to /results/{roomCode}
```

---

## 📁 Files to Replace

### Frontend

#### **1. GameplayScreen** ✅ NEW
**File:** `frontend/components/screens/GameplayScreen_updated.tsx`
**Replace:** `frontend/components/screens/GameplayScreen.tsx`

**Features Added:**
- ✅ WebSocket real-time listeners (QUESTION_CHANGED, PLAYER_ANSWERED, GAME_ENDED)
- ✅ Submit answer with response time tracking
- ✅ "Next Question" button (only for host)
- ✅ Real-time leaderboard updates
- ✅ Chat message sending (via postChatMessage)
- ✅ Auto-load chat history
- ✅ Timer calculation

**Key State:**
```typescript
const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
const [isNextQuestionLoading, setIsNextQuestionLoading] = useState(false);
const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
const questionStartTimeRef = useRef<number>(0);  // Track response time
```

**Handlers:**
```typescript
const handleSubmitAnswer = async (selectedOptionId: string) => {
  const responseTime = (Date.now() - questionStartTimeRef.current) / 1000;
  await gameService.submitAnswer(roomCode, {
    selected_option_id: selectedOptionId,
    response_time: responseTime,
  });
}

const handleNextQuestion = async () => {
  const result = await gameService.nextQuestion(roomCode);
  if (result?.status === "FINISHED") {
    router.push(`/results/${roomCode}`);
  }
}
```

#### **2. LobbyScreen** ✅ NEW
**File:** `frontend/components/screens/LobbyScreen_updated.tsx`
**Replace:** `frontend/components/screens/LobbyScreen.tsx`

**Features Added:**
- ✅ Auto-join guests (no click needed!)
- ✅ Track join attempt to prevent duplicate joins
- ✅ WebSocket listeners (PLAYER_JOINED, PLAYER_LEFT, GAME_STARTED, ROOM_CLOSED, CHAT_MESSAGE)
- ✅ Real-time player list updates
- ✅ Real-time chat messages
- ✅ Auto-redirect on game start
- ✅ Auto-redirect on room close

**Key Logic:**
```typescript
// Auto-join guests when they enter the room
useEffect(() => {
  if (!roomCode || !user || isAutoJoining || autoJoinAttemptedRef.current) return;

  const userAlreadyInRoom = players.some((player) => player.user_id === user.id);
  if (userAlreadyInRoom) return;  // Skip if already joined

  const autoJoin = async () => {
    await gameService.joinRoom(roomCode, user.username || "Player");
    const updatedPlayers = await gameService.getRoomPlayers(roomCode);
    setPlayers(updatedPlayers);
  };

  if (players.length > 0) {
    autoJoin();
  }
}, [roomCode, user, players]);
```

---

## 🎯 UI Buttons Added

### GameplayScreen
```
┌─────────────────────────────────────┐
│  [Trả lời] [Câu Tiếp →]  (host)    │
│   (guest sees only [Trả lời])       │
└─────────────────────────────────────┘
```

- **[Trả lời]** - Submit answer
  - Disabled if: no option selected OR already answered OR not playing
  - Shows "Đang gửi..." while loading
  - Shows "Đã trả lời" when submitted

- **[Câu Tiếp →]** - Next question (HOST ONLY)
  - Only visible to host
  - Disabled if: on last question OR loading
  - Shows "Đang chuyển..." while loading
  - Auto-calls finish game if on last question

---

## 🔌 WebSocket Events

### Server → Client (LobbyScreen)
```json
{
  "type": "PLAYER_JOINED",
  "data": { "players": [...], "player_count": 3 }
}

{
  "type": "PLAYER_LEFT",
  "data": { "players": [...], "player_count": 2 }
}

{
  "type": "GAME_STARTED",
  "data": { "room": {...}, "players": [...] }
  // → Auto-redirect to /game/{roomCode}
}

{
  "type": "CHAT_MESSAGE",
  "data": { "user": { "username": "..." }, "message": "..." }
}

{
  "type": "ROOM_CLOSED",
  "data": { "message": "Host rời phòng..." }
  // → Auto-redirect to /dashboard
}
```

### Server → Client (GameplayScreen)
```json
{
  "type": "QUESTION_CHANGED",
  "data": {
    "current_question_order": 2,
    "total_questions": 10,
    "question": { "content": "...", "answer_options": [...] }
  }
}

{
  "type": "PLAYER_ANSWERED",
  "data": {
    "user_id": "...",
    "is_correct": true,
    "points_earned": 100,
    "leaderboard": [...]
  }
}

{
  "type": "GAME_ENDED",
  "data": {
    "room_code": "ABC123",
    "final_leaderboard": [...],
    "ended_at": "2026-05-11T12:00:00Z"
  }
  // → Auto-redirect to /results/{roomCode}
}

{
  "type": "CHAT_MESSAGE",
  "data": { "user": { "username": "..." }, "message": "..." }
}
```

---

## 🎨 UI Changes

### LobbyScreen
- ✅ Remove manual "Join Room" form (auto-join replaces it)
- ✅ Show "✓ Đang tự động vào phòng..." message during auto-join
- ✅ Real-time player count + status
- ✅ Real-time chat with sending capability

### GameplayScreen
- ✅ Add "Submit Answer" button
- ✅ Add "Next Question" button (host-only)
- ✅ Real-time leaderboard
- ✅ Real-time chat sending
- ✅ Timer display
- ✅ Answer selection with feedback

---

## 🚀 Implementation Steps

1. **Replace Frontend Files:**
   ```bash
   cp frontend/components/screens/GameplayScreen_updated.tsx frontend/components/screens/GameplayScreen.tsx
   cp frontend/components/screens/LobbyScreen_updated.tsx frontend/components/screens/LobbyScreen.tsx
   ```

2. **Ensure Backend Ready:**
   - All gameplay APIs implemented ✅
   - WebSocket connections working ✅
   - Database migrations applied ✅

3. **Test Flow:**
   ```
   1. Host creates room → room code shown
   2. Guest opens /room/{code} → auto-joins
   3. Host clicks "🚀 Bắt đầu game!" → redirects to /game/{code}
   4. Guest sees "GAME_STARTED" → auto-redirects to /game/{code}
   5. Both see Question 1 + real-time leaderboard
   6. Guest selects option → clicks "Trả lời" → leaderboard updates
   7. Host clicks "Câu Tiếp →" → next question for all
   8. Repeat until last question
   9. All redirect to /results/{code}
   ```

---

## 💡 Key Improvements

### Auto-Join Logic
```typescript
// Prevents duplicate joins
const autoJoinAttemptedRef = useRef(false);

// Checks if user already in room
const userAlreadyInRoom = players.some(p => p.user_id === user.id);

// Only joins once
if (!autoJoinAttemptedRef.current && !userAlreadyInRoom) {
  autoJoinAttemptedRef.current = true;
  await gameService.joinRoom(roomCode, displayName);
}
```

### Response Time Tracking
```typescript
const questionStartTimeRef = useRef<number>(0);

// Set when question loads
questionStartTimeRef.current = Date.now();

// Calculate on submit
const responseTime = (Date.now() - questionStartTimeRef.current) / 1000;
```

### Real-Time Synchronization
```typescript
// Host starts → all get GAME_STARTED
// Player answers → all see updated leaderboard
// Host next → all see new question
// Game ends → all see results
```

---

## 🔒 Security Considerations

1. **Host Verification:**
   - Only `room.host_id === user.id` can call nextQuestion/finish

2. **Answer Validation:**
   - Backend validates: player in room, option valid, not already answered

3. **Token Authentication:**
   - WebSocket: token passed as query param `?token={access_token}`
   - REST: Authorization header `Bearer {token}`

4. **Room Access:**
   - Only joined players can submit answers/send chat

---

## 📊 Testing Checklist

- [ ] Host creates room, auto-joins
- [ ] Guest enters room code, auto-joins
- [ ] WebSocket PLAYER_JOINED shows on both
- [ ] Host clicks start game
- [ ] All redirect to /game/{code}
- [ ] Question displayed correctly
- [ ] Guest submits answer (response time recorded)
- [ ] Leaderboard updates in real-time
- [ ] Host clicks "Next Question"
- [ ] New question displayed (old answer selections cleared)
- [ ] Last question → auto-finish
- [ ] All redirect to /results/{code}
- [ ] Chat messages broadcast real-time

---

## 🎓 Architecture Summary

```
Host & Guests Synchronized Game Flow:

[CREATE ROOM]  →  [AUTO-JOIN]  →  [START GAME]  →  [GAMEPLAY]  →  [RESULTS]
     ✅              ✅               ✅              ✅             ✅
  Host only       Guests auto      All redirect   Submit answer   Show podium
  creates         (no click!)       to game        Real-time       Update stats
                  Join broadcast    Real-time      leaderboard
                                    sync
```

---

**Status:** ✅ Ready for Integration

All files prepared:
- `GameplayScreen_updated.tsx` - Ready to replace
- `LobbyScreen_updated.tsx` - Ready to replace
- Backend gameplay APIs - Already implemented
- WebSocket events - Already implemented
