app/
├── api/ # Tầng giao tiếp (Giao diện lập trình)
│ └── v1/ # Versioning cho API
│ ├── api.py # Router tổng hợp tất cả các endpoint của v1
│ └── endpoints/ # Chi tiết các router theo module
│ ├── auth.py # Đăng ký, Đăng nhập, Refresh Token
│ ├── quizzes.py # CRUD các bộ câu hỏi
│ ├── rooms/ # Quản lý tạo/tham gia phòng
│ └── users.py # Thông tin cá nhân, thống kê (Bonus)[cite: 2]
├── core/ # Cấu hình và tiện ích hệ thống (Shared)
│ ├── config.py # Đọc biến từ .env bằng Pydantic[cite: 1]
│ ├── exceptions.py # Định nghĩa Custom Exceptions (AppError, AuthError)
│ ├── logging.py # Cấu hình log tập trung
│ ├── security.py # Xử lý JWT và hash mật khẩu[cite: 1, 2]
│ └── monitor.py # Logic tracking sự kiện quan trọng
├── db/ # Tầng kết nối Database (PostgreSQL)
│ ├── base.py # Nơi import tất cả models để Alembic nhận diện[cite: 1, 2]
│ ├── base_class.py # Lớp Base cho các SQLAlchemy models
│ └── session.py # Tạo engine và session (DI)[cite: 1, 2]
├── middleware/ # Các bộ lọc xử lý trung gian
│ ├── exception_handler.py # Global Exception Handler (Bắt lỗi toàn cục)
│ └── monitor_middleware.py # Log thông tin request/response (Monitoring)
├── models/ # Tầng dữ liệu (SQLAlchemy Models)[cite: 1, 2]
│ ├── game/ # Models liên quan đến game và phòng chơi
│ │ ├── chat_messages.py # Lưu lịch sử chat trong game
│ │ ├── game_questions.py # Câu hỏi trong một trận game cụ thể
│ │ ├── game_results.py # Kết quả và điểm số của trận game
│ │ ├── game_rooms.py # Thông tin phòng chơi
│ │ ├── player_answers.py # Câu trả lời của người chơi
│ │ └── room_players.py # Danh sách người chơi trong phòng
│ ├── quiz/ # Models liên quan đến bộ câu hỏi
│ │ ├── answer_options.py # Các lựa chọn trả lời
│ │ ├── questions.py # Câu hỏi (tổng quát)
│ │ └── quizzes.py # Bộ câu hỏi
│ ├── user_auth/ # Models liên quan đến xác thực người dùng
│ │ ├── refresh_tokens.py # Token refresh
│ │ └── users.py # Thông tin người dùng
│ └── user_stat/ # Models liên quan đến thống kê người dùng
│ └── user_stats.py # Thống kê và lịch sử của người dùng
├── schemas/ # Tầng xác thực dữ liệu (Pydantic Models)
│ ├── auth.py
│ ├── quiz.py
│ └── room.py
├── services/ # TẦNG LOGIC NGHIỆP VỤ (Nơi viết Unit Test chính)
│ ├── auth_service.py
│ ├── quiz_service.py # Xử lý logic câu hỏi và tính điểm[cite: 1, 2]
│ ├── redis_manager.py # Quản lý tập trung Redis (Caching/Realtime)[cite: 1, 2]
│ └── game_service.py # Điều phối logic của trận đấu
├── websockets/ # Xử lý kết nối Realtime[cite: 1, 2]
│ ├── connection_manager.py # Quản lý danh sách kết nối đang online
│ └── game_socket.py # Xử lý gửi/nhận sự kiện trong game[cite: 1, 2]
└── main.py # File entry point khởi chạy FastAPI app[cite: 1]
