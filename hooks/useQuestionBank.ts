import { useState, useEffect } from 'react';
import { Question, UserProgress, INITIAL_PROGRESS } from '../types';
import { SEED_QUESTIONS } from '../data/seed';

// Updated storage keys to force fresh data load
const STORAGE_KEY_QUESTIONS = 'dm_questions_v5';
const STORAGE_KEY_PROGRESS = 'dm_progress_v5';

export const useQuestionBank = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const storedQuestions = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    const storedProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);

    if (storedQuestions) {
      setQuestions(JSON.parse(storedQuestions));
    } else {
      setQuestions(SEED_QUESTIONS);
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(SEED_QUESTIONS));
    }

    if (storedProgress) {
      setProgress(JSON.parse(storedProgress));
    }

    setLoading(false);
  }, []);

  // Save changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(questions));
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    }
  }, [questions, progress, loading]);

  const addQuestion = (q: Question) => {
    setQuestions(prev => [...prev, q]);
  };

  const updateQuestion = (updatedQ: Question) => {
    setQuestions(prev => prev.map(q => q.id === updatedQ.id ? updatedQ : q));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const recordAttempt = (questionId: string, isCorrect: boolean) => {
    setProgress(prev => {
      const stats = prev.questionStats[questionId] || { answered: 0, correct: 0, lastAttemptCorrect: false };
      
      const newStats = {
        answered: stats.answered + 1,
        correct: stats.correct + (isCorrect ? 1 : 0),
        lastAttemptCorrect: isCorrect
      };

      return {
        totalAnswered: prev.totalAnswered + 1,
        correctCount: prev.correctCount + (isCorrect ? 1 : 0),
        questionStats: {
          ...prev.questionStats,
          [questionId]: newStats
        }
      };
    });
  };

  const resetProgress = () => {
    setProgress(INITIAL_PROGRESS);
  };

  return {
    questions,
    progress,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    recordAttempt,
    resetProgress,
    loading
  };
};