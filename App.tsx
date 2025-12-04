import React, { useState, useMemo, useEffect } from 'react';
import { useQuestionBank } from './hooks/useQuestionBank';
import { Layout } from './components/Layout';
import { QuizCard } from './components/QuizCard';
import { StatsView } from './components/StatsView';
import { QuestionManager } from './components/QuestionManager';
import { Question, QuestionStat } from './types';
import { RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const { questions, progress, addQuestion, updateQuestion, deleteQuestion, recordAttempt, togglePin, resetProgress, getMistakes, loading } = useQuestionBank();
  const [activeTab, setActiveTab] = useState<'quiz' | 'mistakes' | 'stats' | 'manage'>('quiz');
  
  // Theme Management
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Key to force re-render of QuizCard (useful for "Retry" functionality)
  const [quizKey, setQuizKey] = useState(0);

  useEffect(() => {
    // Check system preference on load
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  const mistakeQuestions = useMemo(() => getMistakes(), [questions, progress]);
  const isMistakeMode = activeTab === 'mistakes';
  
  const getNextQuestion = (): Question | null => {
    let pool = questions;

    if (isMistakeMode) {
      if (mistakeQuestions.length === 0) return null;
      pool = mistakeQuestions;
    }

    if (pool.length === 0) return null;

    if (!isMistakeMode) {
        const unanswered = pool.filter(q => !progress.questionStats[q.id]);
        if (unanswered.length > 0) {
            return unanswered[Math.floor(Math.random() * unanswered.length)];
        }
    }

    const wrongLast = pool.filter(q => {
      const stats = progress.questionStats[q.id];
      return stats && stats.attempts.length > 0 && !stats.attempts[stats.attempts.length - 1];
    });
    if (wrongLast.length > 0) {
      return wrongLast[Math.floor(Math.random() * wrongLast.length)];
    }

    return pool[Math.floor(Math.random() * pool.length)];
  };

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Initial load
  React.useEffect(() => {
    if (!loading && questions.length > 0 && !currentQuestion) {
        setCurrentQuestion(getNextQuestion());
    }
  }, [loading, questions.length, activeTab]); 

  // Watch for mistake mode clearing
  React.useEffect(() => {
    if (isMistakeMode && mistakeQuestions.length === 0) {
      setCurrentQuestion(null);
    }
  }, [mistakeQuestions.length, isMistakeMode]);

  const handleAnswer = (isCorrect: boolean) => {
    if (currentQuestion) {
      recordAttempt(currentQuestion.id, isCorrect);
    }
  };

  const handleNext = () => {
    const next = getNextQuestion();
    setCurrentQuestion(next);
    setQuizKey(k => k + 1); // Ensure fresh state for next question
  };

  const handleRetry = () => {
    setQuizKey(k => k + 1); // Force re-render of current question
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
  }

  // Handle direct review from Stats page
  const handleReview = (q: Question) => {
      setCurrentQuestion(q);
      setActiveTab('quiz');
      setQuizKey(k => k + 1);
  };

  // Stats Calculation
  const masteredCount = (Object.values(progress.questionStats) as QuestionStat[]).filter(s => s.attempts.length > 0 && s.attempts[s.attempts.length - 1] === true).length;
  const masteryPercentage = questions.length > 0 ? Math.round((masteredCount / questions.length) * 100) : 0;
  
  // New Stats for QuizCard
  const distinctAnsweredCount = Object.keys(progress.questionStats).length;
  const totalQuestionsCount = questions.length;
  const currentMistakeCount = mistakeQuestions.length;

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-blue-600 font-bold dark:bg-slate-950 dark:text-blue-400">数据加载中...</div>;
  }

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={(tab) => { setActiveTab(tab); setQuizKey(k => k + 1); setCurrentQuestion(null); }}
      theme={theme}
      toggleTheme={toggleTheme}
    >
      {(activeTab === 'quiz' || activeTab === 'mistakes') && (
        <div className="h-full flex flex-col">
            {/* Mistake Tab Header Info */}
            {activeTab === 'mistakes' && (
                <div className="mb-4 px-2">
                    <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>错题本 ({currentMistakeCount})</span>
                         </div>
                         <span className="text-xs text-orange-600 dark:text-orange-500">做对即移出</span>
                    </div>
                </div>
            )}

          {currentQuestion ? (
            <QuizCard 
              key={quizKey}
              question={currentQuestion}
              streak={progress.streak}
              masteryPercentage={masteryPercentage}
              answeredCount={distinctAnsweredCount}
              totalCount={totalQuestionsCount}
              mistakeCount={currentMistakeCount}
              isPinned={progress.pinnedMistakes?.includes(currentQuestion.id) || false}
              onAnswer={handleAnswer} 
              onNext={handleNext}
              onRetry={handleRetry}
              onTogglePin={() => handleTogglePin(currentQuestion.id)}
              isMistakeMode={isMistakeMode}
            />
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-6 p-8 text-center animate-pop">
              {activeTab === 'mistakes' ? (
                  <>
                    <div className="p-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-2">
                        <CheckCircle2 className="w-12 h-12"/>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">错题已清零！</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">你太棒了，所有错题都已攻克。</p>
                    </div>
                    <button 
                        onClick={() => setActiveTab('quiz')} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                    >
                        去刷题
                    </button>
                  </>
              ) : (
                  <>
                     <p className="text-slate-500 dark:text-slate-400">题库为空，请先添加题目。</p>
                     <button onClick={() => setActiveTab('manage')} className="text-blue-600 font-bold dark:text-blue-400">去添加</button>
                  </>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="h-full flex flex-col">
            <StatsView 
                progress={progress} 
                totalQuestions={questions.length} 
                questions={questions} 
                onReview={handleReview}
            />
            <div className="mt-8 flex justify-center">
                <button 
                    onClick={() => { if(confirm('确定要重置所有学习进度吗？这将清空所有答题记录。')) resetProgress(); }}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors p-4 dark:hover:text-red-400"
                >
                    <RotateCcw className="w-4 h-4" />
                    重置学习进度
                </button>
            </div>
        </div>
      )}

      {activeTab === 'manage' && (
        <QuestionManager 
          questions={questions} 
          onAdd={addQuestion} 
          onUpdate={updateQuestion}
          onDelete={deleteQuestion} 
        />
      )}
    </Layout>
  );
};

export default App;