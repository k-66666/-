import { useState, useEffect } from 'react';
import { Question, UserProgress, INITIAL_PROGRESS } from '../types';
import { SEED_QUESTIONS } from '../data/seed';

// Updated storage key to force fresh data load for new complex distractors
const STORAGE_KEY_QUESTIONS = 'dm_questions_v6';
const STORAGE_KEY_PROGRESS = 'dm_progress_v6';

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
      const currentStat = prev.questionStats[questionId] || { attempts: [], lastAttemptAt: 0 };
      
      const newStat = {
        attempts: [...currentStat.attempts, isCorrect],
        lastAttemptAt: Date.now()
      };

      const newStreak = isCorrect ? prev.streak + 1 : 0;

      return {
        totalAnswered: prev.totalAnswered + 1,
        streak: newStreak,
        questionStats: {
          ...prev.questionStats,
          [questionId]: newStat
        }
      };
    });
  };

  const resetProgress = () => {
    setProgress(INITIAL_PROGRESS);
  };

  // Helper: Get questions that have been attempted and have WRONG answers in their history
  // or the last attempt was wrong
  const getMistakes = () => {
    return questions.filter(q => {
      const stat = progress.questionStats[q.id];
      if (!stat || stat.attempts.length === 0) return false;
      // If last attempt was wrong, it's definitely a mistake to review
      if (stat.attempts[stat.attempts.length - 1] === false) return true;
      // If it has ever been wrong, include it (optional strict mode)
      return stat.attempts.includes(false);
    });
  };

  return {
    questions,
    progress,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    recordAttempt,
    resetProgress,
    getMistakes,
    loading
  };
};