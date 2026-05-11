"use client";

import React, { FormEvent, useEffect, useMemo, useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { gameService } from "@/services/gameService";
import { wsService } from "@/services/websocketService";
import { ChatMessage, RoomStateResponse } from "@/types";
import { useRouter } from "next/navigation";

interface GameplayScreenProps {
  roomCode: string;
}

interface AnswerOption {
  id: string;
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
  userId?: string;
}

interface SubmitAnswerResponse {
  question_order: number;
  is_correct: boolean;
  correct_option_id?: string | null;
  points_earned: number;
  total_score: number;
  leaderboard: Array<{
    rank: number;
    user_id: string;
    display_name: string;
    score: number;
  }>;
}

interface AnswerFeedback {
  isCorrect: boolean;
  correctOptionId: string | null;
  pointsEarned: number;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : name.slice(0, 2);
  return initials.toUpperCase();
}

function serializeLeaderboard(state: RoomStateResponse | null): LeaderboardItem[] {
  if (!state?.game_state?.leaderboard?.length) return [];

  const gradients = [
    "linear-gradient(135deg,var(--gold),#D97706)",
    "linear-gradient(135deg,var(--primary),var(--primary-light))",
    "linear-gradient(135deg,var(--accent),#0891B2)",
    "linear-gradient(135deg,var(--green),#059669)",
    "linear-gradient(135deg,#EC4899,#BE185D)",
  ];

  return state.game_state.leaderboard.map((item, index) => ({
    rank: item.rank <= 3 ? ["🥇", "🥈", "🥉"][item.rank - 1] : String(item.rank),
    rankClass: item.rank === 1 ? "gold" : item.rank === 2 ? "silver" : item.rank === 3 ? "bronze" : undefined,
    initials: getInitials(item.display_name),
    name: item.display_name,
    score: item.score.toLocaleString("vi-VN"),
    gradient: gradients[index % gradients.length],
    isMe: false,
    userId: item.user_id,
  }));
}

export default function GameplayScreen({ roomCode }: GameplayScreenProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [roomState, setRoomState] = useState<RoomStateResponse | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatLine[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isNextQuestionLoading, setIsNextQuestionLoading] = useState(false);
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLeavingRoom, setIsLeavingRoom] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);
  const questionStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceTriggeredRef = useRef(false);

  // Load initial state and chat messages
  useEffect(() => {
    const loadState = async () => {
      if (!roomCode) return;

      try {
        setIsLoading(true);
        setError(null);

        const [state, messages] = await Promise.all([
          gameService.getRoomState(roomCode),
          gameService.getChatMessages(roomCode),
        ]);

        setRoomState(state);
        setChatMessages(
          messages.map((message) => ({
            name: message.user?.username || "Người chơi",
            text: message.message,
          }))
        );

        // Track when question started for response time
        questionStartTimeRef.current = Date.now();
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        setAnswerFeedback(null);
        autoAdvanceTriggeredRef.current = false;
        // Initialize timer from question's time_limit
        const timeLimit = state?.game_state?.current_question?.time_limit || 30;
        setTimeRemaining(timeLimit);
        setTimerActive(true);
      } catch (loadError) {
        setError("Không tải được trạng thái phòng. Vui lòng quay lại lobby hoặc thử refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    loadState();
  }, [roomCode]);

  // Countdown timer effect - auto-advance to next question when time reaches 0
  useEffect(() => {
    if (!timerActive || !roomCode) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prevTime) => {
        const newTime = Math.max(0, prevTime - 1);
        
        // When timer reaches 0, auto-advance to next question
        if (newTime === 0 && !autoAdvanceTriggeredRef.current) {
          autoAdvanceTriggeredRef.current = true;
          setTimerActive(false);
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          // Call next question automatically
          if (!isNextQuestionLoading && roomCode) {
            void handleNextQuestion();
          }
        }
        
        return newTime;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerActive, roomCode, isNextQuestionLoading]);

  // WebSocket listeners for real-time updates
  useEffect(() => {
    if (!roomCode) return;

    const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "";
    if (!accessToken) return;

    const handleQuestionChanged = (data: any) => {
      if (data?.data?.current_question_order) {
        // New question, reset state
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        setAnswerFeedback(null);
        setTimerActive(true);
        autoAdvanceTriggeredRef.current = false;
        questionStartTimeRef.current = Date.now();
        // Reset timer to new question's time_limit
        const newTimeLimit = data?.data?.question?.time_limit || 30;
        setTimeRemaining(newTimeLimit);
        // Reload room state to get new question
        gameService.getRoomState(roomCode).then(setRoomState).catch(console.error);
      }
    };

    const handlePlayerAnswered = (data: any) => {
      if (data?.data?.leaderboard) {
        setRoomState(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            game_state: {
              ...prev.game_state,
              leaderboard: data.data.leaderboard,
            },
          };
        });
      }
    };

    const handleGameEnded = (data: any) => {
      // Stop timer when game ends
      setTimerActive(false);
      // Redirect to results page
      setTimeout(() => {
        router.push(`/results/${roomCode}`);
      }, 2000);
    };

    const handleChatMessage = (data: any) => {
      if (data?.data?.user?.username && data?.data?.message) {
        setChatMessages(prev => [...prev, {
          name: data.data.user.username,
          text: data.data.message,
        }]);
      }
    };

    wsService.on("QUESTION_CHANGED", handleQuestionChanged);
    wsService.on("PLAYER_ANSWERED", handlePlayerAnswered);
    wsService.on("GAME_ENDED", handleGameEnded);
    wsService.on("CHAT_MESSAGE", handleChatMessage);

    wsService.connect(accessToken, roomCode).catch(err => {
      console.error("Failed to connect websocket:", err);
    });

    return () => {
      wsService.off("QUESTION_CHANGED", handleQuestionChanged);
      wsService.off("PLAYER_ANSWERED", handlePlayerAnswered);
      wsService.off("GAME_ENDED", handleGameEnded);
      wsService.off("CHAT_MESSAGE", handleChatMessage);
      wsService.disconnect();
      // Clean up timer interval
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [roomCode, router]);

  const currentQuestion = roomState?.game_state.current_question;
  const answers: AnswerOption[] = useMemo(() => {
    if (!currentQuestion?.answer_options?.length) return [];

    return currentQuestion.answer_options.map((option, index) => ({
      id: option.id,
      letter: String.fromCharCode(65 + index),
      text: option.content,
    }));
  }, [currentQuestion]);

  const leaderboard: LeaderboardItem[] = useMemo(() => serializeLeaderboard(roomState), [roomState]);
  const myLeaderboardItem = useMemo(
    () => leaderboard.find((item) => item.userId === user?.id),
    [leaderboard, user?.id],
  );

  const questionOrder = roomState?.game_state.current_question_order ?? roomState?.settings.current_question_order ?? 1;
  const totalQuestions = roomState?.game_state.total_questions ?? roomState?.quiz.question_count ?? 0;
  const roomStatus = roomState?.game_state.status ?? roomState?.room.status ?? "WAITING";
  const myScore = myLeaderboardItem?.score ?? "0";
  const myRank = myLeaderboardItem?.rank ?? "-";
  const isHost = user?.id === roomState?.room?.host_id;

  const handleSubmitAnswer = async (selectedOptionId: string) => {
    if (!selectedOptionId || isAnswerSubmitted || !roomCode) return;

    try {
      setIsSubmittingAnswer(true);
      const responseTime = (Date.now() - questionStartTimeRef.current) / 1000;

      const result = (await gameService.submitAnswer(roomCode, {
        selected_option_id: selectedOptionId,
        response_time: responseTime,
      })) as SubmitAnswerResponse;

      setIsAnswerSubmitted(true);
      setAnswerFeedback({
        isCorrect: result.is_correct,
        correctOptionId: result.correct_option_id ?? null,
        pointsEarned: result.points_earned,
      });
    } catch (err) {
      setError("Không thể gửi câu trả lời. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!roomCode) return;

    try {
      setIsNextQuestionLoading(true);
      setTimerActive(false); // Stop timer while advancing
      const result = await gameService.nextQuestion(roomCode);

      if (result?.status === "FINISHED") {
        // Player finished all questions
        autoAdvanceTriggeredRef.current = false;
        setTimerActive(false);
        router.push(`/results/${roomCode}`);
      } else {
        if (result?.question) {
          setRoomState((prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              game_state: {
                ...prev.game_state,
                current_question_order: result.current_question_order ?? prev.game_state.current_question_order,
                current_question: result.question,
                total_questions: result.total_questions ?? prev.game_state.total_questions,
              },
            };
          });
        }

        // Reset for next question
        setSelectedAnswer(null);
        setIsAnswerSubmitted(false);
        setAnswerFeedback(null);
        autoAdvanceTriggeredRef.current = false;
        questionStartTimeRef.current = Date.now();
        const nextTimeLimit = result?.question?.time_limit || 30;
        setTimeRemaining(nextTimeLimit);
        setTimerActive(true); // Restart timer for next question
      }
    } catch (err) {
      setError("Không thể chuyển câu hỏi. Vui lòng thử lại.");
      setTimerActive(true); // Resume timer on error
      console.error(err);
    } finally {
      setIsNextQuestionLoading(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (!roomCode) return;

    try {
      setIsLeavingRoom(true);
      setError(null);
      setTimerActive(false); // Stop timer when leaving
      await gameService.leaveRoom(roomCode);
      wsService.disconnect();
      router.push("/dashboard");
    } catch (err) {
      setError("Không thể rời phòng lúc này. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setIsLeavingRoom(false);
    }
  };

  const handleSendChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = chatInput.trim();
    if (!text || !roomCode) return;

    try {
      setIsSendingChat(true);
      await gameService.postChatMessage(roomCode, { message: text });
      setChatInput("");
      // Chat message will be added via WebSocket listener
    } catch (err) {
      console.error("Failed to send chat:", err);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleSelectAnswer = (optionId: string) => {
    if (!isAnswerSubmitted && !isSubmittingAnswer) {
      setSelectedAnswer(optionId);
    }
  };

  return (
    <div className="game-wrap">
      <div className="game-topbar">
        <div className="game-question-counter">
          Câu <strong>{questionOrder}</strong> / {totalQuestions || 10}
          {roomCode && <span> · Phòng {roomCode}</span>}
        </div>

        <div className="timer-block">
          <div className="timer-circle">
            <svg className="timer-svg" width="52" height="52" viewBox="0 0 52 52">
              <circle className="timer-track" cx="26" cy="26" r="20" />
              <circle 
                className="timer-fill" 
                cx="26" 
                cy="26" 
                r="20" 
                style={{ 
                  strokeDashoffset: 125.6 * (1 - timeRemaining / (currentQuestion?.time_limit || 30))
                }} 
              />
            </svg>
            <div className="timer-num">{timeRemaining}</div>
          </div>
        </div>

        <div className="game-topbar-right">
          <div className="game-rank">🏆 Hạng {myRank}</div>
          <div className="game-score">{myScore} pts</div>
          <div className="game-players-mini">
            {roomState?.players?.slice(0, 3).map((player, index) => (
              <div
                className="mini-av"
                key={player.id}
                style={{
                  background: [
                    "linear-gradient(135deg,var(--gold),#D97706)",
                    "linear-gradient(135deg,var(--primary),var(--primary-light))",
                    "linear-gradient(135deg,var(--accent),#0891B2)",
                  ][index],
                }}
              >
                {getInitials(player.display_name)}
              </div>
            ))}
            {roomState && roomState.player_count > 3 && <div className="mini-more">+{roomState.player_count - 3}</div>}
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
              {!chatMessages.length && !isLoading && <div className="chat-msg">Chưa có tin nhắn nào.</div>}
          </div>
          <form className="chat-input-row" onSubmit={handleSendChat}>
            <input
              className="chat-input"
              placeholder="Nhắn gì đó..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              disabled={isSendingChat}
            />
            <button className="chat-send" type="submit" disabled={isSendingChat}>
              ➤
            </button>
          </form>
        </aside>

        <main className="game-content">
          <div className="question-card">
            <div className="question-num">
              Câu hỏi {questionOrder} trong {totalQuestions || 10}
            </div>
            <div className="question-text">{currentQuestion?.content || "Đang chờ câu hỏi từ server..."}</div>
          </div>
          <div className="answers-grid">
            {answers.map((answer) => (
              <button
                className={`answer-btn${
                  !isAnswerSubmitted && selectedAnswer === answer.id ? " selected" : ""
                }${
                  isAnswerSubmitted && answerFeedback?.correctOptionId === answer.id ? " correct" : ""
                }${
                  isAnswerSubmitted && selectedAnswer === answer.id && !answerFeedback?.isCorrect ? " wrong" : ""
                }${isAnswerSubmitted ? " submitted" : ""}`}
                key={answer.id}
                onClick={() => handleSelectAnswer(answer.id)}
                disabled={isLoading || isAnswerSubmitted || isSubmittingAnswer || roomStatus !== "PLAYING"}
              >
                <div className="answer-letter">{answer.letter}</div>
                <div>{answer.text}</div>
              </button>
            ))}
            {!answers.length && !isLoading && <div className="question-num">Chưa có đáp án nào cho câu hỏi này.</div>}
          </div>

          {isAnswerSubmitted && answerFeedback && (
            <div className="question-num" style={{ marginTop: 14, textAlign: "center" }}>
              {answerFeedback.isCorrect
                ? `Chính xác! +${answerFeedback.pointsEarned} điểm`
                : `Sai rồi. Đáp án đúng đã được tô xanh.`}
            </div>
          )}

          {/* Submit Button */}
          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => {
                if (selectedAnswer) {
                  handleSubmitAnswer(selectedAnswer);
                }
              }}
              disabled={!selectedAnswer || isAnswerSubmitted || isSubmittingAnswer || roomStatus !== "PLAYING"}
              style={{
                padding: "12px 32px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: !selectedAnswer || isAnswerSubmitted ? "#ccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: !selectedAnswer || isAnswerSubmitted ? "not-allowed" : "pointer",
              }}
            >
              {isSubmittingAnswer ? "Đang gửi..." : isAnswerSubmitted ? "Đã trả lời" : "Trả lời"}
            </button>

            {/* Next Question Button - each player can advance independently */}
            <button
              onClick={handleNextQuestion}
              disabled={isNextQuestionLoading || !isAnswerSubmitted || roomStatus !== "PLAYING"}
              style={{
                padding: "12px 32px",
                fontSize: "16px",
                fontWeight: "bold",
                backgroundColor: !isAnswerSubmitted || roomStatus !== "PLAYING" ? "#ccc" : "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: !isAnswerSubmitted || roomStatus !== "PLAYING" ? "not-allowed" : "pointer",
              }}
            >
              {isNextQuestionLoading ? "Đang chuyển..." : "Câu Tiếp →"}
            </button>
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
          {!leaderboard.length && !isLoading && <div className="mini-board-item">Chưa có bảng xếp hạng.</div>}
        </aside>
      </div>

      <button className="game-leave-btn" onClick={handleLeaveRoom} disabled={isLeavingRoom} type="button">
        {isLeavingRoom ? "Đang rời phòng..." : "Rời phòng"}
      </button>

      {error && (
        <div className="lobby-error" style={{ marginTop: 16 }}>
          {error}
        </div>
      )}
    </div>
  );
}
