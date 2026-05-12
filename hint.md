# Ke hoach task frontend QuizBattle

## Giai doan 0 - Can chinh
- Xem nguon UI trong /quizbattle (HTML/CSS/JS)
- Xac nhan API backend hien co
- Chot cach viet style (CSS modules hay Tailwind override)

## Giai doan 1 - Dung UI (giong /quizbattle)
1) Style chung
- Import base.css vao frontend styles
- Map font, mau sac, cac class dung chung

2) Navigation
- Dung lai nav theo shared.js
- Logic tab active theo route

3) Trang Auth
- Login (layout + form + CTA)
- Register (layout + form + thanh do manh mat khau)

4) Dashboard
- Hero + stats + quiz cards
- Sidebar join phong + activity feed

5) Quiz Editor
- Sidebar danh sach cau hoi
- Panel chinh + options
- Khoi preview

6) Tao phong
- Danh sach quiz
- Cau hinh phong + preview

7) Lobby
- Grid nguoi choi + ma phong
- Chat + nut bat dau

8) Gameplay
- Topbar + timer
- Cau hoi + dap an
- Leaderboard + chat

9) Ket qua
- Confetti + podium
- Bang xep hang day du + actions

## Giai doan 2 - Ket noi du lieu (Backend)
1) Auth
- Register / login / refresh / logout
- Luu token + user profile

2) Quan ly Quiz
- List quiz (cua toi + public)
- Tao / sua / xoa quiz
- Them / sua cau hoi + dap an

3) Flow phong
- Tao phong tu quiz duoc chon
- Join phong bang ma
- Lay danh sach nguoi choi

4) Realtime game
- Ket noi WebSocket
- Start game
- Nhan cau hoi / timer
- Gui dap an
- Cap nhat leaderboard realtime

5) Ket qua
- Lay ket qua cuoi
- Render leaderboard
- Luu thong ke

## Giai doan 3 - QA + Hoan thien
- State loading / error / empty
- Responsive mobile
- Kiem tra accessibilty co ban
- Build + lint

## Giai doan 4 - Trien khai
- Chay docker compose
- Cau hinh env production
- Smoke test cuoi
