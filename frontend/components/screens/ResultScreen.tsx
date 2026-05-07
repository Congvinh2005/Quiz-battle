"use client";

import React from "react";

interface ResultScreenProps {
  roomCode: string;
}

export default function ResultScreen({ roomCode }: ResultScreenProps) {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="text-center py-10">
        <div className="text-7xl mb-4 animate-bounce">🏆</div>
        <h1 className="font-syne text-5xl font-extrabold mb-2">
          Game <span className="text-brand-gold">Finished!</span>
        </h1>
        <p className="text-text-muted">Room Code: {roomCode}</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 my-7">
        <p className="text-text-muted">Podium will appear here with top 3 players</p>
      </div>

      {/* Full leaderboard */}
      <div className="bg-dark-surface2 border border-border-light rounded-3xl overflow-hidden mb-6">
        <div className="p-4 bg-dark-surface border-b border-border flex items-center justify-between">
          <h3 className="font-syne text-sm font-bold">Final Leaderboard</h3>
        </div>
        <div className="p-4">
          <p className="text-text-muted text-sm">Full leaderboard will appear here</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-light text-white font-semibold text-sm cursor-pointer transition-all hover:shadow-lg">
          Play Again
        </button>
        <button className="flex-1 py-3 rounded-xl bg-dark-surface2 border border-border-light text-text-main font-semibold text-sm cursor-pointer transition-all hover:bg-dark-surface">
          Back Home
        </button>
      </div>
    </div>
  );
}
