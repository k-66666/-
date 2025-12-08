
export enum QuestionType {
  CHOICE = 'CHOICE',
  JUDGE = 'JUDGE',
  ESSAY = 'ESSAY', // New type for big questions
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  options?: string[]; // Only for CHOICE
  correctAnswer: string | string[] | boolean; // For ESSAY, this can be the full standard answer text
  keyPoints?: string[]; // For ESSAY: List of specific scoring points for visualization
  mnemonic?: string; // 巧记
  analysis?: string; // 深度辨析/理由
  tags?: string[];
  category?: string;
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
  rounds?: Record<string, number>; // Mapping of category -> number of completed rounds (0-indexed, so 0 is Round 1)
}

export const INITIAL_PROGRESS: UserProgress = {
  totalAnswered: 0,
  streak: 0,
  questionStats: {},
  pinnedMistakes: [],
  rounds: {}
};
