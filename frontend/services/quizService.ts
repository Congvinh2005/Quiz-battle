import apiClient from "./api";
import { Quiz, Question } from "@/types";

export const quizService = {
  // Get all quizzes
  getAllQuizzes: async (): Promise<Quiz[]> => {
    const response = await apiClient.get<Quiz[]>("/quizzes");
    return response.data;
  },

  // Get quiz by ID
  getQuizById: async (quizId: string): Promise<Quiz> => {
    const response = await apiClient.get<Quiz>(`/quizzes/${quizId}`);
    return response.data;
  },

  // Create new quiz
  createQuiz: async (data: Partial<Quiz>): Promise<Quiz> => {
    const response = await apiClient.post<Quiz>("/quizzes", data);
    return response.data;
  },

  // Update quiz
  updateQuiz: async (quizId: string, data: Partial<Quiz>): Promise<Quiz> => {
    const response = await apiClient.put<Quiz>(`/quizzes/${quizId}`, data);
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (quizId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${quizId}`);
  },

  // Get quiz questions
  getQuestions: async (quizId: string): Promise<Question[]> => {
    const response = await apiClient.get<Question[]>(`/quizzes/${quizId}/questions`);
    return response.data;
  },

  // Add question
  addQuestion: async (quizId: string, data: Partial<Question>): Promise<Question> => {
    const response = await apiClient.post<Question>(`/quizzes/${quizId}/questions`, data);
    return response.data;
  },

  // Update question
  updateQuestion: async (quizId: string, questionId: string, data: Partial<Question>): Promise<Question> => {
    const response = await apiClient.put<Question>(`/quizzes/${quizId}/questions/${questionId}`, data);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (quizId: string, questionId: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${quizId}/questions/${questionId}`);
  },
};
