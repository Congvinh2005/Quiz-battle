# Kế hoạch triển khai Đăng nhập Google (OAuth 2.0) - QuizBattle

Dưới đây là các bước chi tiết cần triển khai để tích hợp tính năng đăng nhập Google OAuth 2.0 vào ứng dụng QuizBattle. Quá trình triển khai sẽ được thực hiện từng bước, sau khi hoàn thành mỗi bước sẽ được đánh dấu và đợi duyệt trước khi làm bước tiếp theo.

## Danh sách Task cần thực hiện

- [x] **Task 1: Cấu hình biến môi trường (Environment Variables & Config)**
  - [x] Thêm các cấu hình Google OAuth trong Backend (`backend/app/core/config.py` và `backend/.env`).
  - [x] Thêm các cấu hình Google OAuth trong Frontend (tạo file `frontend/.env.local`).

- [x] **Task 2: Phát triển Backend API trao đổi mã code lấy Token**
  - [x] Định nghĩa Pydantic schema cho request chứa authorization code Google.
  - [x] Viết API `/api/v1/auth/google` trong `backend/app/api/v1/endpoints/auth.py`.
  - [x] Tích hợp logic: Gọi Google OAuth API để đổi `code` lấy thông tin User (email, name, avatar).
  - [x] Kiểm tra User trong database: Nếu chưa có thì tự động tạo User mới (với username duy nhất, mật khẩu ngẫu nhiên), nếu có rồi thì đăng nhập. Tạo và trả về JWT `access_token` cùng `refresh_token` chuẩn của hệ thống.

- [x] **Task 3: Cập nhật Frontend Auth Service & Context**
  - [x] Thêm API call `loginWithGoogle` trong `frontend/services/authService.ts`.
  - [x] Cập nhật hoặc hỗ trợ thiết lập state đăng nhập sau khi nhận token thành công trong `frontend/contexts/AuthContext.tsx`.

- [x] **Task 4: Thiết kế trang Callback đón nhận chuyển hướng từ Google**
  - [x] Tạo trang `frontend/app/auth/callback/page.tsx`.
  - [x] Thiết kế UI Loading cao cấp, mượt mà (sử dụng hiệu ứng gradient động và kính mờ - Glassmorphism) trong lúc trao đổi token và chuyển hướng về `/dashboard`.

- [x] **Task 5: Kích hoạt nút Đăng nhập Google trên giao diện Login**
  - [x] Cập nhật nút "Tiếp tục với Google" trong `frontend/components/screens/LoginScreen.tsx` để dẫn sang trang đăng nhập/ủy quyền Google OAuth 2.0.

- [x] **Task 6: Kiểm thử và hoàn thiện toàn bộ luồng đăng nhập**
  - [x] Kiểm tra luồng chạy từ việc nhấn nút, chuyển hướng Google, ủy quyền, callback và quay lại Dashboard thành công.

