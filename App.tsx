import React, { useState } from 'react';
import { useQuestionBank } from './hooks/useQuestionBank';
import { Layout } from './components/Layout';
import { QuizCard } from './components/QuizCard';
import { StatsView } from './components/StatsView';
import { QuestionManager } from './components/QuestionManager';
import { Question } from './types';
import { RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const { questions, progress, addQuestion, deleteQuestion, recordAttempt, resetProgress, loading } = useQuestionBank();
  const [activeTab, setActiveTab] = useState<'quiz' | 'stats' | 'manage'>('quiz');
  
  // Logic to determine which question to show next
  // We prefer: 1. Unanswered questions, 2. Wrong answers, 3. Random
  const getNextQuestion = (): Question | null => {
    if (questions.length === 0) return null;

    // 1. Unanswered
    const unanswered = questions.filter(q => !progress.questionStats[q.id]);
    if (unanswered.length > 0) {
      return unanswered[Math.floor(Math.random() * unanswered.length)];
    }

    // 2. Wrong last attempt
    const wrong = questions.filter(q => {
      const stats = progress.questionStats[q.id];
      return stats && !stats.lastAttemptCorrect;
    });
    if (wrong.length > 0) {
      return wrong[Math.floor(Math.random() * wrong.length)];
    }

    // 3. Random fallback
    return questions[Math.floor(Math.random() * questions.length)];
  };

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Initialize first question when data loads
  React.useEffect(() => {
    if (!loading && questions.length > 0 && !currentQuestion) {
      setCurrentQuestion(getNextQuestion());
    }
  }, [loading, questions]);

  const handleAnswer = (isCorrect: boolean) => {
    if (currentQuestion) {
      recordAttempt(currentQuestion.id, isCorrect);
    }
  };

  const handleNext = () => {
    const next = getNextQuestion();
    setCurrentQuestion(next);
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-primary font-bold">Loading...</div>;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'quiz' && (
        <div className="h-full flex flex-col">
          {currentQuestion ? (
            <QuizCard 
              question={currentQuestion} 
              onAnswer={handleAnswer} 
              onNext={handleNext}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <p>题库为空，请先添加题目。</p>
              <button onClick={() => setActiveTab('manage')} className="text-primary font-bold">去添加</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="h-full flex flex-col">
            <StatsView progress={progress} totalQuestions={questions.length} />
            <button 
                onClick={resetProgress}
                className="mt-8 mx-auto flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
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
          onDelete={deleteQuestion} 
        />
      )}
    </Layout>
  );
};

export default App;