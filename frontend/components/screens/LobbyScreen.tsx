"use client";

import React from "react";

interface LobbyScreenProps {
  roomCode: string;
}

export default function LobbyScreen({ roomCode }: LobbyScreenProps) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div className="bg-dark-surface2 border border-border-light rounded-2xl p-6">
          <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Room Code</div>
          <div className="font-jetbrains-mono text-4xl font-bold tracking-wider">{roomCode}</div>
          <div className="text-xs opacity-70 mt-1">Share this code with friends</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players area */}
        <div className="lg:col-span-2 bg-dark-surface2 border border-border-light rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne text-sm font-bold">
              Players <span className="text-brand-primary-light">0</span>
            </h2>
            <div className="text-xs text-text-muted flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              Waiting for players...
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <p className="text-text-muted text-sm">Player list will appear here</p>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-dark-surface2 border border-border-light rounded-3xl p-5">
            <div className="text-xs font-bold mb-3">Quiz Preview</div>
            <p className="text-text-muted text-sm">Quiz info will appear here</p>
          </div>

          <div className="bg-dark-surface2 border border-border-light rounded-3xl p-4 flex-1">
            <div className="text-xs font-bold mb-3 flex items-center gap-1.5">
              <span>💬</span> Chat
              <span className="text-xs bg-brand-green text-white px-2 py-0.5 rounded-full">Live</span>
            </div>
            <div className="text-text-muted text-sm">Chat messages will appear here</div>
          </div>

          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-light text-white font-semibold text-sm cursor-pointer transition-all disabled:opacity-50">
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
