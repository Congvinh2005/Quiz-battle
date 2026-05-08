"use client";

import React, { ChangeEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface QuizEditorScreenProps {
  quizId?: string;
}

type QuestionType = "MCQ" | "TRUE_FALSE";

interface EditorQuestion {
  id: string;
  text: string;
  type: QuestionType;
  timeLimit: number;
  points: number;
  options: string[];
  correctIndex: number;
}

const letters = ["A", "B", "C", "D"];
const timeOptions = [10, 20, 30, 60];

const initialQuestions: EditorQuestion[] = [
  {
    id: "q1",
    text: "Thủ đô của Nhật Bản là gì?",
    type: "MCQ",
    timeLimit: 30,
    points: 100,
    options: ["Osaka", "Tokyo", "Kyoto", "Nagoya"],
    correctIndex: 1,
  },
  {
    id: "q2",
    text: "Úc là một lục địa?",
    type: "TRUE_FALSE",
    timeLimit: 20,
    points: 100,
    options: ["Đúng", "Sai", "", ""],
    correctIndex: 0,
  },
  {
    id: "q3",
    text: "Sông dài nhất thế giới?",
    type: "MCQ",
    timeLimit: 30,
    points: 100,
    options: ["Amazon", "Nile", "Mekong", "Yangtze"],
    correctIndex: 1,
  },
];

function normalizeOptions(type: QuestionType, options?: string[]) {
  if (type === "TRUE_FALSE") return ["Đúng", "Sai", "", ""];
  return options?.length === 4 ? options : ["", "", "", ""];
}

export default function QuizEditorScreen({ quizId }: QuizEditorScreenProps) {
  const router = useRouter();
  const [quizTitle, setQuizTitle] = useState("🌍 Địa Lý Thế Giới");
  const [visibility, setVisibility] = useState("private");
  const [questions, setQuestions] = useState<EditorQuestion[]>(initialQuestions);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeQuestion = questions[activeIndex] ?? questions[0];
  const visibleOptions = useMemo(
    () => activeQuestion.options.slice(0, activeQuestion.type === "TRUE_FALSE" ? 2 : 4),
    [activeQuestion]
  );

  const updateActiveQuestion = (patch: Partial<EditorQuestion>) => {
    setQuestions((current) =>
      current.map((question, index) => (index === activeIndex ? { ...question, ...patch } : question))
    );
  };

  const handleTypeChange = (type: QuestionType) => {
    updateActiveQuestion({
      type,
      options: normalizeOptions(type, activeQuestion.options),
      correctIndex: 0,
    });
  };

  const handleOptionChange = (optionIndex: number, event: ChangeEvent<HTMLInputElement>) => {
    const nextOptions = [...activeQuestion.options];
    nextOptions[optionIndex] = event.target.value;
    updateActiveQuestion({ options: nextOptions });
  };

  const handleAddQuestion = () => {
    const newQuestion: EditorQuestion = {
      id: `q${Date.now()}`,
      text: "Câu hỏi mới...",
      type: "MCQ",
      timeLimit: 30,
      points: 100,
      options: ["", "", "", ""],
      correctIndex: 0,
    };

    setQuestions((current) => [...current, newQuestion]);
    setActiveIndex(questions.length);
  };

  const handleDeleteQuestion = () => {
    if (questions.length === 1) {
      updateActiveQuestion({
        text: "",
        type: "MCQ",
        timeLimit: 30,
        points: 100,
        options: ["", "", "", ""],
        correctIndex: 0,
      });
      return;
    }

    setQuestions((current) => current.filter((_, index) => index !== activeIndex));
    setActiveIndex((current) => Math.max(0, current - 1));
  };

  const handleMoveUp = () => {
    if (activeIndex === 0) return;

    setQuestions((current) => {
      const next = [...current];
      const currentQuestion = next[activeIndex];
      next[activeIndex] = next[activeIndex - 1];
      next[activeIndex - 1] = currentQuestion;
      return next;
    });
    setActiveIndex((current) => current - 1);
  };

  const previewQuestion = activeQuestion.text.trim() || "Nhập nội dung câu hỏi...";

  return (
    <div className="editor-wrap">
      <aside className="editor-sidebar">
        <div className="editor-quiz-box">
          <input
            className="form-input"
            placeholder="Tên quiz..."
            value={quizTitle}
            onChange={(event) => setQuizTitle(event.target.value)}
            style={{ fontFamily: "Syne, sans-serif", fontWeight: 700 }}
          />
          <div className="editor-quiz-meta">
            <select className="editor-select" value={visibility} onChange={(event) => setVisibility(event.target.value)}>
              <option value="private">🔒 Private</option>
              <option value="public">🌍 Public</option>
            </select>
          </div>
        </div>

        <div className="es-title">Câu hỏi ({questions.length})</div>
        {questions.map((question, index) => (
          <button
            className={`es-q-item${index === activeIndex ? " active" : ""}`}
            key={question.id}
            onClick={() => setActiveIndex(index)}
          >
            <div className="es-q-num">{index + 1}</div>
            <div className="es-q-text">{question.text || "Câu hỏi chưa có nội dung"}</div>
          </button>
        ))}
        <button className="es-add" onClick={handleAddQuestion}>
          + Thêm câu hỏi
        </button>

        <div className="editor-sidebar-actions">
          <button className="btn-save" style={{ width: "100%" }}>
            💾 Lưu
          </button>
          <button className="btn-publish" style={{ width: "100%" }} onClick={() => router.push("/create-room")}>
            🚀 Lưu & Chơi
          </button>
        </div>
      </aside>

      <main className="editor-main">
        <div className="editor-main-header">
          <h1 className="em-title">
            {quizId ? "Chỉnh sửa quiz" : "Câu hỏi"} {activeIndex + 1} / {questions.length}
          </h1>
          <div className="editor-header-actions">
            <button className="editor-icon-btn" onClick={handleDeleteQuestion}>
              🗑 Xóa
            </button>
            <button className="editor-icon-btn strong" onClick={handleMoveUp}>
              ⬆ Di chuyển
            </button>
          </div>
        </div>

        <section className="question-editor">
          <div className="qe-top">
            <div className="qe-type-toggle">
              <button
                className={`qe-type-btn${activeQuestion.type === "MCQ" ? " active" : ""}`}
                onClick={() => handleTypeChange("MCQ")}
              >
                Trắc nghiệm
              </button>
              <button
                className={`qe-type-btn${activeQuestion.type === "TRUE_FALSE" ? " active" : ""}`}
                onClick={() => handleTypeChange("TRUE_FALSE")}
              >
                Đúng / Sai
              </button>
            </div>
            <div className="qe-time">⏱ Thời gian:</div>
            <div className="time-select">
              {timeOptions.map((time) => (
                <button
                  className={`time-chip${activeQuestion.timeLimit === time ? " active" : ""}`}
                  key={time}
                  onClick={() => updateActiveQuestion({ timeLimit: time })}
                >
                  {time}s
                </button>
              ))}
            </div>
            <div className="qe-score">
              Điểm: <span>{activeQuestion.points}</span>
            </div>
          </div>

          <textarea
            className="qe-textarea"
            rows={3}
            value={activeQuestion.text}
            onChange={(event) => updateActiveQuestion({ text: event.target.value })}
          />

          <div className="answers-label">Đáp án (chọn đáp án đúng ✓):</div>
          <div className="options-editor">
            {visibleOptions.map((option, index) => (
              <div className={`option-editor${activeQuestion.correctIndex === index ? " correct" : ""}`} key={letters[index]}>
                <div className="opt-letter">{letters[index]}</div>
                <input
                  className="opt-input"
                  value={option}
                  onChange={(event) => handleOptionChange(index, event)}
                  readOnly={activeQuestion.type === "TRUE_FALSE"}
                  placeholder={`Đáp án ${letters[index]}`}
                />
                <button
                  className={`opt-correct-btn${activeQuestion.correctIndex === index ? " checked" : ""}`}
                  onClick={() => updateActiveQuestion({ correctIndex: index })}
                  aria-label={`Chọn đáp án ${letters[index]} là đúng`}
                >
                  {activeQuestion.correctIndex === index ? "✓" : ""}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="editor-preview">
          <div className="editor-preview-title">Preview câu hỏi</div>
          <div className="preview-question">{previewQuestion}</div>
          <div className="preview-options">
            {visibleOptions.map((option, index) => {
              const isCorrect = activeQuestion.correctIndex === index;
              const isFirstWrong = index === 0 && !isCorrect;

              return (
                <div
                  className={`preview-option${isCorrect ? " correct" : ""}${isFirstWrong ? " wrong" : ""}`}
                  key={letters[index]}
                >
                  <span className="preview-letter">{letters[index]}</span>
                  <span className="preview-option-text">
                    {option || `Đáp án ${letters[index]}`} {isCorrect ? "✓" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
