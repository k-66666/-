import React, { useState, useMemo } from 'react';
import { useQuestionBank } from './hooks/useQuestionBank';
import { Layout } from './components/Layout';
import { QuizCard } from './components/QuizCard';
import { StatsView } from './components/StatsView';
import { QuestionManager } from './components/QuestionManager';
import { Question } from './types';
import { RotateCcw, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const { questions, progress, addQuestion, updateQuestion, deleteQuestion, recordAttempt, resetProgress, getMistakes, loading } = useQuestionBank();
  const [activeTab, setActiveTab] = useState<'quiz' | 'stats' | 'manage'>('quiz');
  
  // Mistake Mode State
  const [mistakeMode, setMistakeMode] = useState(false);
  
  const mistakeQuestions = useMemo(() => getMistakes(), [questions, progress]);
  
  // Logic to determine which question to show next
  const getNextQuestion = (): Question | null => {
    let pool = questions;

    // Filter if in mistake mode
    if (mistakeMode) {
      if (mistakeQuestions.length === 0) return null;
      pool = mistakeQuestions;
    }

    if (pool.length === 0) return null;

    // Algorithm:
    // 1. Prioritize Unanswered (if not in mistake mode)
    if (!mistakeMode) {
        const unanswered = pool.filter(q => !progress.questionStats[q.id]);
        if (unanswered.length > 0) {
            return unanswered[Math.floor(Math.random() * unanswered.length)];
        }
    }

    // 2. Prioritize WRONG last attempt
    const wrongLast = pool.filter(q => {
      const stats = progress.questionStats[q.id];
      return stats && stats.attempts.length > 0 && !stats.attempts[stats.attempts.length - 1];
    });
    if (wrongLast.length > 0) {
      return wrongLast[Math.floor(Math.random() * wrongLast.length)];
    }

    // 3. Random fallback
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Initialize/Update question when modes change or data loads
  React.useEffect(() => {
    if (!loading && questions.length > 0) {
        // Only set if null or we switched modes
        setCurrentQuestion(getNextQuestion());
    }
  }, [loading, questions.length, mistakeMode]);

  const handleAnswer = (isCorrect: boolean) => {
    if (currentQuestion) {
      recordAttempt(currentQuestion.id, isCorrect);
    }
  };

  const handleNext = () => {
    const next = getNextQuestion();
    setCurrentQuestion(next);
  };

  // Calculate global mastery for the progress bar
  // Definition of Mastery: Attempted at least once AND last attempt was correct
  const masteredCount = Object.values(progress.questionStats).filter(s => s.attempts.length > 0 && s.attempts[s.attempts.length - 1] === true).length;
  const masteryPercentage = questions.length > 0 ? Math.round((masteredCount / questions.length) * 100) : 0;

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-primary font-bold">Loading...</div>;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'quiz' && (
        <div className="h-full flex flex-col">
            {/* Mistake Mode Toggle */}
            <div className="mb-4 flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setMistakeMode(!mistakeMode)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1 ${mistakeMode ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-slate-100 text-slate-500'}`}
                    >
                        <AlertTriangle className="w-3 h-3" />
                        {mistakeMode ? '错题本模式 ON' : '错题本模式 OFF'}
                    </button>
                    {mistakeMode && (
                        <span className="text-xs text-red-400 font-medium">
                            剩余 {mistakeQuestions.length} 题
                        </span>
                    )}
                </div>
            </div>

          {currentQuestion ? (
            <QuizCard 
              question={currentQuestion}
              streak={progress.streak}
              masteryPercentage={masteryPercentage}
              onAnswer={handleAnswer} 
              onNext={handleNext}
            />
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 p-8 text-center">
              {mistakeMode ? (
                  <>
                    <div className="p-4 bg-green-100 text-green-600 rounded-full mb-2"><RotateCcw className="w-8 h-8"/></div>
                    <p className="font-bold text-slate-700">太棒了！错题已全部消灭。</p>
                    <button onClick={() => setMistakeMode(false)} className="text-primary font-bold underline">返回普通模式</button>
                  </>
              ) : (
                  <>
                     <p>题库为空，请先添加题目。</p>
                     <button onClick={() => setActiveTab('manage')} className="text-primary font-bold">去添加</button>
                  </>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="h-full flex flex-col">
            <StatsView progress={progress} totalQuestions={questions.length} />
            <button 
                onClick={() => { if(confirm('确定要重置所有进度吗？')) resetProgress(); }}
                className="mt-8 mx-auto flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors p-4"
            >
                <RotateCcw className="w-4 h-4" />
                重置学习进度
            </button>
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