"use client";

import { useParams } from "next/navigation";
import ResultScreen from "@/components/screens/ResultScreen";

export default function Results() {
  const params = useParams();
  const roomCode = params?.roomCode as string;

  return <ResultScreen roomCode={roomCode} />;
}
