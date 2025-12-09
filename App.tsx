
import React, { useState, useMemo, useEffect } from 'react';
import { useQuestionBank } from './hooks/useQuestionBank';
import { Layout } from './components/Layout';
import { QuizCard } from './components/QuizCard';
import { StatsView } from './components/StatsView';
import { QuestionManager } from './components/QuestionManager';
import { DeckSelection } from './components/DeckSelection';
import { SubDeckSelection, SubDeckConfig } from './components/SubDeckSelection';
import { QuestionList } from './components/QuestionList';
import { Question, QuestionStat } from './types';
import { RotateCcw, AlertTriangle, CheckCircle2, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const { questions: allQuestions, progress, addQuestion, updateQuestion, deleteQuestion, recordAttempt, togglePin, completeRound, resetProgress, getMistakes, loading } = useQuestionBank();
  
  // State
  const [activeTab, setActiveTab] = useState<'quiz' | 'mistakes' | 'stats' | 'manage'>('quiz');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subDeckConfig, setSubDeckConfig] = useState<SubDeckConfig | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [quizKey, setQuizKey] = useState(0);

  // Settings State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  
  // Question State
  const [currentQuizQ, setCurrentQuizQ] = useState<Question | null>(null);
  const [currentMistakeQ, setCurrentMistakeQ] = useState<Question | null>(null);

  // History Stack for Previous Button
  const [history, setHistory] = useState<Question[]>([]);
  // Session stats for real-time accuracy (reset on deck change)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [showQuestionList, setShowQuestionList] = useState(false);

  // Filtered Questions based on Category AND SubDeck Config
  const questions = useMemo(() => {
    if (!selectedCategory) return [];
    let qs = allQuestions.filter(q => q.category === selectedCategory);
    
    // Apply SubDeck Filter (Assuming ZhongTe uses ID format "zhongte_123")
    if (selectedCategory === '中特' && subDeckConfig) {
        if (subDeckConfig.type === 'tag' && subDeckConfig.tag) {
             // Filter by Tag (e.g., "2022真题")
             qs = qs.filter(q => q.tags?.includes(subDeckConfig.tag!));
        } else if (subDeckConfig.type === 'range') {
             // Filter by ID Range
             qs = qs.filter(q => {
                const match = q.id.match(/^zhongte_(\d+)$/);
                if (match) {
                    const num = parseInt(match[1]);
                    return num >= subDeckConfig.min! && num <= subDeckConfig.max!;
                }
                return false; // Strict mode for ranges: only numbered questions
             });
        }

        // Filter by Type (Strict Separation between Essay/Choice/Judge if requested)
        if (subDeckConfig.questionType) {
            qs = qs.filter(q => q.type === subDeckConfig.questionType);
        }
    }
    return qs;
  }, [allQuestions, selectedCategory, subDeckConfig]);

  // Round Logic
  const currentRoundIndex = useMemo(() => {
      if (!selectedCategory) return 0;
      return (progress.rounds?.[selectedCategory] || 0);
  }, [progress.rounds, selectedCategory]);

  const currentRoundDisplay = currentRoundIndex + 1;

  // Filter questions that have been answered ENOUGH times for the current round
  const answeredInCurrentRoundCount = useMemo(() => {
      if (!selectedCategory) return 0;
      return questions.filter(q => {
          const stats = progress.questionStats[q.id];
          return stats && stats.attempts.length > currentRoundIndex;
      }).length;
  }, [questions, progress.questionStats, currentRoundIndex, selectedCategory]);

  // Init Theme & Settings
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
    const savedSound = localStorage.getItem('dm_sound');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    
    const savedEffects = localStorage.getItem('dm_effects');
    if (savedEffects !== null) setEffectsEnabled(savedEffects === 'true');
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

  const toggleSound = () => {
      setSoundEnabled(prev => {
          const newVal = !prev;
          localStorage.setItem('dm_sound', String(newVal));
          return newVal;
      });
  };

  const toggleEffects = () => {
      setEffectsEnabled(prev => {
          const newVal = !prev;
          localStorage.setItem('dm_effects', String(newVal));
          return newVal;
      });
  };

  const mistakeQuestions = useMemo(() => {
      return getMistakes().filter(q => {
           // Apply same filter to mistakes
           if (q.category !== selectedCategory) return false;
           
           if (selectedCategory === '中特' && subDeckConfig) {
                if (subDeckConfig.type === 'tag' && subDeckConfig.tag) {
                    if (!q.tags?.includes(subDeckConfig.tag!)) return false;
                } else if (subDeckConfig.type === 'range') {
                    const match = q.id.match(/^zhongte_(\d+)$/);
                    if (match) {
                        const num = parseInt(match[1]);
                        if (!(num >= subDeckConfig.min! && num <= subDeckConfig.max!)) return false;
                    } else {
                        return false;
                    }
                }
                // Apply type filter to mistakes too
                if (subDeckConfig.questionType && q.type !== subDeckConfig.questionType) {
                    return false;
                }
           }
           return true;
      });
  }, [getMistakes, selectedCategory, subDeckConfig]);

  const isMistakeMode = activeTab === 'mistakes';
  
  // Helper to get next Quiz Question
  const getNextQuizQuestion = (): Question | null => {
    if (!selectedCategory) return null;
    
    // Quiz Mode: Prioritize questions NOT answered in THIS round
    const unansweredInRound = questions.filter(q => {
        const stats = progress.questionStats[q.id];
        return !stats || stats.attempts.length <= currentRoundIndex;
    });

    if (unansweredInRound.length > 0) {
        return unansweredInRound[Math.floor(Math.random() * unansweredInRound.length)];
    }
    
    return null; // Round Complete
  };

  // Helper to get next Mistake Question
  const getNextMistakeQuestion = (): Question | null => {
      if (!selectedCategory || mistakeQuestions.length === 0) return null;

      // Weighted random for wrong answers: prioritize questions answered wrong recently
      const wrongLast = mistakeQuestions.filter(q => {
        const stats = progress.questionStats[q.id] as QuestionStat | undefined;
        return stats && stats.attempts.length > 0 && !stats.attempts[stats.attempts.length - 1];
      });
      if (wrongLast.length > 0) {
        return wrongLast[Math.floor(Math.random() * wrongLast.length)];
      }

      return mistakeQuestions[Math.floor(Math.random() * mistakeQuestions.length)];
  };

  // Logic to load first question when entering a valid state
  useEffect(() => {
    if (!loading && selectedCategory) {
        // Only fetch if we DON'T have a question or if the current question is invalid for the new range
        if (!currentQuizQ && questions.length > 0) {
            const next = getNextQuizQuestion();
            if (next) setCurrentQuizQ(next);
        }
        
        if (!currentMistakeQ && mistakeQuestions.length > 0) {
            const next = getNextMistakeQuestion();
            if (next) setCurrentMistakeQ(next);
        }
    }
  }, [loading, questions.length, mistakeQuestions.length, selectedCategory, currentQuizQ, currentMistakeQ, currentRoundIndex, subDeckConfig]); 

  // Watch for mistake clearing: If we are in mistake mode, and we run out of mistakes, clear the current Q.
  useEffect(() => {
    if (mistakeQuestions.length === 0 && currentMistakeQ) {
      setCurrentMistakeQ(null);
    }
  }, [mistakeQuestions.length, currentMistakeQ]);

  // Derived active question based on tab
  const currentQuestion = isMistakeMode ? currentMistakeQ : currentQuizQ;

  const handleAnswer = (isCorrect: boolean) => {
    if (currentQuestion) {
      recordAttempt(currentQuestion.id, isCorrect);
      setSessionStats(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          total: prev.total + 1
      }));
    }
  };

  const handleNext = () => {
    if (currentQuestion) {
        setHistory(prev => [...prev, currentQuestion]);
    }

    if (isMistakeMode) {
        const next = getNextMistakeQuestion();
        setCurrentMistakeQ(next);
    } else {
        const next = getNextQuizQuestion();
        setCurrentQuizQ(next);
        
        // Auto redirect to stats if round is done
        if (!next) {
            setActiveTab('stats');
        }
    }
    setQuizKey(k => k + 1);
  };

  const handlePrevious = () => {
      if (history.length === 0) return;
      
      const prevQ = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      
      setHistory(newHistory);
      
      if (isMistakeMode) {
          setCurrentMistakeQ(prevQ);
      } else {
          setCurrentQuizQ(prevQ);
      }
      setQuizKey(k => k + 1);
  };

  const handleRetry = () => {
    setQuizKey(k => k + 1);
  };

  const handleTogglePin = (id: string) => {
    togglePin(id);
  }

  const handleReview = (q: Question) => {
      // Reviewing always puts us in Quiz mode context effectively, or we could just override currentQuizQ
      setCurrentQuizQ(q);
      setActiveTab('quiz');
      setQuizKey(k => k + 1);
  };

  const handleListSelect = (q: Question) => {
      // Jump to this question
      setCurrentQuizQ(q);
      setActiveTab('quiz');
      setShowQuestionList(false);
      setQuizKey(k => k + 1);
  }

  const handleCompleteRound = () => {
      if (selectedCategory) {
          completeRound(selectedCategory);
          setActiveTab('quiz');
          // Effect will trigger and load new question for next round
      }
  };

  const handleTabChange = (tab: 'quiz' | 'mistakes' | 'stats' | 'manage') => {
      if (tab === activeTab) return; // Prevent double-click reset
      setActiveTab(tab);
  };

  const handleSubDeckSelect = (config: SubDeckConfig | null) => {
      setSubDeckConfig(config);
      setCurrentQuizQ(null); // Reset current question when changing range
      setCurrentMistakeQ(null);
      setHistory([]); // Clear history on deck change
      setSessionStats({ correct: 0, total: 0 }); // Reset session stats
      setActiveTab('quiz');
  };

  const masteryPercentage = questions.length > 0 ? Math.round((answeredInCurrentRoundCount / questions.length) * 100) : 0;
  
  // Real-time accuracy calculation
  const currentAccuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-blue-600 font-bold dark:bg-slate-950 dark:text-blue-400">数据加载中...</div>;
  }

  // 1. Deck Selection Screen
  if (!selectedCategory) {
      return (
        <Layout 
            activeTab={activeTab} 
            onTabChange={() => {}} 
            theme={theme}
            toggleTheme={toggleTheme}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            effectsEnabled={effectsEnabled}
            toggleEffects={toggleEffects}
            title="华水期中神器"
            showNav={false}
        >
            <DeckSelection onSelect={(cat) => { setSelectedCategory(cat); setSubDeckConfig(null); setActiveTab('quiz'); setCurrentQuizQ(null); setCurrentMistakeQ(null); setHistory([]); setSessionStats({correct:0, total:0}); }} />
        </Layout>
      );
  }

  // 2. Sub-Deck Selection Screen (Only for ZhongTe when no range selected)
  if (selectedCategory === '中特' && !subDeckConfig) {
      return (
        <Layout 
            activeTab={activeTab} 
            onTabChange={() => {}} 
            theme={theme}
            toggleTheme={toggleTheme}
            soundEnabled={soundEnabled}
            toggleSound={toggleSound}
            effectsEnabled={effectsEnabled}
            toggleEffects={toggleEffects}
            title={selectedCategory}
            showNav={false}
        >
            <SubDeckSelection 
                category={selectedCategory} 
                questions={questions}
                progress={progress}
                onSelect={handleSubDeckSelect} 
                onBack={() => setSelectedCategory(null)} 
            />
        </Layout>
      );
  }

  // 3. Main App Layout
  return (
    <>
    <Layout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      theme={theme}
      toggleTheme={toggleTheme}
      soundEnabled={soundEnabled}
      toggleSound={toggleSound}
      effectsEnabled={effectsEnabled}
      toggleEffects={toggleEffects}
      title={subDeckConfig ? `${subDeckConfig.label}` : selectedCategory}
      onBack={selectedCategory === '中特' ? () => setSubDeckConfig(null) : () => { setSelectedCategory(null); setCurrentQuizQ(null); setCurrentMistakeQ(null); }}
    >
      {/* Quiz & Mistakes View (Hidden via CSS to persist state) */}
      <div className={`h-full flex flex-col ${activeTab === 'quiz' || activeTab === 'mistakes' ? '' : 'hidden'}`}>
            {activeTab === 'mistakes' && (
                <div className="mb-4 px-2">
                    <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg p-3 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            <span>错题本 ({mistakeQuestions.length})</span>
                         </div>
                         <span className="text-xs text-orange-600 dark:text-orange-500">做对即移出</span>
                    </div>
                </div>
            )}

          {currentQuestion ? (
            <QuizCard 
              key={quizKey} // QuizKey forces remount only when moving to next question (handleNext/handleRetry)
              question={currentQuestion}
              streak={progress.streak}
              masteryPercentage={masteryPercentage}
              answeredCount={answeredInCurrentRoundCount}
              totalCount={questions.length}
              mistakeCount={mistakeQuestions.length}
              isPinned={progress.pinnedMistakes?.includes(currentQuestion.id) || false}
              roundNumber={currentRoundDisplay}
              accuracy={currentAccuracy}
              soundEnabled={soundEnabled}
              effectsEnabled={effectsEnabled}
              onAnswer={handleAnswer} 
              onNext={handleNext}
              onPrevious={history.length > 0 ? handlePrevious : undefined}
              onRetry={handleRetry}
              onTogglePin={() => handleTogglePin(currentQuestion.id)}
              onShowList={() => setShowQuestionList(true)}
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
                        <p className="text-sm text-slate-500 dark:text-slate-400">你太棒了，当前范围所有错题都已攻克。</p>
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
                    {/* Quiz Mode Empty State */}
                    {questions.length === 0 ? (
                        <>
                             <p className="text-slate-500 dark:text-slate-400">题库为空，请先添加题目。</p>
                             <button onClick={() => setActiveTab('manage')} className="text-blue-600 font-bold dark:text-blue-400">去添加</button>
                        </>
                    ) : (
                        // Round Complete State
                        <>
                            <div className="p-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-2">
                                <Trophy className="w-12 h-12"/>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">本轮刷题完成！</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">第 {currentRoundDisplay} 轮已全部完成，请前往统计页面开启下一轮。</p>
                            </div>
                            <button 
                                onClick={() => setActiveTab('stats')} 
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all"
                            >
                                查看统计
                            </button>
                        </>
                    )}
                  </>
              )}
            </div>
          )}
      </div>

      {/* Stats View */}
      <div className={`h-full flex flex-col ${activeTab === 'stats' ? '' : 'hidden'}`}>
            <StatsView 
                progress={progress} 
                totalQuestions={questions.length} 
                questions={questions} 
                onReview={handleReview}
                currentRound={currentRoundDisplay}
                currentRoundProgress={answeredInCurrentRoundCount}
                onCompleteRound={handleCompleteRound}
            />
      </div>

      {/* Manage View */}
      <div className={`h-full flex flex-col ${activeTab === 'manage' ? '' : 'hidden'}`}>
            <QuestionManager 
            questions={questions} 
            onAdd={(q) => addQuestion({...q, category: selectedCategory})} 
            onUpdate={updateQuestion}
            onDelete={deleteQuestion} 
            />
      </div>
    </Layout>
    
    {showQuestionList && (
        <QuestionList 
            questions={questions}
            progress={progress}
            activeId={currentQuestion?.id}
            onSelect={handleListSelect}
            onClose={() => setShowQuestionList(false)}
        />
    )}
    </>
  );
};

export default App;
