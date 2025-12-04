export enum QuestionType {
  CHOICE = 'CHOICE',
  JUDGE = 'JUDGE',
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[]; // Only for CHOICE
  correctAnswer: string | string[] | boolean; // Changed to support multi-select
  mnemonic?: string; // 巧记
  analysis?: string; // 深度辨析/理由
  tags?: string[];
}

export interface QuestionStat {
  attempts: boolean[]; // List of true/false for every attempt
  lastAttemptAt: number; // Timestamp
}

export interface UserProgress {
  totalAnswered: number; // Total attempts made
  streak: number; // Current streak of correct answers
  questionStats: Record<string, QuestionStat>;
  pinnedMistakes: string[]; // IDs of questions explicitly kept in mistake bank
}

export const INITIAL_PROGRESS: UserProgress = {
  totalAnswered: 0,
  streak: 0,
  questionStats: {},
  pinnedMistakes: []
};