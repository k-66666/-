
import { useState, useEffect } from 'react';
import { Question, UserProgress, INITIAL_PROGRESS } from '../types';
import { SEED_QUESTIONS } from '../data/seed';

// Updated storage key to v9 for Option Letter Fix
const STORAGE_KEY_QUESTIONS = 'dm_questions_v9';
const STORAGE_KEY_PROGRESS = 'dm_progress_v9';

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

  const recordAttempt = (questionId: string, isCorrect: boolean, keepInMistakes: boolean = false) => {
    setProgress(prev => {
      const currentStat = prev.questionStats[questionId] || { attempts: [], lastAttemptAt: 0 };
      
      const newStat = {
        attempts: [...currentStat.attempts, isCorrect],
        lastAttemptAt: Date.now()
      };

      const newStreak = isCorrect ? prev.streak + 1 : 0;
      
      // Manage pinned list
      let newPinned = prev.pinnedMistakes || [];
      if (keepInMistakes) {
          if (!newPinned.includes(questionId)) newPinned = [...newPinned, questionId];
      } else if (isCorrect) {
          // If correct and NOT asked to keep, remove from pin
          newPinned = newPinned.filter(id => id !== questionId);
      }

      return {
        ...prev,
        streak: newStreak,
        totalAnswered: prev.totalAnswered + 1,
        pinnedMistakes: newPinned,
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
