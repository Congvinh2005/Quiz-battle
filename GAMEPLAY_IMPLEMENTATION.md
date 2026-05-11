# 🎮 QuizBattle Gameplay Implementation - Complete Guide

## ✅ Implementation Status

### Backend Implementation Complete

#### 1. **Game Service (`backend/app/services/game_service.py`)**

**Helper Functions:**
- `_get_leaderboard()` - Returns sorted leaderboard by score

**Implemented Endpoints:**
- ✅ `POST /rooms` - Create room (auto-adds host as player)
- ✅ `GET /rooms/{room_code}` - Get room details
- ✅ `GET /rooms/{room_code}/state` - Get full game state for refresh
- ✅ `GET /rooms/{room_code}/leaderboard` - Get current leaderboard
- ✅ `POST /rooms/{room_code}/join` - Join room with broadcast
- ✅ `POST /rooms/{room_code}/leave` - Leave room with broadcast
- ✅ `GET /rooms/{room_code}/players` - Get room players
- ✅ `POST /rooms/{room_code}/start` - **UPDATED**: Now creates GameQuestion records + broadcasts GAME_STARTED and QUESTION_CHANGED
- ✅ `POST /rooms/{room_code}/answers` - Submit answer with score calculation
- ✅ `POST /rooms/{room_code}/next-question` - Move to next question
- ✅ `POST /rooms/{room_code}/finish` - Finish game + create GameResults + update UserStats
- ✅ `GET /rooms/{room_code}/results` - Get game results
- ✅ `GET /rooms/{room_code}/chat` - Get chat messages with pagination
- ✅ `POST /rooms/{room_code}/chat` - Post chat message with validation

#### 2. **API Endpoints (`backend/app/api/v1/endpoints/rooms.py`)**

All endpoints registered and exported to router:
```python
- POST /rooms
- GET /rooms/{room_code}
- GET /rooms/{room_code}/state
- GET /rooms/{room_code}/leaderboard
- POST /rooms/{room_code}/join
- POST /rooms/{room_code}/leave
- GET /rooms/{room_code}/players
- POST /rooms/{room_code}/start
- POST /rooms/{room_code}/answers
- POST /rooms/{room_code}/next-question
- POST /rooms/{room_code}/finish
- GET /rooms/{room_code}/results
- GET /rooms/{room_code}/chat
- POST /rooms/{room_code}/chat
```

#### 3. **Database Models Updates**

- ✅ `UserStats` - Added `wins` field
- ✅ Models already have proper relationships (PlayerAnswer, GameResult, GameQuestion)

---

## 🔄 Workflow Flow

### 1. **Host Creates Room & Auto-Joins**
```
Host calls: POST /rooms
{
  "quiz_id": "xxx",
  "max_players": 30,
  "shuffle_questions": true,
  "chat_enabled": true
}
↓
Backend:
- Creates GameRoom with host_id
- Auto-creates RoomPlayer for host
- Broadcasts via WS: (to be connected guests)
```

**Response:**
```json
{
  "id": "room-uuid",
  "room_code": "ABC123",
  "host_id": "host-uuid",
  "quiz_id": "quiz-uuid",
  "status": "WAITING"
}
```

### 2. **Guests Join Room (同步同时)**
```
Guest calls: POST /rooms/{room_code}/join
{
  "display_name": "Player Name"
}
↓
Backend:
- Validates room exists and status is WAITING
- Validates room not full
- Creates RoomPlayer for guest
- Broadcasts: PLAYER_JOINED with updated room state
↓
All connected clients receive:
{
  "type": "PLAYER_JOINED",
  "data": {
    "players": [...all players...],
    "player_count": 2
  }
}
```

### 3. **Host Starts Game**
```
Host calls: POST /rooms/{room_code}/start
↓
Backend:
- Validates only host can start
- Creates GameQuestion records from Quiz questions
- Shuffle if enabled
- Set current_question_order = 1
- Broadcasts: GAME_STARTED
- Broadcasts: QUESTION_CHANGED with first question
↓
Room status changes: WAITING → PLAYING
```

