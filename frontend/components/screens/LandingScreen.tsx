"use client";

const LANDING_HTML = `<!DOCTYPE html>

<html class="light" lang="vi"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>QuizBattle: Trải nghiệm thi đấu trắc nghiệm đỉnh cao</title>
<meta content="Nền tảng thi đấu trắc nghiệm trực tuyến hàng đầu. Kết nối, cạnh tranh và nâng tầm kiến thức với QuizBattle." name="description"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "secondary-fixed": "#6ffbbe",
                      "surface-variant": "#d9e3f6",
                      "error-container": "#ffdad6",
                      "tertiary": "#704500",
                      "on-primary-fixed-variant": "#5a00c6",
                      "secondary-container": "#6cf8bb",
                      "outline-variant": "#ccc3d8",
                      "inverse-primary": "#d2bbff",
                      "surface-bright": "#f8f9ff",
                      "on-primary": "#ffffff",
                      "on-tertiary-fixed-variant": "#653e00",
                      "on-background": "#121c2a",
                      "inverse-surface": "#27313f",
                      "surface-dim": "#d0dbed",
                      "on-secondary-fixed": "#002113",
                      "tertiary-container": "#905b00",
                      "on-surface-variant": "#4a4455",
                      "outline": "#7b7487",
                      "on-primary-container": "#ede0ff",
                      "primary-container": "#7c3aed",
                      "on-tertiary": "#ffffff",
                      "surface-tint": "#732ee4",
                      "secondary": "#006c49",
                      "surface-container-lowest": "#ffffff",
                      "on-error": "#ffffff",
                      "surface-container-high": "#dee9fc",
                      "primary-fixed-dim": "#d2bbff",
                      "tertiary-fixed-dim": "#ffb95f",
                      "error": "#ba1a1a",
                      "on-secondary-container": "#00714d",
                      "surface-container": "#e6eeff",
                      "on-tertiary-fixed": "#2a1700",
                      "on-secondary-fixed-variant": "#005236",
                      "on-secondary": "#ffffff",
                      "on-tertiary-container": "#ffe1c0",
                      "secondary-fixed-dim": "#4edea3",
                      "surface-container-highest": "#d9e3f6",
                      "inverse-on-surface": "#eaf1ff",
                      "background": "#f8f9ff",
                      "surface-container-low": "#eff4ff",
                      "tertiary-fixed": "#ffddb8",
                      "surface": "#f8f9ff",
                      "primary-fixed": "#eaddff",
                      "on-primary-fixed": "#25005a",
                      "on-surface": "#121c2a",
                      "primary": "#630ed4",
                      "on-error-container": "#93000a"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "xl": "32px",
                      "margin-mobile": "16px",
                      "2xl": "48px",
                      "md": "16px",
                      "sm": "8px",
                      "3xl": "64px",
                      "gutter": "16px",
                      "lg": "24px",
                      "margin-desktop": "40px",
                      "xs": "4px",
                      "base": "4px"
              },
              "fontFamily": {
                      "display-lg": ["Lexend"],
                      "label-lg": ["Inter"],
                      "label-md": ["Inter"],
                      "headline-lg": ["Lexend"],
                      "headline-md": ["Lexend"],
                      "body-md": ["Inter"],
                      "headline-lg-mobile": ["Lexend"],
                      "body-lg": ["Inter"]
              },
              "fontSize": {
                      "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "label-lg": ["14px", {"lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "600"}],
                      "label-md": ["12px", {"lineHeight": "16px", "fontWeight": "500"}],
                      "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "700"}],
                      "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                      "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                      "headline-lg-mobile": ["28px", {"lineHeight": "36px", "fontWeight": "700"}],
                      "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}]
              }
            },
          },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .quiz-card-shadow {
            box-shadow: 0 2px 4px rgba(124, 58, 237, 0.05);
        }
        .quiz-card-shadow:hover {
            box-shadow: 0 8px 16px rgba(124, 58, 237, 0.1);
        }
        .btn-primary {
            background-color: #7C3AED;
            color: white;
            border-bottom: 4px solid #5B21B6;
            transition: all 0.1s;
        }
        .btn-primary:active {
            transform: scale(0.98);
            border-bottom-width: 0;
            margin-top: 4px;
        }
            .btn-primary-3d {
                background-color: #7C3AED;
                box-shadow: 0 4px 0 0 #5B21B6;
                transition: all 0.1s ease;
            }
            .btn-primary-3d:active {
                transform: translateY(2px);
                box-shadow: 0 2px 0 0 #5B21B6;
            }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background font-body-md overflow-x-hidden">
<header class="bg-surface/80 backdrop-blur-md shadow-sm full-width top-0 sticky z-50">
<div class="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-[1280px] mx-auto">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-primary" data-icon="sports_esports">sports_esports</span>
<span class="font-display-lg text-headline-md text-primary font-bold tracking-tighter">QuizBattle</span>
</div>
<nav class="hidden md:flex items-center gap-lg">
<a class="text-primary font-bold border-b-2 border-primary font-label-lg hover:text-primary transition-colors duration-200" href="#">Home</a>
<a class="text-on-surface-variant font-label-lg hover:text-primary transition-colors duration-200" href="#features">Features</a>
<a class="text-on-surface-variant font-label-lg hover:text-primary transition-colors duration-200" href="#how-it-works">How It Works</a>
<a class="text-on-surface-variant font-label-lg hover:text-primary transition-colors duration-200" href="#ranking">Ranking</a>
<a class="text-on-surface-variant font-label-lg hover:text-primary transition-colors duration-200" href="#community">Community</a>
</nav>
<a class="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-lg font-bold active:scale-95 transition-transform" href="/login" target="_top" rel="noreferrer">
                Play Now
            </a>
</div>
</header>
<main>
<section class="relative overflow-hidden pt-2xl pb-3xl px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
<div class="grid md:grid-cols-2 gap-xl items-center">
<div class="z-10">
<div class="inline-flex items-center gap-xs bg-secondary-container text-on-secondary-container px-md py-1.5 rounded-full font-label-md text-label-md mb-md">
<span class="material-symbols-outlined text-[18px]">workspace_premium</span>
                        Trải nghiệm giáo dục thế hệ mới
                    </div>
<h1 class="font-display-lg text-display-lg text-on-background mb-md">
                        Quiz Battle: <span class="text-primary">Trải nghiệm thi đấu</span> trắc nghiệm đỉnh cao
                    </h1>
<p class="font-body-lg text-body-lg text-on-surface-variant mb-xl">
                        Thách thức trí tuệ, chinh phục bảng xếp hạng và kết nối với hàng triệu người chơi trong những trận đấu kịch tính thời gian thực.
                    </p>
<div class="flex flex-wrap gap-md pt-md">
<a class="btn-primary-3d text-white px-2xl py-md rounded-xl font-bold font-headline-md text-headline-md flex items-center gap-sm" href="/login" target="_top" rel="noreferrer">
                            Bắt đầu ngay
                            <span class="material-symbols-outlined">rocket_launch</span>
</a>
<button class="border-2 border-primary text-primary px-2xl py-md rounded-xl font-bold font-headline-md text-headline-md hover:bg-primary-fixed transition-colors">
                            Xem demo
                        </button>
</div>
</div>
<div class="relative">
<div class="absolute -z-10 w-full h-full bg-primary-container/20 blur-3xl rounded-full scale-110"></div>
<img alt="Quiz Battle Gameplay" class="rounded-2xl shadow-2xl border-4 border-white" data-alt="A vibrant and energetic 3D digital illustration of multiple mobile phone screens showing a colorful quiz interface. The screens feature purple and cyan buttons, progress bars, and cheerful avatars. The background is a clean, bright minimalist studio with soft, professional lighting and purple accent glows, reflecting a modern gamified educational aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJx8I5nH22M3BirK3KZwd88XeraCZ_w30wValeLCWBD3d-4nn69MGNWniKaymRI5fn-e5n4MubR0dR9V8-xIbEt_JXu36wtcrVSBpisI_u7dp1ZAq2uqwRmlmSMgAr1MIglX4134-ZUAgF8js2tTwRuvyAmviMffZaFbYLkCHjnczVoGWLwHtMfeEHlFauRFnXd8gBThEvg9TSWhou9q8_3kYyza5Nb6foWLeAhCSwsgXaLzuTwaSPHR9oy0HpulfMNZibIhknLF4"/>
</div>
</div>
</section>
<section class="py-3xl bg-surface-container-low px-margin-mobile md:px-margin-desktop" id="features">
<div class="max-w-[1280px] mx-auto">
<div class="text-center mb-3xl">
<h2 class="font-headline-lg text-headline-lg text-on-background mb-base">Tính năng vượt trội</h2>
<p class="text-on-surface-variant">Khám phá sức mạnh của QuizBattle để nâng tầm kiến thức</p>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
<article class="bg-surface-container-lowest p-lg rounded-2xl quiz-card-shadow transition-all group">
<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-md group-hover:bg-primary transition-colors">
<span class="material-symbols-outlined text-primary group-hover:text-white" data-icon="group">group</span>
</div>
<h3 class="font-headline-md text-headline-md mb-xs">Multiplayer</h3>
<p class="text-on-surface-variant font-body-md">Thi đấu cùng hàng ngàn người chơi khác cùng lúc.</p>
</article>
<article class="bg-surface-container-lowest p-lg rounded-2xl quiz-card-shadow transition-all group">
<div class="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-md group-hover:bg-secondary transition-colors">
<span class="material-symbols-outlined text-secondary group-hover:text-white" data-icon="palette">palette</span>
</div>
<h3 class="font-headline-md text-headline-md mb-xs">Beautiful UI</h3>
<p class="text-on-surface-variant font-body-md">Giao diện hiện đại, mượt mà và đầy cảm hứng.</p>
</article>
<article class="bg-surface-container-lowest p-lg rounded-2xl quiz-card-shadow transition-all group">
<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-md group-hover:bg-primary transition-colors">
<span class="material-symbols-outlined text-primary group-hover:text-white" data-icon="leaderboard">leaderboard</span>
</div>
<h3 class="font-headline-md text-headline-md mb-xs">Live Ranking</h3>
<p class="text-on-surface-variant font-body-md">Cập nhật thứ hạng ngay lập tức sau mỗi câu trả lời.</p>
</article>
<article class="bg-surface-container-lowest p-lg rounded-2xl quiz-card-shadow transition-all group">
<div class="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-md group-hover:bg-secondary transition-colors">
<span class="material-symbols-outlined text-secondary group-hover:text-white" data-icon="bolt">bolt</span>
</div>
<h3 class="font-headline-md text-headline-md mb-xs">Instant Feedback</h3>
<p class="text-on-surface-variant font-body-md">Nhận kết quả và giải thích đáp án ngay tức thì.</p>
</article>
<article class="bg-surface-container-lowest p-lg rounded-2xl quiz-card-shadow transition-all group">
<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-md group-hover:bg-primary transition-colors">
<span class="material-symbols-outlined text-primary group-hover:text-white" data-icon="quiz">quiz</span>
</div>
<h3 class="font-headline-md text-headline-md mb-xs">Smart Quiz Creator</h3>
<p class="text-on-surface-variant font-body-md">Tự tạo bộ câu hỏi nhanh chóng với công nghệ AI.</p>
</article>
<article class="bg-surface-container-lowest p-lg rounded-2xl quiz-card-shadow transition-all group">
<div class="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-md group-hover:bg-secondary transition-colors">
<span class="material-symbols-outlined text-secondary group-hover:text-white" data-icon="security">security</span>
</div>
<h3 class="font-headline-md text-headline-md mb-xs">Anti-Cheat</h3>
<p class="text-on-surface-variant font-body-md">Hệ thống bảo mật tối cao, đảm bảo công bằng.</p>
</article>
<article class="bg-surface-container-lowest p-lg rounded-2xl quiz-card-shadow transition-all group">
<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-md group-hover:bg-primary transition-colors">
<span class="material-symbols-outlined text-primary group-hover:text-white" data-icon="devices">devices</span>
</div>
<h3 class="font-headline-md text-headline-md mb-xs">Multi-platform</h3>
<p class="text-on-surface-variant font-body-md">Chơi trên web, tablet hoặc điện thoại mọi lúc.</p>
</article>
<article class="bg-surface-container-lowest p-lg rounded-2xl quiz-card-shadow transition-all group">
<div class="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-md group-hover:bg-secondary transition-colors">
<span class="material-symbols-outlined text-secondary group-hover:text-white" data-icon="insights">insights</span>
</div>
<h3 class="font-headline-md text-headline-md mb-xs">Detailed Analytics</h3>
<p class="text-on-surface-variant font-body-md">Phân tích điểm mạnh, điểm yếu của từng người chơi.</p>
</article>
</div>
</div>
</section>
<section class="py-3xl px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto" id="how-it-works">
<h2 class="font-headline-lg text-headline-lg text-center mb-3xl">Cách thức tham gia</h2>
<div class="flex flex-col gap-lg">
<div class="flex flex-col md:flex-row items-center gap-xl">
<div class="flex-1 flex justify-center md:justify-end">
<span class="text-[120px] font-bold text-primary/10 leading-none select-none">01</span>
</div>
<div class="flex-1">
<h3 class="font-headline-md text-headline-md text-primary mb-xs">Đăng ký tài khoản</h3>
<p class="text-body-lg text-on-surface-variant">Tạo tài khoản miễn phí chỉ trong 30 giây để lưu lại hành trình chinh phục.</p>
</div>
</div>
<div class="flex flex-col md:flex-row-reverse items-center gap-xl">
<div class="flex-1 flex justify-center md:justify-start">
<span class="text-[120px] font-bold text-secondary/10 leading-none select-none">02</span>
</div>
<div class="flex-1 md:text-right">
<h3 class="font-headline-md text-headline-md text-secondary mb-xs">Chọn phòng đấu</h3>
<p class="text-body-lg text-on-surface-variant">Tìm kiếm hoặc tạo phòng thi với chủ đề bạn yêu thích nhất.</p>
</div>
</div>
<div class="flex flex-col md:flex-row items-center gap-xl">
<div class="flex-1 flex justify-center md:justify-end">
<span class="text-[120px] font-bold text-primary/10 leading-none select-none">03</span>
</div>
<div class="flex-1">
<h3 class="font-headline-md text-headline-md text-primary mb-xs">Bắt đầu Quiz</h3>
<p class="text-body-lg text-on-surface-variant">Trả lời các câu hỏi nhanh nhất có thể để chiếm ưu thế điểm số.</p>
</div>
</div>
<div class="flex flex-col md:flex-row-reverse items-center gap-xl">
<div class="flex-1 flex justify-center md:justify-start">
<span class="text-[120px] font-bold text-secondary/10 leading-none select-none">04</span>
</div>
<div class="flex-1 md:text-right">
<h3 class="font-headline-md text-headline-md text-secondary mb-xs">Nhận thưởng</h3>
<p class="text-body-lg text-on-surface-variant">Tích lũy điểm kinh nghiệm và huy hiệu sau mỗi chiến thắng.</p>
</div>
</div>
<div class="flex flex-col md:flex-row items-center gap-xl">
<div class="flex-1 flex justify-center md:justify-end">
<span class="text-[120px] font-bold text-primary/10 leading-none select-none">05</span>
</div>
<div class="flex-1">
<h3 class="font-headline-md text-headline-md text-primary mb-xs">Lên hạng</h3>
<p class="text-body-lg text-on-surface-variant">Cạnh tranh vị trí số 1 trên bảng xếp hạng vinh danh toàn cầu.</p>
</div>
</div>
</div>
</section>
<section class="py-3xl bg-primary text-white overflow-hidden">
<div class="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop">
<div class="grid grid-cols-1 md:grid-cols-12 gap-lg">
<div class="md:col-span-8 bg-white/10 backdrop-blur-md p-xl rounded-3xl border border-white/20">
<h2 class="font-headline-lg text-display-lg mb-md leading-tight">Speed = Points <br/><span class="text-secondary-fixed">Phản xạ là chìa khóa</span></h2>
<p class="font-body-lg opacity-90 mb-xl">Trong QuizBattle, không chỉ kiến thức mà tốc độ mới làm nên nhà vô địch. Bạn trả lời càng nhanh, điểm số nhân lên càng cao!</p>
<div class="grid grid-cols-2 gap-md">
<div class="bg-white/5 p-md rounded-xl">
<span class="material-symbols-outlined text-secondary-fixed text-3xl mb-xs" data-icon="timer">timer</span>
<p class="font-bold">Dưới 3 giây</p>
<p class="text-sm opacity-80">Combo x3 Points</p>
</div>
<div class="bg-white/5 p-md rounded-xl">
<span class="material-symbols-outlined text-secondary-fixed text-3xl mb-xs" data-icon="trending_up">trending_up</span>
<p class="font-bold">Streak liên hoàn</p>
<p class="text-sm opacity-80">Mở khóa Buff đặc biệt</p>
</div>
</div>
</div>
<div class="md:col-span-4 bg-secondary-fixed text-on-secondary-fixed p-xl rounded-3xl flex flex-col justify-between">
<div>
<span class="material-symbols-outlined text-4xl mb-md" data-icon="trophy">trophy</span>
<h3 class="font-headline-md mb-xs">Hệ thống Ranking</h3>
<p class="opacity-80">Phân bậc từ Đồng đến Kim Cương. Thách thức giới hạn bản thân mỗi ngày.</p>
</div>
<button class="mt-xl bg-on-secondary-fixed text-secondary-fixed font-bold py-md rounded-xl active:scale-95 transition-transform">Khám phá Rank</button>
</div>
</div>
</div>
</section>
<section class="py-3xl px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto">
<h2 class="font-headline-lg text-center mb-3xl">Dành cho mọi đối tượng</h2>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
<div class="bg-surface-container-high p-lg rounded-2xl text-center">
<img alt="Lớp học" class="w-full h-40 object-cover rounded-xl mb-md" data-alt="A bright and airy classroom scene where students are excitedly using tablets and phones to participate in a digital quiz. The lighting is warm and natural, coming from large windows. The overall mood is one of joyful learning and high engagement, with the QuizBattle interface visible on the device screens in vibrant purple and teal." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4-A9KWLBqmkKf4Cc6li3suHqp6r6_FsdxcTaaVja3a92JQcSSIG43algTMqUjQg2zortWr-ldlQCuWjSuFzaUzNVbDF98YDWHG2X-8rGz9V2R47sTwt-eTNjM9QEG4UOXd1YnL7swaWBB1nYZ0NKhCsGkqRvUqouv5rNqEck4akNe-a5yhBcA6MQupYObmtLLGjtfzU3COsaP3PlckNpCn4L72UWubqO87S3RbdQuJ-pf98ENIt0C1pJrNuGMfurbYGyB5rOcCYQ"/>
<h3 class="font-headline-md mb-xs">Lớp học</h3>
<p class="text-sm text-on-surface-variant">Kích thích học tập, ôn bài không còn nhàm chán.</p>
</div>
<div class="bg-surface-container-high p-lg rounded-2xl text-center">
<img alt="Nhóm" class="w-full h-40 object-cover rounded-xl mb-md" data-alt="A diverse group of young adults sitting together on a modern sofa in a brightly lit living room, laughing and looking at their smartphones while playing a competitive quiz game. The environment is casual and warm with soft ambient lighting, focused on a social and fun gaming experience." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxqkKOB3zj54XCzSYp3m1DXm3TOWUSCSbEcJt0SwKdLSDh1oYHbYYmycTHWMWVLKuyGa35NOxrJaWqZ0ZI7Y-sg3fqOaX9V6IrdnoIxorZXvF1F3rOQ0pI7pog8WoWswhdL6j5Uk2ubLUkhWbUmjfDWbBveOnBw9RunRrHo7MxBpwTY2IInbTwZF20SHruKOxGQGH9zh4ZHlXeG2z7njDTf2JUqZCCValmezH0HkS0A7eGCp2RpPV3AYIb4nhiXQOSOSpAPtbYcaA"/>
<h3 class="font-headline-md mb-xs">Nhóm</h3>
<p class="text-sm text-on-surface-variant">Giải trí cuối tuần, gắn kết tình bạn kịch tính.</p>
</div>
<div class="bg-surface-container-high p-lg rounded-2xl text-center">
<img alt="Bữa tiệc" class="w-full h-40 object-cover rounded-xl mb-md" data-alt="A lively indoor party setting with colorful ambient lighting like neon purple and blue. People are cheering and holding their phones, clearly involved in a fast-paced group game. The focus is on the excitement and collective energy of the event, with the QuizBattle brand elements subtly integrated into the background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqMQxBto58MNLCL4c0powKZST0qSZuKzzHs1NHCnZnPRb3w-b9ttD3bUtJALcyc1RosZGZC1GawnlG8B5RtlznXd9W5PzwLtebq1IVztpN3g8cSZZH3ENa3ZZAVIlyXDzNmQNP1zrc9Okjg0F4DeH6KTsSPYKvCWXIJ9fxAeyYNNtzV2N3EIN-bXzqd4SkDb-0TjDaSwEjIW9uNXtoFa2iKtKCaqeSJYh8NQCTOF6FJ3jhi1fY2C3AiUTUOYvP5zmPIzF5b8a1NSI"/>
<h3 class="font-headline-md mb-xs">Bữa tiệc</h3>
<p class="text-sm text-on-surface-variant">Làm nóng không khí với những câu hỏi thú vị.</p>
</div>
<div class="bg-surface-container-high p-lg rounded-2xl text-center">
<img alt="Doanh nghiệp" class="w-full h-40 object-cover rounded-xl mb-md" data-alt="A sleek and professional modern office boardroom with a large screen displaying team results and data charts. Professionals in business-casual attire are using their mobile devices to participate in a corporate training session. The lighting is clean, high-key, and professional, emphasizing a productive and innovative workplace culture." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXfUkrEoobRJLmwd6npP7MmhVIXy7tm3P0kf_hp5DYgycRw7AIDsGwEtgd6D0ViLPIgSYXge0YBGB49CoLBaheiEpqUCqc9hpAeIqnOdOQiX2gsOhp7mN79OwMnex1JyIIk0JO38KSuGP0M2KdJSUtXWIsJFk7YTzghOb7g1LUWpnCKS-lHnyrSYJd_C-rWHNWfrJQcZ7dptAQQxaINwS9eb2k11WqoAuS_ls65yQqMSnKeIXiMgMA9Iy0Vz8hzP9FVeG6gvDKRRM"/>
<h3 class="font-headline-md mb-xs">Doanh nghiệp</h3>
<p class="text-sm text-on-surface-variant">Đào tạo nhân viên, xây dựng văn hóa đội ngũ.</p>
</div>
</div>
</section>
<section class="py-3xl bg-surface-container-lowest">
<div class="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop text-center">
<h2 class="font-headline-lg mb-3xl">Người chơi nói gì?</h2>
<div class="grid grid-cols-1 md:grid-cols-3 gap-xl">
<div class="bg-white p-xl rounded-2xl shadow-sm border border-outline-variant italic">
<p class="mb-lg">"Tôi chưa bao giờ thấy học sinh hào hứng ôn tập như vậy từ khi dùng QuizBattle trong lớp học."</p>
<div class="flex items-center justify-center gap-md non-italic">
<div class="w-12 h-12 rounded-full bg-primary-fixed border-2 border-primary overflow-hidden">
<img alt="Ms. Linh" data-alt="A professional portrait of a smiling female teacher in her 30s with a bright, welcoming background. The image is clean, sharp, and uses high-key lighting to create a trustworthy and educational mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1FsMiw2fjz_FPX0klCW1l1KrCOPk5g7Ae4ZxYez7ls4ttieoP7QDPXgMEHsrJjoDA55J3v4Kn5g_JvFPNSBrGuG28qslSn0L1HSx2YVXPphxp7NRnx6JRNBzglhJF5fR06GEUEzGMigre2SuNQ9_We_WEdnUDG8r5ZRa8UVTiPXxytRwoLfK5DcT2PyjcsIBJPTo8oy8--zn2frL-1elOKi3IsLVRGuGjDQTliQvTHlWgmTZOyutAFHizk3WrJ4gk60aFe5UjR1I"/>
</div>
<div class="text-left">
<p class="font-bold">Ms. Linh</p>
<p class="text-xs text-on-surface-variant">Giáo viên cấp 3</p>
</div>
</div>
</div>
<div class="bg-white p-xl rounded-2xl shadow-sm border border-outline-variant italic">
<p class="mb-lg">"Hệ thống ranking cực kỳ gây nghiện! Tôi đã leo lên được rank Kim Cương sau 1 tháng cày cuốc."</p>
<div class="flex items-center justify-center gap-md non-italic">
<div class="w-12 h-12 rounded-full bg-secondary-fixed border-2 border-secondary overflow-hidden">
<img alt="Minh" data-alt="A portrait of a cheerful young male student with a modern hairstyle. The background is a vibrant blur of colors. The lighting is dynamic and energetic, reflecting a tech-savvy and competitive gamer persona." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqtAECG-Li0BLMzp_LXih9qj1LKcdc-aNL0ry4fBkTYp8L2bjw2ZZUMUWQClQa7qpN2AbD2TjRkPvnyVlZkSbOOfSVI3ntAoXRx_C3TJERbj7lBc4HkKQ_EaebZURMAVsOmvm1_h9M9ibDorGzDH8d79d6SMz9Hvy2Mcn40ws8WtpVtuVimpRfzcqvPfEBhJwfGEKD84s2g7BA16vYaqAScZsXOedadP1n-JMWwOAfm-vexd-R0FXP2C2nR_nkNV2JaF31DLeS7wQ"/>
</div>
<div class="text-left">
<p class="font-bold">Minh Trần</p>
<p class="text-xs text-on-surface-variant">Sinh viên Đại học</p>
</div>
</div>
</div>
<div class="bg-white p-xl rounded-2xl shadow-sm border border-outline-variant italic">
<p class="mb-lg">"Công cụ tuyệt vời cho team building từ xa. Hiệu quả đào tạo nhân sự tăng lên rõ rệt."</p>
<div class="flex items-center justify-center gap-md non-italic">
<div class="w-12 h-12 rounded-full bg-primary-fixed border-2 border-primary overflow-hidden">
<img alt="CEO" data-alt="A portrait of a confident middle-aged male CEO in a professional corporate environment. He is smiling warmly. The lighting is sophisticated and soft, creating an image of success, authority, and innovation." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbZ3wF4jr6IO1U9QOxPDjp5DtnhP9JtQXvZMpbB8mZ2Xemqu0jMWXTGnHzXzmpMjJDGS2JyBUvwMY7u_ZblRnAt2eo5cscCfdjAeXkrtHvHiAyBp1h1-A0jsLC91efaH0xmzVtrx9MF5ICId_X4BV71wsfCM6-MTBTW9pthD7HM5KfCVcyZwuS4qX4qkaH29s1yLD2Cdk4lZBGx1XWhdspCEpfkGc-a4acO5q539M8Z5Vx2-VP5b1tjGaDzU7v5XCm_AHEvnOiAyA"/>
</div>
<div class="text-left">
<p class="font-bold">Mr. Hoàng</p>
<p class="text-xs text-on-surface-variant">CEO Công ty Tech</p>
</div>
</div>
</div>
</div>
</div>
</section>
<section class="py-3xl px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto">
<h2 class="font-headline-lg text-center mb-3xl">Câu hỏi thường gặp</h2>
<div class="space-y-md">
<details class="bg-surface-container-low p-md rounded-xl group" open="">
<summary class="font-bold flex justify-between items-center cursor-pointer list-none">
                        QuizBattle có hoàn toàn miễn phí không?
                        <span class="material-symbols-outlined group-open:rotate-180 transition-transform" data-icon="expand_more">expand_more</span>
</summary>
<div class="mt-sm text-on-surface-variant">
                        Đúng vậy! Bạn có thể tham gia thi đấu và tạo phòng cơ bản hoàn toàn miễn phí. Chúng tôi cũng có các gói Pro cho doanh nghiệp với tính năng phân tích chuyên sâu.
                    </div>
</details>
<details class="bg-surface-container-low p-md rounded-xl group">
<summary class="font-bold flex justify-between items-center cursor-pointer list-none">
                        Tôi có thể chơi trên điện thoại không?
                        <span class="material-symbols-outlined group-open:rotate-180 transition-transform" data-icon="expand_more">expand_more</span>
</summary>
<div class="mt-sm text-on-surface-variant">
                        Tất nhiên! QuizBattle được tối ưu hóa cho trình duyệt di động và có ứng dụng trên cả iOS và Android.
                    </div>
</details>
<details class="bg-surface-container-low p-md rounded-xl group">
<summary class="font-bold flex justify-between items-center cursor-pointer list-none">
                        Làm sao để tạo bộ câu hỏi riêng?
                        <span class="material-symbols-outlined group-open:rotate-180 transition-transform" data-icon="expand_more">expand_more</span>
</summary>
<div class="mt-sm text-on-surface-variant">
                        Sau khi đăng nhập, bạn chọn mục \"Tạo Quiz\". Bạn có thể nhập câu hỏi thủ công hoặc sử dụng AI để tạo câu hỏi từ một đoạn văn bản bất kỳ.
                    </div>
</details>
</div>
</section>
<section class="py-3xl bg-surface-container-high px-margin-mobile md:px-margin-desktop">
<div class="max-w-[1280px] mx-auto bg-primary rounded-[40px] p-2xl text-center text-white relative overflow-hidden">
<div class="absolute top-0 right-0 p-3xl opacity-10">
<span class="material-symbols-outlined text-[200px]" data-icon="rocket_launch">rocket_launch</span>
</div>
<h2 class="font-display-lg text-headline-lg md:text-display-lg mb-md relative z-10">Sẵn sàng để bắt đầu trận chiến?</h2>
<p class="font-body-lg mb-xl opacity-90 relative z-10">Gia nhập cộng đồng hơn 100,000 người chơi và chứng tỏ bản thân ngay hôm nay.</p>
<a class="bg-secondary-fixed text-on-secondary-fixed px-3xl py-md rounded-2xl font-bold text-xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all relative z-10 inline-block" href="/register" target="_top" rel="noreferrer">Đăng ký ngay</a>
</div>
</section>
</main>
<footer class="w-full px-margin-mobile md:px-margin-desktop py-xl flex flex-col md:flex-row justify-between items-center gap-lg border-t border-outline-variant bg-surface-container-lowest">
<div class="flex flex-col items-center md:items-start gap-xs">
<div class="flex items-center gap-2 mb-xs">
<span class="material-symbols-outlined text-primary" data-icon="sports_esports">sports_esports</span>
<span class="font-display-lg text-headline-md text-primary font-bold">QuizBattle</span>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">© 2026 QuizBattle. Elevate your intellect.</p>
</div>
<div class="flex flex-wrap justify-center gap-lg">
<a class="text-on-surface-variant hover:text-secondary transition-colors" href="#">Terms</a>
<a class="text-on-surface-variant hover:text-secondary transition-colors" href="#">Privacy</a>
<a class="text-on-surface-variant hover:text-secondary transition-colors" href="#">Support</a>
<a class="text-on-surface-variant hover:text-secondary transition-colors" href="#">Careers</a>
</div>
<div class="flex gap-md">
<span class="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer" data-icon="facebook">social_leaderboard</span>
<span class="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer" data-icon="alternate_email">alternate_email</span>
<span class="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer" data-icon="share">share</span>
</div>
</footer>
</body></html>`;

export default function LandingScreen() {
  return (
    <div className="min-h-screen w-full overflow-hidden bg-background">
      <iframe title="QuizBattle Landing Page" srcDoc={LANDING_HTML} className="block h-screen w-full border-0" />
    </div>
  );
}
