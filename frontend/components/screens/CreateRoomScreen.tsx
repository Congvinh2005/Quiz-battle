"use client";

import React from "react";

export default function CreateRoomScreen() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-text-muted text-sm mb-2">← Back</p>
        <h1 className="font-syne text-3xl font-extrabold mb-1">Create Room</h1>
        <p className="text-text-muted text-sm">Set up your quiz room and invite friends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        {/* Form */}
        <div className="lg:col-span-2 bg-dark-surface2 border border-border-light rounded-3xl p-6">
          <p className="text-text-muted">Create room form will appear here</p>
        </div>

        {/* Preview */}
        <div className="bg-dark-surface2 border border-border-light rounded-3xl p-6 sticky top-20">
          <p className="text-text-muted">Room preview will appear here</p>
        </div>
      </div>
    </div>
  );
}
