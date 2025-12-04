
import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, Flame, AlertOctagon, RotateCcw, BookOpen, AlertTriangle, Pin, PinOff, CheckSquare, Search, ChevronUp, ChevronDown, Minimize2, Maximize2 } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  streak: number;
  masteryPercentage: number;
  answeredCount: number;
  totalCount: number;
  mistakeCount: number;
  isPinned: boolean;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  onRetry: () => void;
  onTogglePin: () => void;
  isMistakeMode?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ 
    question, 
    streak, 
    masteryPercentage, 
    answeredCount, 
    totalCount, 
    mistakeCount, 
    isPinned,
    onAnswer, 
    onNext, 
    onRetry,
    onTogglePin,
    isMistakeMode 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<any[] | boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flashType, setFlashType] = useState<'none' | 'green' | 'red'>('none');
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  
  // Explicit Minimize State (No Drag)
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Reset state for new question
    setSelectedOptions(question.type === QuestionType.CHOICE ? [] : null);
    setHasAnswered(false);
    setShowMnemonic(false);
    setIsShaking(false);
    setShowConfetti(false);
    setFlashType('none');
    setIsCorrectAnswer(false);
    setIsMinimized(false);
  }, [question]);

  const setsAreEqual = (a: any[], b: any[]) => {
      if (!a || !b) return false;
      if (a.length !== b.length) return false;
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((val, index) => val === sortedB[index]);
  };

  const handleToggleOption = (letterIndex: number) => {
      if (hasAnswered) return;
      const letter = String.fromCharCode(65 + letterIndex);
      const current = (selectedOptions as string[]) || [];
      if (current.includes(letter)) {
          setSelectedOptions(current.filter(o => o !== letter));
      } else {
          setSelectedOptions([...current, letter]);
      }
  };

  const submitChoiceAnswer = () => {
      const correct = question.correctAnswer as string[];
      const selected = (selectedOptions as string[]) || [];
      const isCorrect = setsAreEqual(selected, correct);
      processSubmission(isCorrect);
  };

  const handleJudgeSelect = (val: boolean) => {
      if (hasAnswered) return;
      setSelectedOptions(val);
      const isCorrect = val === question.correctAnswer;
      processSubmission(isCorrect);
  };

  const processSubmission = (isCorrect: boolean) => {
      setHasAnswered(true);
      setIsCorrectAnswer(isCorrect);
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

  const getOptionStyle = (option: string | boolean, index?: number) => {
    const base = "transition-all duration-300 border-2 font-medium relative overflow-hidden";
    
    if (question.type === QuestionType.CHOICE && typeof index === 'number') {
        const letter = String.fromCharCode(65 + index);
        const currentSelected = (selectedOptions as string[]) || [];
        const selected = currentSelected.includes(letter);
        const correctAnswers = (question.correctAnswer as string[]) || [];
        const isCorrectOption = correctAnswers.includes(letter);

        if (!hasAnswered) {
            if (selected) return `${base} bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-400 dark:text-blue-300`;
            return `${base} bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300`;
        }
        
        // Post-answer logic
        if (isCorrectOption) {
            // Correct option gets prominent green style
            return `${base} bg-white dark:bg-slate-900 border-green-500 text-green-600 dark:text-green-400 border-2 shadow-lg scale-[1.02] z-10`;
        } else {
            if (selected) {
                // Wrong selection gets grayed out strikethrough
                return `${base} bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 line-through opacity-80`;
            }
            // Unselected irrelevant options
            return `${base} bg-slate-50 dark:bg-slate-950 border-transparent text-slate-300 dark:text-slate-800 opacity-40 grayscale`;
        }
    }
    
    // Judgment logic
    const selectedJudge = selectedOptions === option;
    if (!hasAnswered) return `${base} bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400`;
    
    if (option === question.correctAnswer) return `${base} bg-white dark:bg-slate-900 border-green-500 text-green-600 dark:text-green-400 border-2 shadow-lg scale-[1.02] z-10`;
    
    if (selectedJudge && option !== question.correctAnswer) {
        return `${base} bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 line-through opacity-80`;
    }
    return `${base} bg-slate-50 dark:bg-slate-950 border-transparent text-slate-300 dark:text-slate-800 opacity-40 grayscale`;
  };

  const getCorrectAnswerText = () => {
      if (question.type === QuestionType.JUDGE) {
          return question.correctAnswer ? '正确 (√)' : '错误 (×)';
      }
      
      const correctLetters = question.correctAnswer as string[];
      // If we have options, verify we can map them
      if (question.options) {
          return correctLetters.map(letter => {
              const idx = letter.charCodeAt(0) - 65;
              const text = question.options![idx];
              return `${letter}. ${text}`;
          });
      }
      return [correctLetters.join('、')];
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

  const showRetry = isMistakeMode && mistakeCount <= 1 && !isCorrectAnswer && hasAnswered;

  return (
    <div className="flex flex-col h-full relative z-0">
      {flashType === 'green' && <div className="absolute inset-0 z-10 animate-flash-green pointer-events-none rounded-3xl" />}
      {flashType === 'red' && <div className="absolute inset-0 z-10 animate-flash-red pointer-events-none rounded-3xl" />}
      {showConfetti && <Confetti />}

      {/* Top Info */}
      <div className="flex items-center justify-between gap-4 mb-4 px-1">
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
          <div className={`flex items-center gap-1.5 font-bold transition-transform duration-300 ${streak > 0 ? 'scale-110' : ''}`}>
             <div className={`p-1 rounded-full ${streak > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
                 <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'animate-pulse' : ''}`} fill={streak > 0 ? "currentColor" : "none"} />
             </div>
             <span className={`text-sm ${streak > 0 ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`}>{streak}</span>
          </div>
      </div>

      <div className="mb-6 px-1">
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${masteryPercentage}%` }} />
            </div>
      </div>

      <div className={`flex-shrink-0 mb-6 transition-all duration-300 ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${question.type === QuestionType.JUDGE ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                    {question.type === QuestionType.JUDGE ? '判断题' : '不定项选择'}
                </span>
             </div>
        </div>
        <h2 className="text-xl font-bold leading-relaxed text-slate-800 dark:text-slate-100">
          {question.content}
        </h2>
      </div>

      {/* Options Area */}
      <div className="flex-1 overflow-y-auto pb-48 space-y-3 px-1 scroll-smooth">
        {question.type === QuestionType.JUDGE ? (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[true, false].map((opt, idx) => (
              <button key={idx} onClick={() => handleJudgeSelect(opt)} disabled={hasAnswered} className={`p-6 rounded-xl flex flex-col items-center justify-center gap-2 ${getOptionStyle(opt)}`}>
                {hasAnswered && opt === question.correctAnswer ? <CheckCircle2 className="w-8 h-8 mb-1" /> : hasAnswered && (selectedOptions === opt) ? <XCircle className="w-8 h-8 mb-1" /> : null}
                <span className="text-lg font-bold">{opt ? '正确' : '错误'}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {question.options?.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = ((selectedOptions as string[]) || []).includes(letter);
                const correctAnswers = (question.correctAnswer as string[]) || [];
                const isCorrectOption = correctAnswers.includes(letter);
                
                return (
                <button key={idx} onClick={() => handleToggleOption(idx)} disabled={hasAnswered} className={`w-full p-4 rounded-xl text-left flex items-start gap-3 group ${getOptionStyle(opt, idx)}`}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 border transition-colors ${hasAnswered ? (isCorrectOption ? 'border-green-500 text-green-600' : 'border-slate-300 text-slate-300') : (isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400 group-hover:border-blue-400')}`}>
                    {hasAnswered && isCorrectOption ? <CheckCircle2 className="w-6 h-6" /> : (isSelected && !hasAnswered ? <CheckSquare className="w-4 h-4"/> : letter)}
                </div>
                <span className="flex-1 leading-relaxed">{opt}</span>
                </button>
            )})}
            {!hasAnswered && (
                <button onClick={submitChoiceAnswer} disabled={!selectedOptions || (selectedOptions as string[]).length === 0} className="w-full mt-6 bg-slate-800 dark:bg-blue-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                    确认提交 <ArrowRight className="w-4 h-4" />
                </button>
            )}
          </>
        )}
      </div>

      {/* Minimized Bar */}
      {hasAnswered && isMinimized && (
          <div 
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto px-4 z-30 animate-in slide-in-from-bottom-10"
          >
              <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                      <ChevronUp className="w-5 h-5 animate-bounce" />
                      <span className="font-bold text-sm">展开解析 & 答案</span>
                  </div>
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-md ${isCorrectAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {isCorrectAnswer ? '回答正确' : '回答错误'}
                  </div>
              </div>
          </div>
      )}

      {/* Full Feedback Panel */}
      {hasAnswered && !isMinimized && (
        <div className="fixed bottom-[72px] left-0 right-0 p-4 max-w-md mx-auto z-30 animate-in slide-in-from-bottom-20 duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 max-h-[70vh] overflow-y-auto relative">
               
               <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                   <div className={`flex items-center gap-2 font-black text-xl ${isCorrectAnswer ? 'text-green-500' : 'text-slate-500'}`}>
                        {isCorrectAnswer ? <><CheckCircle2 className="w-7 h-7" /><span>回答正确!</span></> : <><AlertOctagon className="w-7 h-7 text-slate-500" /><span>回答错误</span></>}
                   </div>
                   <div className="flex gap-2">
                        {isMistakeMode && (
                                <button onClick={onTogglePin} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${isPinned ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
                                    {isPinned ? '已保留' : '不保留'}
                                </button>
                        )}
                        <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors">
                            <ChevronDown className="w-5 h-5" />
                        </button>
                   </div>
               </div>

               <div className="mb-5 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
                   <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">正确答案</span>
                   </div>
                   <div className="space-y-1">
                        {question.type === QuestionType.JUDGE ? (
                            <div className="text-xl font-black text-green-700 dark:text-green-300">
                                {question.correctAnswer ? '正确 (√)' : '错误 (×)'}
                            </div>
                        ) : (
                            (getCorrectAnswerText() as string[]).map((ans, i) => (
                                <div key={i} className="text-sm font-bold text-green-700 dark:text-green-300 leading-snug">
                                    {ans}
                                </div>
                            ))
                        )}
                   </div>
               </div>

               {question.analysis && (
                   <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-3 flex gap-3 border border-blue-100 dark:border-blue-800/30">
                       <Search className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                       <div>
                           <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">深度辨析 Analysis</div>
                           <div className="text-sm font-medium text-blue-900 dark:text-blue-100 leading-relaxed">{question.analysis}</div>
                       </div>
                   </div>
               )}

               {question.mnemonic && (
                   <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-5 flex gap-3 border border-amber-100 dark:border-amber-800/30">
                       <BrainCircuit className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                       <div>
                           <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">巧记 Mnemonic</div>
                           <div className="text-sm font-bold text-amber-900 dark:text-amber-100">{question.mnemonic}</div>
                       </div>
                   </div>
               )}

               <div className="flex gap-3">
                    {showRetry ? (
                        <button onClick={onRetry} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2">
                            <RotateCcw className="w-5 h-5" /> <span>重试 (最后一道)</span>
                        </button>
                    ) : (
                        <button onClick={onNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2">
                            <span>下一题</span> <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
