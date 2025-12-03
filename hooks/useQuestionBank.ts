import { useState, useEffect } from 'react';
import { Question, UserProgress, INITIAL_PROGRESS } from '../types';
import { SEED_QUESTIONS } from '../data/seed';

// Updated storage key to v7 for new pinning feature
const STORAGE_KEY_QUESTIONS = 'dm_questions_v7';
const STORAGE_KEY_PROGRESS = 'dm_progress_v7';

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
      const parsed = JSON.parse(storedProgress);
      // Ensure pinnedMistakes exists for migration
      if (!parsed.pinnedMistakes) parsed.pinnedMistakes = [];
      setProgress(parsed);
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
      
      // Auto-remove from pinned if correct (default behavior, unless toggled back via togglePin)
      // Actually, standard behavior: if you get it right, we don't automatically unpin. 
      // Pinning is manual. "Mistake" status is automatic.
      // But for the "Mistake Mode" logic: a question is a mistake if (LastAttempt=False OR Pinned=True).
      // So if I answer correct, LastAttempt=True. If it was NOT pinned, it drops out of mistakes.
      // If it WAS pinned, it stays in mistakes.

      return {
        ...prev,
        streak: newStreak,
        totalAnswered: prev.totalAnswered + 1,
        questionStats: {
          ...prev.questionStats,
          [questionId]: newStat
        }
      };
    });
  };

  const togglePin = (questionId: string) => {
    setProgress(prev => {
      const currentPinned = prev.pinnedMistakes || [];
      const isPinned = currentPinned.includes(questionId);
      
      let newPinned;
      if (isPinned) {
        newPinned = currentPinned.filter(id => id !== questionId);
      } else {
        newPinned = [...currentPinned, questionId];
      }

      return {
        ...prev,
        pinnedMistakes: newPinned
      };
    });
  };

  const resetProgress = () => {
    setProgress(INITIAL_PROGRESS);
  };

  const getMistakes = () => {
    return questions.filter(q => {
      // Is Pinned?
      if (progress.pinnedMistakes?.includes(q.id)) return true;

      const stats = progress.questionStats[q.id];
      // Has stats and last attempt was WRONG
      if (stats && stats.attempts.length > 0) {
        return !stats.attempts[stats.attempts.length - 1];
      }
      return false;
    });
  };

  return {
    questions,
    progress,
    loading,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    recordAttempt,
    togglePin,
    resetProgress,
    getMistakes
  };
};