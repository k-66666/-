
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question, QuestionType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, BookOpen, AlertTriangle, Pin, PinOff, CheckSquare, Zap, ChevronDown, Trophy, Skull, ShieldCheck, Search, RotateCcw, AlertOctagon, Scan, Eye, EyeOff, Gamepad2 } from 'lucide-react';
import { VisualMnemonic } from './VisualMnemonic';

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
  const [essayRevealed, setEssayRevealed] = useState(false);
  const [essayKeywords, setEssayKeywords] = useState<{text: string, hidden: boolean}[]>([]);
  const [mnemonicMode, setMnemonicMode] = useState<'text' | 'visual'>('text');

  useEffect(() => {
    setSelectedOptions(question.type === QuestionType.CHOICE ? [] : null);
    setHasAnswered(false);
    setShowMnemonic(false);
    setIsShaking(false);
    setShowConfetti(false);
    setFlashType('none');
    setIsCorrectAnswer(false);
    setEssayRevealed(false);
    setMnemonicMode('text'); // Reset to text mode for new questions

    if (question.type === QuestionType.ESSAY) {
        const answer = String(question.correctAnswer);
        const chunks = answer.split(/([，。；：\n]+)/).map(chunk => ({
            text: chunk,
            hidden: chunk.length > 2 && Math.random() > 0.3 && !/^[，。；：\n]+$/.test(chunk)
        }));
        setEssayKeywords(chunks);
    }
  }, [question]);

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
          setShowConfetti(true);
          setFlashType('green');
      }
  };

  const processSubmission = (isCorrect: boolean) => {
      if(hasAnswered) return;

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
    <div className="flex flex-col h-full relative z-0 overflow-hidden">
      {flashType === 'green' && <div className="absolute inset-0 z-10 animate-flash-green pointer-events-none rounded-3xl" />}
      {flashType === 'red' && <div className="absolute inset-0 z-10 animate-flash-red pointer-events-none rounded-3xl" />}
      {showConfetti && <Confetti />}

      {/* Top Stats Bar */}
      <div className="flex-none pt-1 pb-2 px-1">
          <div className="flex items-center justify-between gap-4 mb-3">
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
                <span className={`text-sm ${streak > 0 ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`}>🔥 {streak}</span>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${masteryPercentage}%` }} />
          </div>
      </div>

      {/* MAIN SPLIT VIEW: Question (Top) vs Options (Bottom) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          
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
                <h2 className={`text-lg font-bold leading-relaxed text-slate-800 dark:text-slate-100 ${isShaking ? 'animate-shake text-red-600 dark:text-red-400' : ''}`}>
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
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${mnemonicMode === 'text' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                                    >
                                        文本
                                    </button>
                                    <button 
                                        onClick={() => setMnemonicMode('visual')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${mnemonicMode === 'visual' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-500 hover:text-indigo-500'}`}
                                    >
                                        <Gamepad2 className="w-3 h-3" /> 星图
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

      {/* Result Panel (Bottom Sheet) */}
      {hasAnswered && (
        <div className="absolute bottom-0 left-0 right-0 p-4 z-30 animate-in slide-in-from-bottom-full duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 dark:border-slate-800 p-5 max-h-[60vh] overflow-y-auto">
               
               <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                   <div className={`flex items-center gap-2 font-black text-xl ${isCorrectAnswer ? 'text-green-500' : 'text-red-500'}`}>
                        {isCorrectAnswer ? <><CheckCircle2 className="w-6 h-6" /><span>回答正确!</span></> : <><AlertOctagon className="w-6 h-6" /><span>回答错误</span></>}
                   </div>
                   {isMistakeMode && (
                        <button onClick={onTogglePin} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${isPinned ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                            {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
                            {isPinned ? '已保留' : '不保留'}
                        </button>
                   )}
               </div>

               {(!isCorrectAnswer || question.type === QuestionType.ESSAY) && (
                   <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                       <div className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">正确答案</div>
                       <div className="text-lg font-black text-green-700 dark:text-green-300 whitespace-pre-wrap">
                            {question.type === QuestionType.JUDGE 
                                ? (question.correctAnswer ? '正确 (√)' : '错误 (×)') 
                                : question.type === QuestionType.ESSAY 
                                    ? String(question.correctAnswer)
                                    : (getCorrectAnswerText() as string[]).join(' ')}
                       </div>
                   </div>
               )}

               {question.mnemonic && (
                   <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 mb-4 flex gap-3 border border-amber-100 dark:border-amber-800/30">
                       <BrainCircuit className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                       <div>
                           <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">巧记 Mnemonic</div>
                           <div className="text-sm font-bold text-amber-900 dark:text-amber-100">{question.mnemonic}</div>
                       </div>
                   </div>
               )}

               <div className="flex gap-3 mt-2">
                    {showRetry ? (
                        <button onClick={onRetry} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                            <RotateCcw className="w-5 h-5" /> <span>重试</span>
                        </button>
                    ) : (
                        <button onClick={onNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
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
