"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { GameRoom, RoomPlayer, Question, WSGameState } from "@/types";

interface GameContextType {
  currentRoom: GameRoom | null;
  setCurrentRoom: (room: GameRoom | null) => void;
  currentQuestion: Question | null;
  setCurrentQuestion: (question: Question | null) => void;
  players: RoomPlayer[];
  setPlayers: (players: RoomPlayer[]) => void;
  gameState: WSGameState | null;
  setGameState: (state: WSGameState | null) => void;
  timeRemaining: number;
  setTimeRemaining: (time: number) => void;
  hasAnswered: boolean;
  setHasAnswered: (answered: boolean) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const [gameState, setGameState] = useState<WSGameState | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);

  return (
    <GameContext.Provider
      value={{
        currentRoom,
        setCurrentRoom,
        currentQuestion,
        setCurrentQuestion,
        players,
        setPlayers,
        gameState,
        setGameState,
        timeRemaining,
        setTimeRemaining,
        hasAnswered,
        setHasAnswered,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};
