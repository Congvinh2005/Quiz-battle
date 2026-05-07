# 🐘 PostgreSQL + Docker Setup Guide

## 📋 Các bước thiết lập

### 1. **Cập nhật password trong `.env` (bắt buộc!)**

Mở `backend/.env` và thay đổi:

```
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/quiz_battle
```

**Ví dụ:**

```
POSTGRES_PASSWORD=mysecurepass123
DATABASE_URL=postgresql://postgres:mysecurepass123@localhost:5432/quiz_battle
```

### 2. **Khởi động PostgreSQL với Docker**

Chạy lệnh này từ thư mục gốc dự án:

```bash
docker-compose up -d
```

**Kiểm tra containers đang chạy:**

```bash
docker-compose ps
```

Bạn sẽ thấy:

```
NAME                COMMAND                  SERVICE      STATUS
quiz_battle_db      "docker-entrypoint..."   db           Up ...
quiz_battle_redis   "redis-server"           redis        Up ...
```

### 3. **Test kết nối Database**

Từ thư mục `backend/`, chạy:

```bash
python test_db_connection.py
```

**Kết quả thành công:**

```
✅ PostgreSQL connection successful!
✅ Connected to database: quiz_battle
```

### 4. **Khởi động Backend Server**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔧 Các lệnh Docker hữu ích

### Dừng containers

```bash
docker-compose down
```

### Xem logs của PostgreSQL

```bash
docker-compose logs -f db
```

### Truy cập PostgreSQL CLI

```bash
docker exec -it quiz_battle_db psql -U postgres -d quiz_battle
```

### Xóa tất cả data (reset database)

```bash
docker-compose down -v
docker-compose up -d
```

## 🚨 Troubleshooting

### ❌ Port 5432 đã được sử dụng

```bash
# Tìm process đang dùng port 5432
netstat -ano | findstr :5432

# Hoặc đổi port trong docker-compose.yml
# Thay "5432:5432" bằng "5433:5432"
```

### ❌ Connection refused

- Kiểm tra Docker đang chạy: `docker ps`
- Chờ 5-10 giây cho PostgreSQL khởi động
- Kiểm tra password trong `.env` có khớp với `docker-compose.yml`

### ❌ Database không tồn tại

PostgreSQL sẽ tự tạo database `quiz_battle` lần đầu tiên

---

## 📁 Cấu trúc kết nối

```
Next.js Frontend (port 3000)
         ↓
FastAPI Backend (port 8000)
         ↓
PostgreSQL Database (port 5432) + Redis (port 6379)
```

Bạn đã sẵn sàng! Tiếp theo build API đăng ký/đăng nhập.
