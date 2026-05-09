"use client";

import { useParams } from "next/navigation";
import QuizEditorScreen from "@/components/screens/QuizEditorScreen";

export default function EditQuizPage() {
  const params = useParams();
  const quizId = params?.id as string;

  return <QuizEditorScreen quizId={quizId} />;
}
