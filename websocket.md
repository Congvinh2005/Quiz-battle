# Luồng Realtime Lobby (FE -> WebSocket -> BE -> DB)

Tài liệu này mô tả chi tiết luồng realtime hiện tại trong dự án Quiz Battle, tập trung vào phòng chờ (lobby).

## 1. Mục tiêu của luồng

- Bỏ polling định kỳ ở lobby
- Đồng bộ danh sách người chơi theo thời gian thực
- Cho phép client tự động reconnect khi mạng chập chờn
- Host mất kết nối thì chờ grace period để reconnect
- Quá grace period mới đóng phòng và đẩy người chơi về dashboard

## 2. Thành phần tham gia

### Frontend (FE)

- Màn hình lobby: `frontend/components/screens/LobbyScreen.tsx`
- WebSocket service: `frontend/services/websocketService.ts`
- Định nghĩa event: `frontend/types/index.ts`

### Backend (BE)

- WebSocket endpoint: `backend/app/websockets/game_socket.py`
- Connection manager: `backend/app/websockets/connection_manager.py`
- REST API room + broadcast event: `backend/app/api/v1/endpoints/rooms.py`

### Database (DB)

- Bảng phòng: `game_rooms`
- Bảng người chơi trong phòng: `room_players`

## 3. Điểm kết nối WebSocket

Frontend kết nối tới:

`ws://localhost:8000/ws/game/{room_code}?token=<access_token>`

Backend kiểm tra token JWT ngay khi bắt tay kết nối:

- Thiếu token hoặc token sai: đóng kết nối với mã `4401`
- Token hợp lệ: cho phép vào room channel tương ứng

## 4. Event realtime đang dùng

- `PLAYER_JOINED`: có người vào phòng
- `PLAYER_LEFT`: có người rời phòng
- `GAME_STARTED`: host bắt đầu game
- `ROOM_CLOSED`: phòng đóng (thường do host out thật sự)

## 5. Luồng FE -> WS -> BE -> DB theo từng case

### 5.1 Người chơi vào phòng

1. FE gọi REST `POST /rooms/{room_code}/join`.
2. BE ghi dữ liệu vào DB (`room_players`).
3. BE lấy trạng thái phòng mới nhất (room + players).
4. BE broadcast event `PLAYER_JOINED` qua WebSocket cho tất cả client trong room.
5. FE nhận event và cập nhật state lobby ngay, không cần refresh trang.

### 5.2 Người chơi rời phòng (không phải host)

1. FE gọi REST `POST /rooms/{room_code}/leave`.
2. BE xóa player khỏi DB (`room_players`).
3. BE broadcast `PLAYER_LEFT` kèm danh sách player còn lại.
4. FE nhận event và render lại danh sách người chơi tức thì.

### 5.3 Host bắt đầu game

1. FE host gọi REST `POST /rooms/{room_code}/start`.
2. BE kiểm tra quyền: chỉ `host_id` mới được start.
3. BE cập nhật DB: `game_rooms.status = PLAYING`.
4. BE broadcast `GAME_STARTED`.
5. FE ở lobby nhận event và chuyển route sang `/game/{roomCode}`.

### 5.4 Host mất kết nối WebSocket (grace period)

1. Host disconnect WS, BE chưa đóng phòng ngay.
2. BE tạo task chờ `HOST_DISCONNECT_GRACE_SECONDS` (hiện là 15 giây).
3. Nếu host reconnect trong thời gian này:
   - Task đóng phòng bị hủy.
   - Room giữ nguyên.
4. Nếu hết thời gian mà host chưa reconnect:
   - BE broadcast `ROOM_CLOSED`.
   - BE xóa room khỏi DB (`game_rooms`, cascade dữ liệu liên quan).
   - FE của người chơi nhận event và tự điều hướng về dashboard.

## 6. Cơ chế reconnect phía FE

Trong `frontend/services/websocketService.ts`:

- Tối đa `5` lần reconnect
- Backoff lũy tiến: `1s, 2s, 4s, 8s, 16s`
- Nếu reconnect thành công: reset số lần thử
- Nếu quá số lần thử: dừng reconnect

## 7. Vì sao vẫn cần DB trong luồng realtime

WebSocket chỉ là kênh đẩy sự kiện. Nguồn sự thật vẫn là DB:

- Trạng thái phòng (`game_rooms`)
- Danh sách người chơi (`room_players`)
- Quyền host (`host_id`)

Luồng chuẩn là: cập nhật DB trước, sau đó mới broadcast qua WS.

## 8. Giới hạn hiện tại

- Connection manager đang in-memory => phù hợp 1 instance backend.
- Nếu chạy nhiều instance backend, cần Redis pub/sub để đồng bộ event giữa instance.
- Redis có thể làm sau, chưa bắt buộc cho giai đoạn local hoặc deploy đơn lẻ.

## 9. Checklist test nhanh

### Case A: Join realtime

1. Mở 2 tab, đăng nhập 2 tài khoản.
2. Cùng vào 1 room.
3. Quan sát tab host: player xuất hiện ngay, không cần refresh.

### Case B: Host mất mạng tạm thời

1. Host đang ở lobby.
2. Tắt mạng hoặc đóng tab host trong thời gian ngắn.
3. Mở lại host trước 15 giây.
4. Room vẫn còn, player không bị đá về dashboard.

### Case C: Host out thật sự

1. Host rời phòng hoặc mất kết nối quá 15 giây.
2. Player nhận `ROOM_CLOSED`.
3. Player thấy thông báo và tự về dashboard.

## 10. Cấu hình cần chỉnh khi cần

Biến thời gian grace period nằm tại:

`backend/app/websockets/game_socket.py`

```python
HOST_DISCONNECT_GRACE_SECONDS = 15
```

Gợi ý chọn giá trị:

- `10s`: phản hồi nhanh, hơi gắt khi mạng yếu
- `15s`: cân bằng (khuyến nghị mặc định)
- `20-30s`: thân thiện hơn cho mobile/mạng chập chờn
