
import { useState, useEffect } from 'react';
import { Question, UserProgress, INITIAL_PROGRESS } from '../types';
import { SEED_QUESTIONS } from '../data/seed';

// Updated storage key to v11 to support new rounds field
const STORAGE_KEY_QUESTIONS = 'dm_questions_v11';
const STORAGE_KEY_PROGRESS = 'dm_progress_v11';

export const useQuestionBank = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const storedQuestions = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    const storedProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);

    if (storedQuestions) {
      const parsedStored: Question[] = JSON.parse(storedQuestions);
      
      // MERGE LOGIC: Add any questions from SEED that are missing in Stored
      const storedIds = new Set(parsedStored.map(q => q.id));
      const newFromSeed = SEED_QUESTIONS.filter(seedQ => !storedIds.has(seedQ.id));
      
      const combined = [...parsedStored, ...newFromSeed];
      
      // Migration: Ensure categories are set
      const migrated = combined.map(q => {
          if (!q.category) {
              if (q.id.startsWith('zhongte_')) return { ...q, category: '中特' };
              return { ...q, category: '自然辩证法' };
          }
          return q;
      });

      setQuestions(migrated);
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(migrated));

    } else {
      setQuestions(SEED_QUESTIONS);
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(SEED_QUESTIONS));
    }

    if (storedProgress) {
      const parsed = JSON.parse(storedProgress);
      // Migration: Add rounds if missing
      if (!parsed.rounds) parsed.rounds = {};
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
      
      let newPinned = prev.pinnedMistakes || [];
      if (keepInMistakes) {
          if (!newPinned.includes(questionId)) newPinned = [...newPinned, questionId];
      } else if (isCorrect) {
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

  const completeRound = (category: string) => {
    setProgress(prev => ({
        ...prev,
        rounds: {
            ...prev.rounds,
            [category]: (prev.rounds?.[category] || 0) + 1
        }
    }));
  };

  const resetProgress = () => {
    setProgress(INITIAL_PROGRESS);
  };

  const getMistakes = () => {
    return questions.filter(q => {
      if (progress.pinnedMistakes?.includes(q.id)) return true;
      const stats = progress.questionStats[q.id];
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
    completeRound,
    resetProgress,
    getMistakes
  };
};
