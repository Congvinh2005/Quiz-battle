"use client";

import { useParams } from "next/navigation";
import LobbyScreen from "@/components/screens/LobbyScreen";

export default function Lobby() {
  const params = useParams();
  const roomCode = params?.roomCode as string;

  return <LobbyScreen roomCode={roomCode} />;
}
