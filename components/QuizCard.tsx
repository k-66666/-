import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, BrainCircuit, Flame, AlertOctagon } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  streak: number;
  masteryPercentage: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ question, streak, masteryPercentage, onAnswer, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<string | boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowMnemonic(false);
    setIsShaking(false);
    setShowConfetti(false);
  }, [question]);

  const handleSelect = (option: string | boolean) => {
    if (hasAnswered) return;
    
    setSelectedOption(option);
    setHasAnswered(true);
    
    const isCorrect = option === question.correctAnswer;
    onAnswer(isCorrect);
    
    if (isCorrect) {
      setShowConfetti(true);
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500); // Reset shake
      setShowMnemonic(true); // Auto show mnemonic if wrong
    }
  };

  const getOptionStyle = (option: string | boolean) => {
    // Base style for all options (3D feel)
    const base = "border-b-4 active:border-b-0 active:translate-y-[4px] transition-all duration-100";
    
    if (!hasAnswered) {
      return `${base} bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700`;
    }
    
    if (option === question.correctAnswer) {
      return "bg-green-100 border-green-500 border-b-4 text-green-800 font-bold transform scale-[1.02]";
    }
    
    if (option === selectedOption && option !== question.correctAnswer) {
      return "bg-red-100 border-red-500 border-b-4 text-red-800 opacity-80";
    }
    
    return "bg-slate-50 border-slate-100 border-b-2 text-slate-400 opacity-40";
  };

  const renderIcon = (option: string | boolean) => {
    if (!hasAnswered) return <div className="w-5 h-5 border-2 border-slate-200 rounded-full" />;
    if (option === question.correctAnswer) return <CheckCircle2 className="w-6 h-6 text-green-600 animate-pop" />;
    if (option === selectedOption) return <XCircle className="w-6 h-6 text-red-600 animate-pop" />;
    return <div className="w-5 h-5 border-2 border-slate-100 rounded-full" />;
  };

  // Simple confetti effect
  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="confetti" style={{ 
          left: `${Math.random() * 100}%`, 
          backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00'][Math.floor(Math.random() * 4)],
          animationDelay: `${Math.random() * 0.5}s`
        }} />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4 relative">
      {showConfetti && <Confetti />}

      {/* Stats Header */}
      <div className="flex items-center justify-between px-2">
         {/* Mastery Bar */}
         <div className="flex-1 mr-4">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold uppercase tracking-wider">
               <span>题库通关率</span>
               <span>{masteryPercentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${isShaking ? 'bg-red-500' : 'bg-green-500'}`} 
                  style={{ width: `${masteryPercentage}%` }}
                />
            </div>
         </div>
         
         {/* Streak Counter */}
         <div className={`flex items-center gap-1 font-black transition-all ${streak > 2 ? 'text-orange-500 scale-110' : 'text-slate-300'}`}>
            <Flame className={`w-5 h-5 ${streak > 0 ? 'animate-fire' : ''}`} fill={streak > 0 ? "currentColor" : "none"} />
            <span className="text-xl">{streak}</span>
         </div>
      </div>

      {/* Question Card */}
      <div className={`bg-white rounded-3xl shadow-sm p-6 border-2 border-slate-100 relative overflow-hidden flex-shrink-0 transition-transform ${isShaking ? 'animate-shake border-red-300 bg-red-50' : ''}`}>
        <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${question.type === QuestionType.JUDGE ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {question.type === QuestionType.JUDGE ? '判断题' : '选择题'}
            </span>
            {question.tags?.map(tag => (
                <span key={tag} className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-full">#{tag}</span>
            ))}
        </div>
        <h2 className="text-xl font-bold leading-relaxed text-slate-800 tracking-wide">
          {question.content}
        </h2>
      </div>

      {/* Options Area */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-24 px-1">
        {question.type === QuestionType.JUDGE ? (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[true, false].map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={hasAnswered}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 shadow-sm ${getOptionStyle(opt)}`}
              >
                <span className="text-xl font-black">{opt ? '正确' : '错误'}</span>
                {hasAnswered && renderIcon(opt)}
              </button>
            ))}
          </div>
        ) : (
          question.options?.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(opt)}
              disabled={hasAnswered}
              className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between group shadow-sm ${getOptionStyle(opt)}`}
            >
              <span className="font-medium pr-4 leading-normal">{opt}</span>
              {renderIcon(opt)}
            </button>
          ))
        )}
      </div>

      {/* Bottom Action Area (Fixed) */}
      {hasAnswered && (
        <div className="fixed bottom-[80px] left-0 right-0 p-4 max-w-md mx-auto z-20 flex flex-col gap-3 animate-pop">
            
           {/* Feedback Banner */}
           <div className={`rounded-xl p-3 flex items-center justify-center gap-2 shadow-md ${selectedOption === question.correctAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                {selectedOption === question.correctAnswer ? (
                    <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold">回答正确! Perfect!</span>
                    </>
                ) : (
                    <>
                        <AlertOctagon className="w-5 h-5" />
                        <span className="font-bold">回答错误! Oops!</span>
                    </>
                )}
           </div>

           {/* Mnemonic Card (Auto-show on error) */}
           {showMnemonic && question.mnemonic && (
               <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 shadow-xl">
                   <div className="flex items-start gap-3">
                       <BrainCircuit className="w-6 h-6 text-amber-600 mt-1 shrink-0" />
                       <div>
                           <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-1">巧记 / MNEMONIC</h4>
                           <p className="text-base text-amber-900 font-bold leading-relaxed">{question.mnemonic}</p>
                       </div>
                   </div>
               </div>
           )}

           <div className="flex gap-3 mt-1">
                {!showMnemonic && question.mnemonic && (
                    <button 
                        onClick={() => setShowMnemonic(true)}
                        className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3.5 px-6 rounded-2xl shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <Lightbulb className="w-5 h-5" />
                        <span>看巧记</span>
                    </button>
                )}
                <button 
                    onClick={onNext}
                    className="flex-[2] bg-primary text-white font-bold py-3.5 px-6 rounded-2xl shadow-blue-300 shadow-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-95 transition-all animate-pulse"
                >
                    <span>下一题</span>
                    <ArrowRight className="w-5 h-5" />
                </button>
           </div>
        </div>
      )}
    </div>
  );
};