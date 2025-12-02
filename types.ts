export enum QuestionType {
  CHOICE = 'CHOICE', // Single or Multi choice treated as picking the right option text
  JUDGE = 'JUDGE',   // True/False
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[]; // Only for CHOICE
  correctAnswer: string | boolean; 
  mnemonic?: string; // 巧记
  tags?: string[];
}

export interface UserProgress {
  totalAnswered: number;
  correctCount: number;
  questionStats: Record<string, {
    answered: number;
    correct: number;
    lastAttemptCorrect: boolean;
  }>;
}

export const INITIAL_PROGRESS: UserProgress = {
  totalAnswered: 0,
  correctCount: 0,
  questionStats: {}
};