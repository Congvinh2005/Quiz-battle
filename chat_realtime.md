BE làm gì

Thêm xử lý chat realtime qua WebSocket:
Nhận message từ client trong socket loop, parse JSON event.
Nếu event là CHAT_MESSAGE thì validate, lưu DB, rồi broadcast cho cả phòng.
Chỗ chính: game_socket.py
Validate trước khi cho gửi chat:
Kiểm tra phòng tồn tại.
Kiểm tra chat_enabled.
Kiểm tra user có trong phòng (RoomPlayer) và độ dài message hợp lệ.
Broadcast payload chuẩn để FE render:
Gửi type = CHAT_MESSAGE và data có id, user_id, message, user.username...
FE làm gì

Kết nối và lắng nghe realtime:
Subscribe event CHAT_MESSAGE để nhận tin mới ngay.
Áp dụng cho cả lobby và gameplay:
LobbyScreen.tsx
GameplayScreen.tsx
Gửi chat qua WebSocket:
Khi bấm gửi: đảm bảo socket connected rồi emit CHAT_MESSAGE.
Không cần refresh để thấy tin mới (khi WS ổn).
Fallback đồng bộ để chống miss gói:
Có polling nhẹ lấy lịch sử chat để tự đồng bộ nếu WS chập chờn.
UI chat:
Auto-scroll xuống tin mới.
Tin của mình bên phải, người khác bên trái.
Tin nhắn host có highlight.
CSS ở: lobby.css
Nếu bạn muốn, mình có thể vẽ luôn sơ đồ luồng 1 message từ lúc FE emit → BE save → BE broadcast → FE render để team dễ nắm.