# Quiz Battle

Quiz Battle là một ứng dụng thi đấu quiz theo thời gian thực, gồm backend FastAPI, PostgreSQL, Redis và cơ chế xác thực bằng JWT. Repository hiện tại tập trung vào phần backend và hạ tầng chạy local bằng Docker.

## Tổng quan

Backend đã có sẵn các thành phần chính sau:

- Đăng ký, đăng nhập, làm mới access token và đăng xuất.
- Xác thực JWT bằng access token và refresh token.
- Lưu refresh token vào PostgreSQL để có thể vô hiệu hóa khi logout.
- Khởi tạo schema tự động khi backend khởi động.
- Hỗ trợ CORS cho frontend local.
- Có script kiểm tra kết nối PostgreSQL.

## Công nghệ sử dụng

- Python 3.10+
- FastAPI
- Uvicorn
- SQLAlchemy 2.x
- PostgreSQL
- Redis
- JWT với `python-jose`
- Hash mật khẩu với `passlib` + `argon2`
- Docker và Docker Compose

## Cấu trúc dự án

```text
quiz-battle/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api.py
│   │   │       └── endpoints/
│   │   │           └── auth.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── exceptions.py
│   │   │   └── security.py
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── websockets/
│   ├── requirements.txt
│   ├── environment.yml
│   ├── test_db_connection.py
│   └── Dockerfile
├── docker-compose.yml
├── DOCKER_SETUP.md
└── README.md
```

## Kiến trúc hiện tại

```text
Frontend (port 3000)
		↓
FastAPI Backend (port 8000)
		↓
PostgreSQL (port 5432)
Redis (port 6379)
```

## Chức năng backend hiện có

### Xác thực

- Đăng ký người dùng mới.
- Đăng nhập bằng username và password.
- Trả về `access_token`, `refresh_token` và `expires_in`.
- Làm mới access token bằng refresh token.
- Đăng xuất và xóa toàn bộ refresh token của user.

### Bảo mật

- Password được hash bằng Argon2.
- Access token và refresh token được ký bằng cùng `SECRET_KEY` và `ALGORITHM`.
- Access token mang claim `sub` là UUID của user và claim `exp` là thời điểm hết hạn.
- Dependency xác thực đọc `Authorization: Bearer <token>`.

### Hạ tầng

- Tự tạo bảng khi backend start.
- Có Redis service sẵn cho các tính năng realtime / caching trong tương lai.
- Có cấu trúc websocket và service game/quiz để mở rộng sau.

## API hiện có

Base URL: `/api/v1`

### Auth

#### `POST /auth/register`

Tạo tài khoản mới.

Request body:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

#### `POST /auth/login`

Đăng nhập và nhận token.

Request body:

```json
{
  "username": "alice",
  "password": "secret123"
}
```

#### `POST /auth/refresh`

Nhận access token mới từ refresh token.

Request body:

```json
{
  "refresh_token": "<refresh_token>"
}
```

#### `POST /auth/logout`

Đăng xuất user hiện tại.

Header bắt buộc:

```http
Authorization: Bearer <access_token>
```

### System

- `GET /`
- `GET /health`

## Access token chứa gì

Access token hiện tại chỉ chứa các thông tin tối thiểu để xác thực và phân quyền theo chủ sở hữu:

- `sub`: UUID của user.
- `exp`: thời điểm token hết hạn.

Ví dụ payload sau khi decode:

```json
{
  "sub": "7b6b3d1a-0d1e-4c1a-9b7b-2d0f8d1c0e9a",
  "exp": 1715083200
}
```

Với thiết kế này, server có thể so sánh UUID được decode với các cột như `created_by`, `host_id`, hoặc `user_id` để kiểm tra quyền sở hữu tài nguyên.

## Cài đặt local

### 1. Cài Python và tạo môi trường ảo

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
```

Trên PowerShell:

```powershell
cd backend
.venv\Scripts\Activate.ps1
```

### 2. Cài dependencies

```bash
pip install -r requirements.txt
```

### 3. Cấu hình biến môi trường

Tạo file `backend/.env` và cấu hình tối thiểu:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/quiz_battle
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=quiz_battle
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

REDIS_URL=redis://localhost:6379/0

DEBUG=true
SECRET_KEY=change-this-secret

ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALGORITHM=HS256

API_V1_STR=/api/v1
PROJECT_NAME=Quiz Battle
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:8000"]
```

### 4. Chạy backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Kiểm tra API

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

## Chạy với Docker

### 1. Khởi động database, Redis và backend

```bash
docker-compose up -d
```

### 2. Xem trạng thái container

```bash
docker-compose ps
```

### 3. Tắt toàn bộ dịch vụ

```bash
docker-compose down
```

### 4. Reset dữ liệu PostgreSQL

```bash
docker-compose down -v
docker-compose up -d
```

## Kiểm tra kết nối database

Từ thư mục `backend/`:

```bash
python test_db_connection.py
```

Nếu kết nối thành công, script sẽ in thông báo xác nhận PostgreSQL đã sẵn sàng.

## Biến môi trường quan trọng

- `DATABASE_URL`: chuỗi kết nối PostgreSQL.
- `SECRET_KEY`: khóa ký JWT.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: thời gian sống của access token.
- `REFRESH_TOKEN_EXPIRE_DAYS`: thời gian sống của refresh token.
- `ALLOWED_ORIGINS`: danh sách origin được phép gọi API.
- `REDIS_URL`: kết nối Redis.

## Ghi chú triển khai hiện tại

- `app/api/v1/api.py` hiện mới include router auth.
- Các file `quizzes.py`, `rooms.py`, `users.py` đã có trong cấu trúc nhưng chưa expose endpoint thực tế.
- Phần model và websocket đã được chuẩn bị để mở rộng tính năng quiz realtime sau này.

## Troubleshooting

### Port 5432 hoặc 8000 đang bị chiếm

- Đổi port trong `docker-compose.yml`.
- Hoặc tắt service đang dùng port đó.

### Không kết nối được PostgreSQL

- Kiểm tra Docker Desktop đang chạy.
- Kiểm tra `DATABASE_URL` trong `.env` có khớp với container DB.
- Chờ vài giây để PostgreSQL khởi động hoàn tất.

### Lỗi JWT không hợp lệ

- Kiểm tra `SECRET_KEY` giữa môi trường chạy và token đã tạo.
- Kiểm tra token đã hết hạn chưa.
- Đảm bảo header có dạng `Authorization: Bearer <token>`.

## Hướng phát triển tiếp theo

- Hoàn thiện CRUD quiz.
- Hoàn thiện room management và game flow.
- Tích hợp websocket cho realtime game session.
- Bổ sung role/permission nếu cần phân quyền nâng cao hơn ownership check.
