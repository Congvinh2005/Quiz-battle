// services/importService.ts
import apiClient from "./api";

export interface EditorQuestion {
  id: string;
  text: string;
  type: 'MCQ' | 'TRUE_FALSE';
  options: string[];
  correctIndex: number;
  timeLimit: number;
  points: number;
}

export interface ImportedQuestion {
  text: string;
  type: 'MCQ' | 'TRUE_FALSE';
  options: string[];
  correctIndex: number;
  timeLimit?: number;
  points?: number;
  id?: string;
}

/**
 * Main import handler - sends file to backend API for parsing
 * Backend handles: .xlsx, .csv, .docx
 * Backend detects correct answers from highlighting (yellow color)
 */
export async function importQuestions(file: File): Promise<EditorQuestion[]> {
  const fileName = file.name.toLowerCase();
  let endpoint = '/import/parse-excel';
  
  // Determine which endpoint to use based on file type
  if (fileName.endsWith('.csv')) {
    endpoint = '/import/parse-csv';
  } else if (fileName.endsWith('.docx')) {
    endpoint = '/import/parse-docx';
  } else if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
    throw new Error('Unsupported file format. Please use .xlsx, .csv, or .docx');
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await apiClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const data = response.data;
    
    // Convert API response to EditorQuestion format
    return data.questions.map((q: ImportedQuestion, idx: number) => ({
      id: q.id || `q${Date.now()}-${idx}`,
      text: q.text,
      type: q.type || 'MCQ',
      timeLimit: q.timeLimit || 30,
      points: q.points || 100,
      options: q.options || ['', '', '', ''],
      correctIndex: q.correctIndex ?? 0,
    }));
  } catch (error) {
    console.error('Import error:', error);
    if (error && typeof error === "object" && "response" in error) {
      const apiError = error as { response?: { data?: { detail?: string } } };
      throw new Error(apiError.response?.data?.detail || "Failed to parse file");
    }
    throw error instanceof Error ? error : new Error('Unknown import error');
  }
}
