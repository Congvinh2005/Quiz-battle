"use client";

import React, { FormEvent, useMemo, useState } from "react";

interface GameplayScreenProps {
  roomCode: string;
}

interface AnswerOption {
  letter: string;
  text: string;
}

interface ChatLine {
  name: string;
  text: string;
}

interface LeaderboardItem {
  rank: string;
  rankClass?: string;
  initials: string;
  name: string;
  score: string;
  gradient: string;
  isMe?: boolean;
}

const answers: AnswerOption[] = [
  { letter: "A", text: "Osaka" },
  { letter: "B", text: "Tokyo" },
  { letter: "C", text: "Kyoto" },
  { letter: "D", text: "Nagoya" },
];

const initialChat: ChatLine[] = [
  { name: "Lan Anh", text: "Sẵn sàng! 🎮" },
  { name: "Tuấn Hùng", text: "Hy vọng câu về địa lý 😅" },
];

const leaderboard: LeaderboardItem[] = [
  {
    rank: "🥇",
    rankClass: "gold",
    initials: "LA",
    name: "Lan Anh",
    score: "7,200",
    gradient: "linear-gradient(135deg,var(--gold),#D97706)",
  },
  {
    rank: "🥈",
    rankClass: "silver",
    initials: "MK",
    name: "Bạn",
    score: "6,400",
    gradient: "linear-gradient(135deg,var(--primary),var(--primary-light))",
    isMe: true,
  },
  {
    rank: "🥉",
    rankClass: "bronze",
    initials: "TH",
    name: "Tuấn Hùng",
    score: "5,900",
    gradient: "linear-gradient(135deg,var(--accent),#0891B2)",
  },
  {
    rank: "4",
    initials: "NQ",
    name: "Nam Quân",
    score: "4,850",
    gradient: "linear-gradient(135deg,var(--green),#059669)",
  },
  {
    rank: "5",
    initials: "HV",
    name: "Hồng Vân",
    score: "3,200",
    gradient: "linear-gradient(135deg,#EC4899,#BE185D)",
  },
];

export default function GameplayScreen({ roomCode }: GameplayScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>("B");
  const [chatMessages, setChatMessages] = useState<ChatLine[]>(initialChat);
  const [chatInput, setChatInput] = useState("");

  const correctAnswer = "B";
  const timerProgress = useMemo(() => 125.6 * 0.25, []);

  const handleSendChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    setChatMessages((current) => [...current, { name: "Bạn", text }]);
    setChatInput("");
  };

  const getAnswerClass = (letter: string) => {
    if (!selectedAnswer) return "";
    if (letter === correctAnswer) return " correct";
    if (letter === selectedAnswer) return " wrong";
    return "";
  };

  return (
    <div className="game-wrap">
      <div className="game-topbar">
        <div className="game-question-counter">
          Câu <strong>1</strong> / 10
          {roomCode && <span> · Phòng {roomCode}</span>}
        </div>

        <div className="timer-block">
          <div className="timer-circle">
            <svg className="timer-svg" width="52" height="52" viewBox="0 0 52 52">
              <circle className="timer-track" cx="26" cy="26" r="20" />
              <circle className="timer-fill" cx="26" cy="26" r="20" style={{ strokeDashoffset: timerProgress }} />
            </svg>
            <div className="timer-num">30</div>
          </div>
        </div>

        <div className="game-topbar-right">
          <div className="game-rank">🏆 Hạng 2</div>
          <div className="game-score">6,400 pts</div>
          <div className="game-players-mini">
            <div className="mini-av" style={{ background: "linear-gradient(135deg,var(--gold),#D97706)" }}>
              MK
            </div>
            <div className="mini-av" style={{ background: "linear-gradient(135deg,var(--primary),var(--primary-light))" }}>
              LA
            </div>
            <div className="mini-av" style={{ background: "linear-gradient(135deg,var(--accent),#0891B2)" }}>
              TH
            </div>
            <div className="mini-more">+4</div>
          </div>
        </div>
      </div>

      <div className="game-body">
        <aside className="chat-card">
          <div className="chat-title">
            💬 Chat phòng <span className="chat-live">LIVE</span>
          </div>
          <div className="chat-messages">
            {chatMessages.map((message, index) => (
              <div className="chat-msg" key={`${message.name}-${index}`}>
                <span className="chat-msg-name">{message.name}: </span>
                {message.text}
              </div>
            ))}
          </div>
          <form className="chat-input-row" onSubmit={handleSendChat}>
            <input
              className="chat-input"
              placeholder="Nhắn gì đó..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
            />
            <button className="chat-send" type="submit">
              ➤
            </button>
          </form>
        </aside>

        <main className="game-content">
          <div className="question-card">
            <div className="question-num">Câu hỏi 1 trong 10</div>
            <div className="question-text">Thủ đô của Nhật Bản là gì?</div>
          </div>
          <div className="answers-grid">
            {answers.map((answer) => (
              <button
                className={`answer-btn${selectedAnswer === answer.letter ? " selected" : ""}${getAnswerClass(answer.letter)}`}
                key={answer.letter}
                onClick={() => setSelectedAnswer(answer.letter)}
              >
                <div className="answer-letter">{answer.letter}</div>
                {answer.text} {selectedAnswer && answer.letter === correctAnswer ? "✓" : ""}
              </button>
            ))}
          </div>
        </main>

        <aside className="mini-board vertical">
          <div className="mini-board-title">Leaderboard</div>
          {leaderboard.map((item) => (
            <div className={`mini-board-item${item.isMe ? " me" : ""}`} key={item.name}>
              <span className={`mini-rank${item.rankClass ? ` ${item.rankClass}` : ""}`}>{item.rank}</span>
              <div
                className="mini-av"
                style={{
                  width: 24,
                  height: 24,
                  background: item.gradient,
                  fontSize: 10,
                }}
              >
                {item.initials}
              </div>
              <span className="mini-name">{item.name}</span>
              <span className="mini-score">{item.score}</span>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
