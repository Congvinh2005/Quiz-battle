"use client";

import { useParams } from "next/navigation";
import GameplayScreen from "@/components/screens/GameplayScreen";

export default function Game() {
  const params = useParams();
  const roomCode = params?.roomCode as string;

  return <GameplayScreen roomCode={roomCode} />;
}
