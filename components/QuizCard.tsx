import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, BrainCircuit, Flame, AlertOctagon, RotateCcw, BookOpen, AlertTriangle } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  streak: number;
  masteryPercentage: number;
  answeredCount: number;
  totalCount: number;
  mistakeCount: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  isMistakeMode?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ 
    question, 
    streak, 
    masteryPercentage, 
    answeredCount, 
    totalCount, 
    mistakeCount, 
    onAnswer, 
    onNext, 
    isMistakeMode 
}) => {
  const [selectedOption, setSelectedOption] = useState<string | boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flashType, setFlashType] = useState<'none' | 'green' | 'red'>('none');

  useEffect(() => {
    // Reset state for new question
    setSelectedOption(null);
    setHasAnswered(false);
    setShowMnemonic(false);
    setIsShaking(false);
    setShowConfetti(false);
    setFlashType('none');
  }, [question]);

  const handleSelect = (option: string | boolean) => {
    if (hasAnswered) return;
    
    setSelectedOption(option);
    setHasAnswered(true);
    
    const isCorrect = option === question.correctAnswer;
    onAnswer(isCorrect);
    
    if (isCorrect) {
      setShowConfetti(true);
      setFlashType('green');
    } else {
      setIsShaking(true);
      setFlashType('red');
      setTimeout(() => setIsShaking(false), 400); 
      setShowMnemonic(true);
    }
  };

  const getOptionStyle = (option: string | boolean) => {
    // Linear / Flat Style Base
    const base = "transition-all duration-300 border-2 font-medium relative overflow-hidden";
    
    if (!hasAnswered) {
      // Default State
      return `${base} bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-[0.98]`;
    }
    
    if (option === question.correctAnswer) {
      // Correct Answer (Always Green, Scaled Up)
      // 即使没选它，它也是正确答案，必须亮绿灯
      return `${base} bg-green-500 border-green-500 text-white shadow-xl shadow-green-200/50 dark:shadow-none scale-[1.03] z-10 opacity-100`;
    }
    
    if (option === selectedOption && option !== question.correctAnswer) {
      // Wrong Selection (Gray + Strikethrough)
      // 选错变灰，加删除线，不再是红色
      return `${base} bg-slate-500 border-slate-500 text-white line-through opacity-90 animate-shake shadow-none`;
    }
    
    // Unselected & Incorrect (Fade out significantly)
    // 没选且不是答案的，大幅弱化
    return `${base} bg-slate-50 dark:bg-slate-950 border-transparent text-slate-300 dark:text-slate-800 opacity-30 grayscale cursor-not-allowed scale-95`;
  };

  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {[...Array(15)].map((_, i) => (
        <div key={i} className="confetti" style={{ 
          left: `${Math.random() * 100}%`, 
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)],
          animationDelay: `${Math.random() * 0.2}s`
        }} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full relative z-0">
      {/* Screen Flash Overlay */}
      {flashType === 'green' && <div className="absolute inset-0 z-10 animate-flash-green pointer-events-none rounded-3xl" />}
      {flashType === 'red' && <div className="absolute inset-0 z-10 animate-flash-red pointer-events-none rounded-3xl" />}
      
      {showConfetti && <Confetti />}

      {/* Top Info Bar */}
      <div className="flex items-center justify-between gap-4 mb-4 px-1">
          {/* Left: Progress Stats */}
          <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{answeredCount} / {totalCount}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg ${mistakeCount > 0 ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>错题 {mistakeCount}</span>
              </div>
          </div>

          {/* Right: Streak */}
          <div className={`flex items-center gap-1.5 font-bold transition-transform duration-300 ${streak > 0 ? 'scale-110' : ''}`}>
             <div className={`p-1 rounded-full ${streak > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
                 <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'animate-pulse' : ''}`} fill={streak > 0 ? "currentColor" : "none"} />
             </div>
             <span className={`text-sm ${streak > 0 ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`}>{streak}</span>
          </div>
      </div>

      {/* Mastery Bar */}
      <div className="mb-6 px-1">
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${masteryPercentage}%` }}
                />
            </div>
      </div>

      {/* Question Card */}
      <div className={`flex-shrink-0 mb-6 transition-all duration-300 ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${question.type === QuestionType.JUDGE ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                {question.type === QuestionType.JUDGE ? '判断题' : '选择题'}
            </span>
            {isMistakeMode && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    错题重练
                </span>
            )}
        </div>
        <h2 className="text-xl font-bold leading-relaxed text-slate-800 dark:text-slate-100">
          {question.content}
        </h2>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto pb-32 space-y-3 px-1">
        {question.type === QuestionType.JUDGE ? (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[true, false].map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={hasAnswered}
                className={`p-6 rounded-xl flex flex-col items-center justify-center gap-2 ${getOptionStyle(opt)}`}
              >
                {hasAnswered && opt === question.correctAnswer ? (
                    <CheckCircle2 className="w-8 h-8 mb-1" />
                ) : hasAnswered && opt === selectedOption ? (
                    <XCircle className="w-8 h-8 mb-1" />
                ) : null}
                <span className="text-lg font-bold">{opt ? '正确' : '错误'}</span>
              </button>
            ))}
          </div>
        ) : (
          question.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              disabled={hasAnswered}
              className={`w-full p-4 rounded-xl text-left flex items-start gap-3 group ${getOptionStyle(opt)}`}
            >
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 border transition-colors ${
                  hasAnswered 
                    ? (opt === question.correctAnswer ? 'border-white text-white' : (opt === selectedOption ? 'border-white text-white' : 'border-current opacity-60'))
                    : 'border-slate-300 dark:border-slate-600 text-slate-400 group-hover:border-blue-400 group-hover:text-blue-500'
              }`}>
                  {String.fromCharCode(65+idx)}
              </div>
              
              <span className="flex-1 leading-relaxed">{opt}</span>

              {hasAnswered && opt === question.correctAnswer && <CheckCircle2 className="w-5 h-5 shrink-0" />}
              {hasAnswered && opt === selectedOption && opt !== question.correctAnswer && <XCircle className="w-5 h-5 shrink-0" />}
            </button>
          ))
        )}
      </div>

      {/* Feedback Panel (Fixed Bottom) */}
      {hasAnswered && (
        <div className="fixed bottom-[72px] left-0 right-0 p-4 max-w-md mx-auto z-30 animate-pop">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4">
               {/* Feedback Header */}
               <div className="flex items-center justify-between mb-3">
                   <div className={`flex items-center gap-2 font-black text-lg ${selectedOption === question.correctAnswer ? 'text-green-500' : 'text-slate-500'}`}>
                        {selectedOption === question.correctAnswer ? (
                            <>
                                <CheckCircle2 className="w-6 h-6" />
                                <span>回答正确!</span>
                            </>
                        ) : (
                            <>
                                <AlertOctagon className="w-6 h-6 text-slate-500" />
                                <span>回答错误</span>
                            </>
                        )}
                   </div>
                   
                   {!isMistakeMode && !question.mnemonic && selectedOption !== question.correctAnswer && (
                       <div className="text-xs font-bold text-slate-400">已自动加入错题本</div>
                   )}
                   {isMistakeMode && selectedOption === question.correctAnswer && (
                       <div className="text-xs font-bold text-green-500 flex items-center gap-1">
                           <CheckCircle2 className="w-3 h-3" />
                           已移出错题本
                       </div>
                   )}
               </div>

               {/* Mnemonic Area */}
               {showMnemonic && question.mnemonic && (
                   <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-4 flex gap-3 border border-amber-100 dark:border-amber-800/30">
                       <BrainCircuit className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                       <div>
                           <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-0.5">巧记 Mnemonic</div>
                           <div className="text-sm font-bold text-amber-900 dark:text-amber-100">{question.mnemonic}</div>
                       </div>
                   </div>
               )}

               {/* Action Buttons */}
               <div className="flex gap-3">
                    {!showMnemonic && question.mnemonic && (
                        <button 
                            onClick={() => setShowMnemonic(true)}
                            className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Lightbulb className="w-4 h-4" />
                            看巧记
                        </button>
                    )}
                    <button 
                        onClick={onNext}
                        className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span>下一题</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};