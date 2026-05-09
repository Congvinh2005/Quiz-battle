
#
GIAI ĐOẠN 1: CƠ SỞ DỮ LIỆU & QUẢN LÝ QUIZ (NỀN TẢNG)
Mục tiêu: Giúp Frontend thoát khỏi dữ liệu ảo khi tạo và hiển thị Quiz.

Task 1: Migration & Schema Update

Cập nhật bảng game_rooms với các settings (max_players, chat_enabled...).

Cập nhật bảng quizzes (category, difficulty, play_count...).

Đảm bảo tất cả bảng có created_at và updated_at.

Task 2: API CRUD Quiz nâng cao

Viết Logic xử lý Transaction cho POST /quizzes (Tạo Quiz + Questions + Options cùng lúc).

Viết GET /quizzes/{id} trả về full cấu trúc lồng nhau (Nested JSON).

Cài đặt API Duplicate quiz.

Task 3: Integration Editor Screen (FE)

Thay thế state demo bằng API call.

Validate dữ liệu đầu vào (ít nhất 1 câu hỏi, đúng 1 đáp án đúng).

GIAI ĐOẠN 2: DASHBOARD & QUẢN LÝ PHÒNG CHỜ (LOBBY)
Mục tiêu: Kết nối người chơi với nhau và hiển thị thông số cá nhân.

Task 4: API Dashboard & User Stats

Viết API GET /dashboard tổng hợp (Stats + Recent Quizzes).

Viết API GET /users/me/stats tính toán từ bảng user_stats.

Task 5: Logic Create & Join Room

POST /rooms: Sinh mã room_code ngẫu nhiên/duy nhất, tự động thêm Host vào danh sách player.

POST /rooms/{code}/join: Kiểm tra slot trống, trạng thái phòng.

Task 6: Lobby Synchronization (Rest API)

API lấy danh sách player trong phòng.

API Chat (Lưu và tải tin nhắn cũ).

GIAI ĐOẠN 3: REALTIME CORE (WEBSOCKET & DÒNG CHẢY GAME)
Mục tiêu: Chuyển đổi từ request-response sang sự kiện thời gian thực.

Task 7: Setup WebSocket Server (FastAPI)

Xây dựng ConnectionManager để quản lý các socket theo room_code.

Middleware xác thực Token qua URL query string.

Task 8: WebSocket Service (Frontend)

Chuyển từ socket.io-client sang native WebSocket.

Viết hàm xử lý dispatch event (PLAYER_JOINED, PLAYER_LEFT).

Task 9: Game Flow Control

POST /rooms/{code}/start: Khởi tạo game_questions từ Quiz gốc.

Phát event GAME_STARTED qua WS để FE tự động chuyển màn hình Gameplay.

GIAI ĐOẠN 4: GAMEPLAY & LOGIC TÍNH ĐIỂM
Mục tiêu: Xử lý tương tác chính trong trò chơi.

Task 10: Answer Submission & Validation

API POST /answers: Kiểm tra đáp án đúng/sai, tính điểm dựa trên thời gian trả lời.

Ghi đè/Chặn nếu user trả lời lại cùng một câu.

Task 11: Realtime Leaderboard

Mỗi khi có người trả lời, tính toán lại hạng và phát event LEADERBOARD_UPDATED.

Task 12: Question Transition

API next-question: Chỉ Host được gọi, thay đổi current_question_order và phát event QUESTION_CHANGED.

GIAI ĐOẠN 5: KẾT THÚC & TỔNG KẾT (RESULT & CLEANUP)
Mục tiêu: Lưu trữ kết quả cuối cùng và dọn dẹp tài nguyên.

Task 13: Game Finish Logic

API finish: Tổng hợp từ player_answers vào game_results.

Cập nhật play_count cho Quiz và total_score cho User Profile.

Task 14: Result Screen Integration

FE gọi API results để hiển thị Podium (Top 3) và bảng điểm chi tiết của cá nhân.

Task 15: Room Cleanup

Đóng kết nối WS, chuyển trạng thái room về FINISHED hoặc xóa room tạm.

TÓM TẮT KIẾN TRÚC LUỒNG DỮ LIỆU
Lời khuyên cho Vinh:

Alembic: Bạn hãy dùng Alembic ngay từ Task 1 để quản lý version DB, vì trong quá trình làm gameplay chắc chắn sẽ phát sinh thêm cột.

Authentication: Vì dùng native WS, đừng quên truyền token qua URL (ví dụ: ws://.../ws/game/123?token=abc) vì WS không gửi được Custom Header như REST.

Logging: Khi làm Realtime, hãy log kỹ các event type để biết BE đã phát đi mà FE chưa nhận được hay do logic FE xử lý sai.