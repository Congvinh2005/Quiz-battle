"use client";

import React from "react";

interface QuizEditorScreenProps {
  quizId?: string;
}

export default function QuizEditorScreen({ quizId }: QuizEditorScreenProps) {
  return (
    <div className="grid grid-cols-[260px_1fr] min-h-[calc(100vh-53px)]">
      {/* Sidebar */}
      <div className="bg-dark-surface border-r border-border p-5 flex flex-col gap-1">
        <h3 className="font-syne text-xs font-bold text-text-muted uppercase tracking-widest mb-2.5 px-2">Questions</h3>
        <button className="px-2.5 py-2.5 rounded-2xl border border-dashed border-border-light bg-transparent text-text-muted text-sm cursor-pointer hover:border-brand-primary hover:text-brand-primary-light transition-all">
          + Add Question
        </button>
      </div>

      {/* Main */}
      <div className="p-7 overflow-y-auto">
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-syne text-lg font-bold">{quizId ? "Edit Quiz" : "Create New Quiz"}</h1>
          </div>

          <div className="bg-dark-surface2 border border-border-light rounded-3xl p-6">
            <p className="text-text-muted">Editor form will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
