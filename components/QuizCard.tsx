
import React, { useState, useEffect, useMemo } from 'react';
import { Question, QuestionType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, BookOpen, AlertTriangle, Pin, PinOff, Zap, ChevronDown, ChevronUp, AlertOctagon, Eye, EyeOff, Gamepad2, ThumbsUp, XOctagon, RotateCcw, List, Search, ArrowLeft, Network } from 'lucide-react';
import { VisualMnemonic } from './VisualMnemonic';
import { MindMap } from './MindMap';
import { playCorrect, playWrong } from '../utils/sound';

interface QuizCardProps {
  question: Question;
  streak: number;
  masteryPercentage: number;
  answeredCount: number;
  totalCount: number;
  mistakeCount: number;
  isPinned: boolean;
  roundNumber: number;
  accuracy: number;
  soundEnabled: boolean;
  effectsEnabled: boolean;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  onPrevious?: () => void;
  onRetry: () => void;
  onTogglePin: () => void;
  onShowList?: () => void;
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
    roundNumber,
    accuracy,
    soundEnabled,
    effectsEnabled,
    onAnswer, 
    onNext, 
    onPrevious,
    onRetry, 
    onTogglePin, 
    onShowList, 
    isMistakeMode 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<any[] | boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flashType, setFlashType] = useState<'none' | 'green' | 'red'>('none');
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [essayRevealed, setEssayRevealed] = useState(false);
  const [essayKeywords, setEssayKeywords] = useState<{text: string, hidden: boolean}[]>([]);
  const [mnemonicMode, setMnemonicMode] = useState<'text' | 'visual' | 'mindmap'>('text');
  const [isMindMapFullscreen, setIsMindMapFullscreen] = useState(false);
  
  // New State for result card collapse
  const [isResultExpanded, setIsResultExpanded] = useState(true); 
  const [showFlashCard, setShowFlashCard] = useState(false);

  // Transition State for Fly In / Fly Out
  const [transitionState, setTransitionState] = useState<'enter' | 'idle' | 'exit'>('enter');

  useEffect(() => {
    // Reset state for new question
    setSelectedOptions(question.type === QuestionType.CHOICE ? [] : null);
    setHasAnswered(false);
    setShowMnemonic(false);
    setIsShaking(false);
    setShowConfetti(false);
    setFlashType('none');
    setIsCorrectAnswer(false);
    setEssayRevealed(false);
    setMnemonicMode('text');
    setIsResultExpanded(true); // Always expand result panel by default
    setShowFlashCard(false);
    setTransitionState('enter');
    setIsMindMapFullscreen(false);

    // After animation delay, set to idle
    const timer = setTimeout(() => setTransitionState('idle'), 300);

    if (question.type === QuestionType.ESSAY) {
        const answer = String(question.correctAnswer);
        const chunks = answer.split(/([，。；：\n]+)/).map(chunk => ({
            text: chunk,
            hidden: chunk.length > 2 && Math.random() > 0.3 && !/^[，。；：\n]+$/.test(chunk)
        }));
        setEssayKeywords(chunks);
    }
    return () => clearTimeout(timer);
  }, [question]);

  // Handle Question Transitions
  const handleNextWithAnim = () => {
    if (effectsEnabled) {
      setTransitionState('exit');
      setTimeout(() => {
          onNext();
      }, 300); // Match animation duration
    } else {
      onNext();
    }
  };

  const handleRetryWithAnim = () => {
    if (effectsEnabled) {
      setTransitionState('exit');
      setTimeout(() => {
          onRetry();
      }, 300);
    } else {
      onRetry();
    }
  };

  const isSingleChoice = useMemo(() => {
      if (question.type !== QuestionType.CHOICE) return false;
      return Array.isArray(question.correctAnswer) && question.correctAnswer.length === 1;
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
      
      if (isSingleChoice) {
          setSelectedOptions([letter]);
      } else {
          if (current.includes(letter)) {
              setSelectedOptions(current.filter(o => o !== letter));
          } else {
              setSelectedOptions([...current, letter]);
          }
      }
  };

  const handleDoubleClickOption = (letterIndex: number) => {
      if (hasAnswered) return;
      const letter = String.fromCharCode(65 + letterIndex);
      
      let newSelection: string[] = [];
      if (isSingleChoice) {
          newSelection = [letter];
      } else {
          const current = (selectedOptions as string[]) || [];
          if (!current.includes(letter)) {
              newSelection = [...current, letter];
          } else {
              newSelection = current;
          }
      }
      setSelectedOptions(newSelection);
      const correct = question.correctAnswer as string[];
      const isCorrect = setsAreEqual(newSelection, correct);
      processSubmission(isCorrect);
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

  const handleEssayGrade = (passed: boolean) => {
      setHasAnswered(true);
      setIsCorrectAnswer(passed);
      onAnswer(passed);
      
      if (passed) {
          if (soundEnabled) playCorrect();
          if (effectsEnabled) {
            setShowConfetti(true);
            setFlashType('green');
          }
      } else {
          if (soundEnabled) playWrong();
          if (effectsEnabled) {
            setShowFlashCard(true); // Wrong essay shows card
            setTimeout(() => setShowFlashCard(false), 4000);
          }
      }
  };

  const processSubmission = (isCorrect: boolean) => {
      if(hasAnswered) return;

      setHasAnswered(true);
      setIsCorrectAnswer(isCorrect);
      onAnswer(isCorrect);

      if (isCorrect) {
        if (soundEnabled) playCorrect();
        if (effectsEnabled) {
            setShowConfetti(true);
            setFlashType('green');
        }
      } else {
        if (soundEnabled) playWrong();
        if (effectsEnabled) {
            setShowFlashCard(true);
            setIsShaking(true);
            setFlashType('red');
            setTimeout(() => setIsShaking(false), 400); 
            setTimeout(() => setShowFlashCard(false), 4000);
        }
        setShowMnemonic(true); // Always show mnemonic on wrong
      }
  };

  const getOptionStyle = (option: string | boolean, index?: number) => {
    const base = "transition-all duration-300 border-2 font-medium relative overflow-hidden select-none active:scale-[0.98]";
    
    if (question.type === QuestionType.CHOICE && typeof index === 'number') {
        const letter = String.fromCharCode(65 + index);
        const currentSelected = (selectedOptions as string[]) || [];
        const selected = currentSelected.includes(letter);
        const correctAnswers = (question.correctAnswer as string[]) || [];
        const isCorrectOption = correctAnswers.includes(letter);

        if (!hasAnswered) {
            if (selected) return `${base} bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-400 dark:text-blue-300 shadow-md`;
            return `${base} bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300`;
        }
        
        if (isCorrectOption) {
            return `${base} bg-white dark:bg-slate-900 border-green-500 text-green-600 dark:text-green-400 border-2 shadow-lg scale-[1.02] z-10`;
        } else {
            if (selected) {
                return `${base} bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 line-through opacity-80`;
            }
            return `${base} bg-slate-50 dark:bg-slate-950 border-transparent text-slate-300 dark:text-slate-800 opacity-40 grayscale`;
        }
    }
    
    const selectedJudge = selectedOptions === option;
    if (!hasAnswered) return `${base} bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400`;
    
    if (option === question.correctAnswer) return `${base} bg-white dark:bg-slate-900 border-green-500 text-green-600 dark:text-green-400 border-2 shadow-lg scale-[1.02] z-10`;
    
    if (selectedJudge && option !== question.correctAnswer) {
        return `${base} bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 line-through opacity-80`;
    }
    return `${base} bg-slate-50 dark:bg-slate-950 border-transparent text-slate-300 dark:text-slate-800 opacity-40 grayscale`;
  };

  const getCorrectAnswerContent = () => {
    if (question.type === QuestionType.JUDGE) {
        return question.correctAnswer ? '正确' : '错误';
    }
    if (question.type === QuestionType.ESSAY) {
        return String(question.correctAnswer);
    }
    
    // Choice: Ensure we work with string[]
    const val = question.correctAnswer;
    const correctKeys: string[] = Array.isArray(val) ? val : (typeof val === 'string' ? [val] : []);
    
    if (correctKeys.length === 0) return '';
    
    if (!question.options) return correctKeys.join('');

    // Map keys (A, B) to text
    return correctKeys.map(key => {
        const idx = key.charCodeAt(0) - 65;
        // Include letter in the flash card as well for better context
        return question.options && question.options[idx] ? `${key}. ${question.options[idx]}` : key;
    }).join('；'); // Separator
  };

  const getCorrectAnswerText = () => {
      if (question.type === QuestionType.JUDGE) {
          return question.correctAnswer ? '正确 (√)' : '错误 (×)';
      }
      const answer = question.correctAnswer;
      if (typeof answer === 'string') return [answer];
      if (!Array.isArray(answer)) return [];
      
      const correctLetters = answer as string[];
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
      {[...Array(25)].map((_, i) => (
        <div key={i} className="confetti" style={{ 
          left: `${Math.random() * 100}%`, 
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)],
          animationDelay: `${Math.random() * 0.2}s`
        }} />
      ))}
    </div>
  );

  // New Full Screen Feedback Component (ResultFlashCard)
  const ResultFlashCard = () => {
      const content = getCorrectAnswerContent();
      const isLongText = content.length > 20;

      return (
        <div 
            className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 backdrop-blur-xl transition-all duration-500 animate-in fade-in zoom-in-95 bg-red-500/10"
            onClick={() => setShowFlashCard(false)}
        >
            <div className="w-full max-w-sm bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 border-2 flex flex-col items-center text-center gap-4 relative overflow-hidden border-red-400/50 shadow-red-500/20">
                
                {/* Icon */}
                <div className="p-4 rounded-full shadow-lg bg-red-100 text-red-600 shrink-0">
                    <AlertOctagon className="w-10 h-10" />
                </div>

                {/* Answer Box */}
                <div className="w-full bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-800/50">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-red-500">
                        正确答案是
                    </h3>
                    <div className={`font-black text-slate-900 dark:text-white leading-tight break-words
                        ${isLongText ? 'text-lg text-left' : 'text-3xl'}`}>
                        {content}
                    </div>
                </div>

                {/* Mnemonic Prominent Position */}
                {question.mnemonic && (
                     <div className="w-full animate-in slide-in-from-bottom-2 duration-500 delay-100">
                         <div className="flex items-center gap-2 mb-2 justify-center">
                            <BrainCircuit className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">巧记速记</span>
                         </div>
                         <div className="text-lg font-bold text-amber-800 dark:text-amber-100 leading-relaxed bg-amber-100 dark:bg-amber-900/40 p-4 rounded-xl shadow-sm border border-amber-200 dark:border-amber-700/30">
                            {question.mnemonic}
                         </div>
                     </div>
                )}

                {/* Question Context (Moved to bottom as requested/inferred) */}
                <div className="mt-2 text-sm leading-snug text-slate-500 dark:text-slate-400 px-2 font-medium border-t border-slate-200 dark:border-slate-800 pt-3 w-full">
                    <span className="text-xs font-bold opacity-70 block mb-1">题目：</span>
                    {question.content}
                </div>
            </div>
        </div>
      );
  };

  const showRetry = isMistakeMode && mistakeCount <= 1 && !isCorrectAnswer && hasAnswered;

  // Animation Classes
  const containerClass = `flex flex-col h-full relative z-0 overflow-hidden bg-slate-50 dark:bg-slate-950 
    ${effectsEnabled && transitionState === 'enter' ? 'animate-slide-in-right opacity-100' : ''}
    ${effectsEnabled && transitionState === 'exit' ? 'animate-slide-out-left opacity-0' : ''}`;

  return (
    <div className={containerClass}>
      {/* Background Ambience if Effects Enabled */}
      {effectsEnabled && (
         <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 overflow-hidden">
             <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/10 blur-3xl animate-pulse" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-400/10 blur-3xl animate-pulse delay-700" />
         </div>
      )}

      {flashType === 'green' && effectsEnabled && <div className="absolute inset-0 z-10 animate-flash-green pointer-events-none" />}
      {flashType === 'red' && effectsEnabled && <div className="absolute inset-0 z-10 animate-flash-red pointer-events-none" />}
      {showConfetti && effectsEnabled && <Confetti />}
      
      {/* Full Screen Flash Card - ONLY for wrong answers */}
      {showFlashCard && hasAnswered && !isCorrectAnswer && effectsEnabled && <ResultFlashCard />}

      {/* Top Stats Bar */}
      <div className="flex-none pt-2 pb-2 px-1 relative z-10">
          <div className="flex items-center justify-between gap-3 mb-3 px-1">
            <div className="flex gap-2">
                {onPrevious && (
                    <button 
                        onClick={onPrevious}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-500 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                        title="上一题"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                )}
                
                <div className="flex flex-col">
                     <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">第 {roundNumber} 轮</span>
                        <div className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
                        <span className={`text-xs font-bold ${accuracy >= 80 ? 'text-green-600' : accuracy >= 60 ? 'text-blue-600' : 'text-orange-600'}`}>
                            正确率 {accuracy}%
                        </span>
                     </div>
                     <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${masteryPercentage}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{answeredCount}/{totalCount}</span>
                     </div>
                </div>
            </div>

            <div className="flex gap-2">
                 {onShowList && (
                    <button 
                        onClick={onShowList}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title="展开全部题目"
                    >
                        <List className="w-4 h-4" />
                    </button>
                 )}
                 <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border border-transparent ${streak > 0 ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-100 text-slate-400'}`}>
                    <span className="text-xs font-bold">🔥 {streak}</span>
                 </div>
            </div>
          </div>
      </div>

      {/* MAIN SPLIT VIEW: Question (Top) vs Options (Bottom) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
          
          {/* Top: Question */}
          <div className="flex-[0_0_auto] max-h-[40%] min-h-[120px] overflow-y-auto px-2 pb-4 pt-2 border-b border-slate-100 dark:border-slate-800/50 shadow-sm z-10 bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                        question.type === QuestionType.JUDGE ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 
                        question.type === QuestionType.ESSAY ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' :
                        'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                        {question.type === QuestionType.JUDGE ? '判断题' : question.type === QuestionType.ESSAY ? '简答题' : isSingleChoice ? '单选题' : '多选题'}
                    </span>
                    {question.type === QuestionType.CHOICE && (
                        <span className="text-[10px] text-slate-400 animate-pulse">
                            双击选项可直接提交
                        </span>
                    )}
                </div>
                <h2 className={`text-lg font-bold leading-relaxed text-slate-800 dark:text-slate-100 ${isShaking && effectsEnabled ? 'animate-shake text-red-600 dark:text-red-400' : ''}`}>
                    {question.content}
                </h2>
          </div>

          {/* Bottom: Options / Essay Game */}
          <div className="flex-1 overflow-y-auto px-2 pt-4 pb-32 bg-white dark:bg-slate-900/50">
                {question.type === QuestionType.ESSAY ? (
                    <div className="space-y-6">
                        {/* Mnemonic Toggle and Display */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 overflow-hidden">
                            <div className="flex items-center justify-between p-4 pb-2">
                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <BrainCircuit className="w-4 h-4" /> 关键词速记
                                </span>
                                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-indigo-100 dark:border-slate-700">
                                    <button 
                                        onClick={() => setMnemonicMode('text')}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-all ${mnemonicMode === 'text' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                                    >
                                        文本
                                    </button>
                                    <button 
                                        onClick={() => setMnemonicMode('visual')}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${mnemonicMode === 'visual' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                                    >
                                        <Gamepad2 className="w-3 h-3" /> 星图
                                    </button>
                                    <button 
                                        onClick={() => setMnemonicMode('mindmap')}
                                        className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${mnemonicMode === 'mindmap' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                                    >
                                        <Network className="w-3 h-3" /> 导图
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-4 pt-2">
                                {mnemonicMode === 'text' ? (
                                    <>
                                        <div className="flex justify-end mb-2">
                                             <button onClick={() => setEssayRevealed(!essayRevealed)} className="text-xs font-bold text-indigo-400 hover:text-indigo-600 flex items-center gap-1">
                                                {essayRevealed ? <><EyeOff className="w-3 h-3" /> 隐藏全部</> : <><Eye className="w-3 h-3" /> 显示全部</>}
                                            </button>
                                        </div>
                                        <div className="text-base leading-loose text-slate-800 dark:text-slate-200 font-medium">
                                            {essayKeywords.map((chunk, idx) => (
                                                <span 
                                                    key={idx}
                                                    onClick={() => {
                                                        const newK = [...essayKeywords];
                                                        newK[idx].hidden = !newK[idx].hidden;
                                                        setEssayKeywords(newK);
                                                    }}
                                                    className={`transition-all duration-300 cursor-pointer px-1 rounded mx-0.5 ${
                                                        chunk.hidden && !essayRevealed 
                                                        ? 'bg-indigo-200 dark:bg-indigo-700 text-transparent hover:bg-indigo-300 select-none border-b-2 border-indigo-300 dark:border-indigo-500' 
                                                        : 'bg-transparent'
                                                    }`}
                                                >
                                                    {chunk.text}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                ) : mnemonicMode === 'mindmap' ? (
                                    <MindMap 
                                        content={String(question.correctAnswer)} 
                                        isFullscreen={isMindMapFullscreen}
                                        toggleFullscreen={() => setIsMindMapFullscreen(!isMindMapFullscreen)}
                                    />
                                ) : (
                                    <VisualMnemonic content={String(question.correctAnswer)} />
                                )}
                            </div>
                        </div>

                        {!hasAnswered && (
                            <div className="flex gap-3">
                                <button onClick={() => handleEssayGrade(false)} className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold rounded-xl active:scale-95 transition-all">需复习</button>
                                <button onClick={() => handleEssayGrade(true)} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-200 dark:shadow-none">已掌握</button>
                            </div>
                        )}
                    </div>
                ) : question.type === QuestionType.JUDGE ? (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        {[true, false].map((opt, idx) => (
                        <button key={idx} onClick={() => handleJudgeSelect(opt)} disabled={hasAnswered} className={`p-8 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-sm ${getOptionStyle(opt)}`}>
                            {hasAnswered && opt === question.correctAnswer ? <CheckCircle2 className="w-8 h-8" /> : hasAnswered && (selectedOptions === opt) ? <XCircle className="w-8 h-8" /> : <div className="w-8 h-8"/>}
                            <span className="text-xl font-bold">{opt ? '正确' : '错误'}</span>
                        </button>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {question.options?.map((opt, idx) => {
                            const letter = String.fromCharCode(65 + idx);
                            const isSelected = ((selectedOptions as string[]) || []).includes(letter);
                            const correctAnswers = (question.correctAnswer as string[]) || [];
                            const isCorrectOption = correctAnswers.includes(letter);
                            
                            return (
                            <button 
                                key={idx} 
                                onClick={() => handleToggleOption(idx)}
                                onDoubleClick={() => handleDoubleClickOption(idx)}
                                disabled={hasAnswered} 
                                className={`w-full p-4 rounded-xl text-left flex items-start gap-3 group shadow-sm active:scale-[0.98] transition-all ${getOptionStyle(opt, idx)}`}
                            >
                                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold shrink-0 mt-0.5 border transition-colors ${hasAnswered ? (isCorrectOption ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 text-slate-300') : (isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400 group-hover:border-blue-400')}`}>
                                    {hasAnswered && isCorrectOption ? <CheckCircle2 className="w-5 h-5" /> : letter}
                                </div>
                                <span className="flex-1 leading-relaxed text-sm font-medium">{opt}</span>
                            </button>
                        )})}
                        {!hasAnswered && (
                            <button onClick={submitChoiceAnswer} disabled={!selectedOptions || (selectedOptions as string[]).length === 0} className="w-full mt-6 bg-slate-800 dark:bg-blue-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 mb-8">
                                确认提交 <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
          </div>
      </div>

      {/* Result Panel (Bottom Sheet) - Always available for correct answers */}
      {hasAnswered && (
        <div className={`absolute bottom-0 left-0 right-0 z-30 pointer-events-none ${effectsEnabled ? 'animate-spring-up' : ''}`}>
           <div className={`bg-white dark:bg-slate-900 rounded-t-2xl shadow-[0_10px_60px_-15px_rgba(0,0,0,0.3)] border-x-2 border-t-2 ${isCorrectAnswer ? 'border-green-400 dark:border-green-900' : 'border-red-400 dark:border-red-900'} p-5 flex flex-col transition-all duration-300 pointer-events-auto`} 
                style={{ 
                    maxHeight: isResultExpanded ? '60vh' : 'auto',
                    transform: isResultExpanded ? 'translateY(0)' : 'translateY(calc(100% - 70px))' // Collapses down to 70px
                }}>
               
               {/* Drag Handle - Click to Toggle */}
               <div 
                 className="w-full flex justify-center pb-4 -mt-2 cursor-pointer touch-manipulation group"
                 onClick={() => setIsResultExpanded(!isResultExpanded)}
               >
                 <div className={`w-12 h-1.5 rounded-full transition-colors ${isResultExpanded ? 'bg-slate-200 dark:bg-slate-700' : 'bg-blue-400 dark:bg-blue-600'}`} />
               </div>

               {/* Header Section */}
               <div className="flex items-center justify-between mb-2 shrink-0">
                   <div className={`flex items-center gap-2 font-black text-xl ${isCorrectAnswer ? 'text-green-500' : 'text-red-500'}`}>
                        {isCorrectAnswer ? <><CheckCircle2 className="w-6 h-6" /><span>回答正确!</span></> : <><AlertOctagon className="w-6 h-6" /><span>回答错误</span></>}
                   </div>
                   
                   <div className="flex items-center gap-3">
                        {isMistakeMode && (
                            <button onClick={onTogglePin} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${isPinned ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
                                {isPinned ? '已保留' : '不保留'}
                            </button>
                        )}
                        <button 
                            onClick={() => setIsResultExpanded(!isResultExpanded)}
                            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {isResultExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                        </button>
                   </div>
               </div>
               
               {/* Always visible action buttons when collapsed, or bottom when expanded */}
               {!isResultExpanded && (
                   <div className="flex gap-3 mt-2 shrink-0 animate-in fade-in relative -top-1">
                        {showRetry ? (
                            <button onClick={handleRetryWithAnim} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">
                                <ArrowRight className="w-4 h-4 rotate-180" /> <span>重试</span>
                            </button>
                        ) : (
                            <button onClick={handleNextWithAnim} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 text-sm">
                                <span>下一题</span> <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                   </div>
               )}

               {/* Collapsible Content Section */}
               <div className={`overflow-y-auto transition-all duration-300 space-y-4 ${isResultExpanded ? 'opacity-100 flex-1 mt-2' : 'h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                        <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">正确答案</div>
                        <div className="text-lg font-black text-green-700 dark:text-green-300 whitespace-pre-wrap">
                                {question.type === QuestionType.JUDGE 
                                    ? (question.correctAnswer ? '正确 (√)' : '错误 (×)') 
                                    : question.type === QuestionType.ESSAY 
                                        ? String(question.correctAnswer)
                                        : (getCorrectAnswerText() as string[]).join(' ')}
                        </div>
                    </div>

                    {question.mnemonic && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex gap-3 border border-amber-100 dark:border-amber-800/30 shadow-sm">
                            <BrainCircuit className="w-6 h-6 text-amber-500 mt-1 shrink-0" />
                            <div className="flex-1">
                                <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">巧记 Mnemonic</div>
                                {/* Increased font size for better visibility */}
                                <div className="text-lg font-bold text-amber-900 dark:text-amber-100 leading-snug">{question.mnemonic}</div>
                            </div>
                        </div>
                    )}

                    {question.analysis && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 flex gap-3 border border-blue-100 dark:border-blue-800/30">
                            <BookOpen className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                            <div>
                                <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">解析 Analysis</div>
                                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 leading-relaxed">{question.analysis}</div>
                            </div>
                        </div>
                    )}

                    {/* Buttons inside expanded view */}
                    <div className="flex gap-3 mt-4 shrink-0 pb-2">
                        {showRetry ? (
                            <button onClick={handleRetryWithAnim} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                                <ArrowRight className="w-5 h-5 rotate-180" /> <span>重试</span>
                            </button>
                        ) : (
                            <button onClick={handleNextWithAnim} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                                <span>下一题</span> <ArrowRight className="w-5 h-5" />
                            </button>
                        )}
                   </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};
