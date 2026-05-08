"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface ResultScreenProps {
  roomCode: string;
}

interface LeaderboardRow {
  rank: string;
  rankClass?: string;
  initials: string;
  name: string;
  correct: string;
  score: string;
  gradient: string;
  isMe?: boolean;
}

const leaderboard: LeaderboardRow[] = [
  {
    rank: "🥇",
    rankClass: "gold-text",
    initials: "LA",
    name: "Lan Anh",
    correct: "9/10 đúng",
    score: "9,850",
    gradient: "linear-gradient(135deg,var(--gold),#D97706)",
  },
  {
    rank: "🥈",
    rankClass: "silver-text",
    initials: "MK",
    name: "Minh Khoa",
    correct: "8/10 đúng",
    score: "8,600",
    gradient: "linear-gradient(135deg,var(--primary),var(--primary-light))",
    isMe: true,
  },
  {
    rank: "🥉",
    rankClass: "bronze-text",
    initials: "TH",
    name: "Tuấn Hùng",
    correct: "7/10 đúng",
    score: "7,200",
    gradient: "linear-gradient(135deg,var(--accent),#0891B2)",
  },
  {
    rank: "4",
    initials: "NQ",
    name: "Nam Quân",
    correct: "6/10 đúng",
    score: "5,800",
    gradient: "linear-gradient(135deg,var(--green),#059669)",
  },
  {
    rank: "5",
    initials: "HV",
    name: "Hồng Vân",
    correct: "5/10 đúng",
    score: "4,500",
    gradient: "linear-gradient(135deg,#EC4899,#BE185D)",
  },
  {
    rank: "6",
    initials: "BK",
    name: "Bảo Khang",
    correct: "4/10 đúng",
    score: "3,200",
    gradient: "linear-gradient(135deg,#F59E0B,#D97706)",
  },
  {
    rank: "7",
    initials: "TL",
    name: "Thùy Linh",
    correct: "3/10 đúng",
    score: "2,100",
    gradient: "linear-gradient(135deg,#6366F1,#4F46E5)",
  },
];

const confetti = [
  { left: "10%", background: "var(--gold)", delay: "0s", duration: "2.5s" },
  { left: "25%", background: "var(--primary)", delay: ".3s", duration: "3s" },
  { left: "40%", background: "var(--accent)", delay: ".6s", rounded: true },
  { left: "60%", background: "var(--green)", delay: ".9s", duration: "2.8s" },
  { left: "75%", background: "var(--gold)", delay: ".2s" },
  { left: "88%", background: "var(--primary-light)", delay: ".5s", rounded: true },
  { left: "50%", background: "#EC4899", delay: "1s", duration: "3.2s" },
  { left: "33%", background: "var(--gold)", delay: ".8s", rounded: true },
];

export default function ResultScreen({ roomCode }: ResultScreenProps) {
  const router = useRouter();

  return (
    <div className="result-wrap">
      <section className="result-hero">
        <div className="result-confetti">
          {confetti.map((item, index) => (
            <div
              className="confetti-bit"
              key={index}
              style={{
                left: item.left,
                background: item.background,
                animationDelay: item.delay,
                animationDuration: item.duration,
                borderRadius: item.rounded ? "50%" : undefined,
              }}
            />
          ))}
        </div>
        <div className="result-trophy">🏆</div>
        <h1 className="result-title">
          Game kết thúc! <span>Xuất sắc!</span>
        </h1>
        <p className="result-sub">🌍 Địa Lý Thế Giới • 7 người chơi • 10 câu hỏi • Phòng {roomCode}</p>
      </section>

      <section className="podium">
        <div className="podium-item">
          <div className="podium-av silver" style={{ background: "linear-gradient(135deg,var(--primary),var(--primary-light))" }}>
            MK
          </div>
          <div className="podium-name podium-name-small">
            Minh Khoa
            <br />
            <span className="podium-me">(Bạn)</span>
          </div>
          <div className="podium-score">8,600</div>
          <div className="podium-bar silver">
            <div className="podium-pos silver">2</div>
          </div>
        </div>

        <div className="podium-item">
          <div className="podium-av gold" style={{ background: "linear-gradient(135deg,var(--gold),#D97706)" }}>
            LA
          </div>
          <div className="podium-name">Lan Anh</div>
          <div className="podium-score">9,850</div>
          <div className="podium-bar gold">
            <div className="podium-pos gold">1</div>
          </div>
        </div>

        <div className="podium-item">
          <div className="podium-av bronze" style={{ background: "linear-gradient(135deg,var(--accent),#0891B2)" }}>
            TH
          </div>
          <div className="podium-name">Tuấn Hùng</div>
          <div className="podium-score">7,200</div>
          <div className="podium-bar bronze">
            <div className="podium-pos bronze">3</div>
          </div>
        </div>
      </section>

      <section className="full-leaderboard">
        <div className="lb-header">
          <span className="lb-title">📊 Bảng xếp hạng đầy đủ</span>
          <span className="lb-total">{leaderboard.length} người chơi</span>
        </div>

        {leaderboard.map((row) => (
          <div className={`lb-row${row.isMe ? " me" : ""}`} key={row.name}>
            <div className={`lb-rank-num${row.rankClass ? ` ${row.rankClass}` : ""}`}>{row.rank}</div>
            <div className="lb-av" style={{ background: row.gradient }}>
              {row.initials}
            </div>
            <div className="lb-name">
              {row.name} {row.isMe && <span className="lb-you">(Bạn)</span>}
            </div>
            <div className="lb-correct">{row.correct}</div>
            <div className="lb-score-val">{row.score}</div>
          </div>
        ))}
      </section>

      <div className="result-actions">
        <button className="btn-play-again" onClick={() => router.push(`/room/${roomCode}`)}>
          🔄 Chơi lại
        </button>
        <button className="btn-home" onClick={() => router.push("/dashboard")}>
          🏠 Về trang chủ
        </button>
      </div>
    </div>
  );
}