**QUESTION_CHANGED payload:**
```json
{
  "type": "QUESTION_CHANGED",
  "data": {
    "current_question_order": 1,
    "total_questions": 10,
    "question": {
      "id": "q-uuid",
      "content": "What is...?",
      "question_type": "MULTIPLE_CHOICE",
      "time_limit": 30,
      "points": 100,
      "answer_options": [
        {"id": "opt-1", "content": "Option A"},
        {"id": "opt-2", "content": "Option B"}
      ]
    }
  }
}
```

### 4. **Players Submit Answers (Synchronized Timing)**
```
Player calls: POST /rooms/{room_code}/answers
{
  "selected_option_id": "opt-uuid",
  "response_time": 5.2  // seconds
}
↓
Backend:
- Validates player in room
- Validates question not already answered
- Validates option validity
- Calculates score:
  - If correct & < 3 seconds: full points
  - If correct & >= 3 seconds: 50% points
  - If wrong: 0 points
- Creates PlayerAnswer record
- Updates RoomPlayer.score
- Broadcasts: PLAYER_ANSWERED with leaderboard update
↓
All clients receive updated leaderboard in real-time
```

### 5. **Host Advances to Next Question**
```
Host calls: POST /rooms/{room_code}/next-question
↓
Backend:
- Check if current question is last
- If last: Call finish_game() → Game ends
- If not last: Increment current_question_order
- Broadcasts: QUESTION_CHANGED with next question
↓
Game loop continues until all questions answered
```

### 6. **Game Finishes**
```
Host calls: POST /rooms/{room_code}/finish
(or automatically called when last question answered)
↓
Backend:
- Set room.status = "FINISHED"
- Set room.ended_at = now()
- For each player:
  - Create GameResult (with rank + final_score)
  - Update UserStats (total_games, total_score, wins)
- Broadcasts: GAME_ENDED with final leaderboard
↓
Room status: FINISHED
```

---

## 📊 WebSocket Events Flow

### Server → Clients

1. **ROOM_STATE** (on initial connection)
   - Current players, scores, status

2. **PLAYER_JOINED**
   - When player enters room
   - Data: updated player list

3. **PLAYER_LEFT**
   - When player leaves room
   - Data: departed player, remaining players

4. **GAME_STARTED**
   - When host starts game
   - Data: room state

5. **QUESTION_CHANGED**
   - When question advances
   - Data: question details, order, total

6. **PLAYER_ANSWERED**
   - When player submits answer
   - Data: user_id, is_correct, points_earned, updated leaderboard

7. **LEADERBOARD_UPDATED** (implicit in PLAYER_ANSWERED)
   - Real-time score updates

8. **CHAT_MESSAGE**
   - When player posts chat
   - Data: message, user, timestamp

9. **GAME_ENDED**
   - When game finishes
   - Data: final_leaderboard, ended_at

10. **ROOM_CLOSED**
    - When host leaves during game
    - Data: reason, message

---

## 🎯 Frontend Implementation Checklist

### Updated Files:
- ✅ `frontend/services/gameService.ts` - All gameplay API methods added
  - `submitAnswer(roomCode, payload)`
  - `nextQuestion(roomCode)`
  - `finishGame(roomCode)`
  - `getLeaderboard(roomCode)`
  - `postChatMessage(roomCode, payload)`

### Updated Screens (Need Implementation):

#### **LobbyScreen.tsx**
```typescript
// Auto-load chat history on mount
useEffect(() => {
  gameService.getChatMessages(roomCode).then(setMessages);
}, [roomCode]);

// Send chat message
const handleSendChat = async (message: string) => {
  await gameService.postChatMessage(roomCode, { message });
  // WebSocket will broadcast and update UI
};

// Listen for CHAT_MESSAGE events
useEffect(() => {
  ws.on("CHAT_MESSAGE", (data) => {
    setMessages(prev => [...prev, data.message]);
  });
}, [ws]);
```

#### **GameplayScreen.tsx**
```typescript
// Submit answer on option selected
const handleSelectOption = async (optionId: string, responseTime: number) => {
  const result = await gameService.submitAnswer(roomCode, {
    selected_option_id: optionId,
    response_time: responseTime,
  });
  
  // Show feedback
  setIsCorrect(result.is_correct);
  setPointsEarned(result.points_earned);
  
  // Update leaderboard
  setLeaderboard(result.leaderboard);
};

// Host advances question
const handleNextQuestion = async () => {
  const result = await gameService.nextQuestion(roomCode);
  if (result.status === "FINISHED") {
    navigateTo("/results");
  }
};

// Listen for next question
ws.on("QUESTION_CHANGED", (data) => {
  setCurrentQuestion(data.question);
  setQuestionOrder(data.current_question_order);
});

// Listen for player answered
ws.on("PLAYER_ANSWERED", (data) => {
  setLeaderboard(data.leaderboard);
});
```

