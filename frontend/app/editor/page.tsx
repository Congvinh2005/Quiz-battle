"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import QuizEditorScreen from "@/components/screens/QuizEditorScreen";

export default function Editor() {
  const params = useParams();
  const quizId = params?.id as string | undefined;

  return <QuizEditorScreen quizId={quizId} />;
}
