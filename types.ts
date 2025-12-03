export enum QuestionType {
  CHOICE = 'CHOICE',
  JUDGE = 'JUDGE',
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

export interface QuestionStat {
  attempts: boolean[]; // List of true/false for every attempt: [false, false, true]
  lastAttemptAt: number; // Timestamp
}

export interface UserProgress {
  totalAnswered: number; // Total attempts made
  streak: number; // Current streak of correct answers
  questionStats: Record<string, QuestionStat>;
}

export const INITIAL_PROGRESS: UserProgress = {
  totalAnswered: 0,
  streak: 0,
  questionStats: {}
};