#### **ResultScreen.tsx**
```typescript
// Get final results
useEffect(() => {
  gameService.getGameResults(roomCode).then(setResults);
}, [roomCode]);

// Display ranked leaderboard
results.sort((a, b) => a.rank - b.rank).map((player, idx) => (
  <PodiumPlace key={idx} rank={player.rank} player={player} />
));
```

---

## 🔐 Key Implementation Details

### Score Calculation
```python
if is_correct:
    if response_time < 3:  # Answered quickly
        points = question.points  # 100% score
    else:
        points = max(int(question.points * 0.5), 1)  # 50% score
else:
    points = 0
```

### Leaderboard Sorting
- Always sorted by `score DESC`
- Rank assigned by position (1-indexed)

### Player Answers Constraint
- Composite unique: (room_id, user_id, question_id)
- Cannot answer same question twice

### Game Shuffle
- If `shuffle_questions=true`: questions randomized before game starts
- If `shuffle_questions=false`: questions in original order

### Chat Validation
- Message max length: 500 chars
- Chat only enabled if `room.chat_enabled=true`
- User must be in room to send chat

---

## 🚀 Running the Implementation

### Backend Server
```bash
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Dev Server
```bash
cd frontend
npm run dev
```

### Test Flow
1. Host creates room → Get room_code
2. Guest joins room with room_code
3. Host starts game
4. Players submit answers in real-time
5. Host advances questions
6. Game finishes → View results

---

## 📝 API Request Examples

### Submit Answer
```bash
curl -X POST http://localhost:8000/rooms/ABC123/answers \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "selected_option_id": "opt-uuid",
    "response_time": 5.2
  }'
```

### Post Chat
```bash
curl -X POST http://localhost:8000/rooms/ABC123/chat \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"message": "Good luck!"}'
```

### Next Question
```bash
curl -X POST http://localhost:8000/rooms/ABC123/next-question \
  -H "Authorization: Bearer {token}"
```

---

## 🎓 Architecture Summary

```
┌─────────────────────────────────────────────┐
│          Frontend (TypeScript/React)        │
│  DashboardScreen → CreateRoom → Lobby       │
│  → GameplayScreen → ResultScreen            │
└──────────────┬──────────────────────────────┘
               │
        REST + WebSocket
               │
┌──────────────▼──────────────────────────────┐
│    Backend (FastAPI + SQLAlchemy)           │
│                                             │
│  Routes:  /rooms/* endpoints                │
│  Services: game_service.py                  │
│  Models: GameRoom, RoomPlayer, GameQuestion │
│          PlayerAnswer, GameResult, UserStats│
│  WebSocket: /ws/game/{room_code}            │
│  Broadcast: ConnectionManager               │
└──────────────┬──────────────────────────────┘
               │
       PostgreSQL Database
               │
    Structured Game Flow Data
```

---

## ⚠️ Important Notes

1. **WebSocket Connection**
   - Established when user enters room
   - Token passed as query param: `?token={access_token}`
   - Auto-reconnect with exponential backoff

2. **Timestamp Synchronization**
   - All server timestamps in UTC
   - Frontend converts to local time
   - `joined_at` tracks when player entered room

3. **Host Disconnection**
   - 15-second grace period for reconnection
   - If not reconnected: room closes automatically
   - Other players notified: ROOM_CLOSED event

4. **Broadcasting**
   - Uses in-memory ConnectionManager
   - For multi-instance: upgrade to Redis pub/sub

5. **Score Persistence**
   - Score stored in RoomPlayer (current game)
   - Final score stored in GameResult (after game)
   - Aggregated to UserStats (career)

---

## 🔄 Next Steps

1. Implement WebSocket event listeners in GameplayScreen
2. Add real-time leaderboard display
3. Add timer for question countdown
4. Implement chat message pagination
5. Add sound effects on correct/incorrect answers
6. Implement replay/rematch functionality
7. Add performance analytics dashboard
