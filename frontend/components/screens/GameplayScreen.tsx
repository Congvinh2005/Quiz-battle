"use client";

import React from "react";

interface GameplayScreenProps {
  roomCode: string;
}

export default function GameplayScreen({ roomCode }: GameplayScreenProps) {
  return (
    <div className="min-h-[calc(100vh-53px)] flex flex-col">
      {/* Top bar */}
      <div className="bg-dark-surface border-b border-border px-8 py-4 flex items-center justify-between">
        <div className="text-xs text-text-muted">
          Question <strong className="text-text-main font-syne">1 / 10</strong>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-16 h-16 relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg)" strokeWidth="4" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="125.6"
                strokeDashoffset="0"
              />
            </svg>
            <div className="absolute text-center font-syne text-2xl font-bold">30</div>
          </div>
        </div>
      </div>

      {/* Game content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <div className="text-xs text-text-muted uppercase font-bold tracking-widest mb-3">Question 1</div>
            <h2 className="font-syne text-3xl font-bold leading-relaxed">
              Game content will appear here with question and answer options
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <p className="text-text-muted">Answer options will appear here</p>
          </div>
        </div>
      </div>

      {/* Mini leaderboard */}
      <div className="bg-dark-surface border-t border-border p-4 flex gap-3 overflow-x-auto">
        <p className="text-text-muted text-sm">Mini leaderboard will appear here</p>
      </div>
    </div>
  );
}
