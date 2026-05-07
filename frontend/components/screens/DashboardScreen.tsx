"use client";

import React from "react";

export default function DashboardScreen() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-syne text-4xl font-extrabold mb-2">Welcome back!</h1>
        <p className="text-text-muted text-sm">Select a quiz or create a new room to get started</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Placeholder for quiz grid */}
        <div className="bg-dark-surface2 border border-border-light rounded-card p-6 text-center">
          <p className="text-text-muted">Quiz list will appear here</p>
        </div>
      </div>
    </div>
  );
}
