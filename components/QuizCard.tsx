import React, { useState, useEffect } from 'react';
import { Question, QuestionType } from '../types';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, BrainCircuit } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ question, onAnswer, onNext }) => {
  const [selectedOption, setSelectedOption] = useState<string | boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
    setShowMnemonic(false);
  }, [question]);

  const handleSelect = (option: string | boolean) => {
    if (hasAnswered) return;
    
    setSelectedOption(option);
    setHasAnswered(true);
    
    const isCorrect = option === question.correctAnswer;
    onAnswer(isCorrect);
    
    // Auto show mnemonic if wrong
    if (!isCorrect) {
      setShowMnemonic(true);
    }
  };

  const getOptionStyle = (option: string | boolean) => {
    if (!hasAnswered) {
      return "bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700";
    }
    
    if (option === question.correctAnswer) {
      return "bg-green-50 border-green-500 text-green-700 shadow-sm";
    }
    
    if (option === selectedOption && option !== question.correctAnswer) {
      return "bg-red-50 border-red-500 text-red-700 shadow-sm";
    }
    
    return "bg-slate-50 border-slate-100 text-slate-400 opacity-50";
  };

  const renderIcon = (option: string | boolean) => {
    if (!hasAnswered) return <div className="w-5 h-5 border-2 border-slate-200 rounded-full" />;
    if (option === question.correctAnswer) return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (option === selectedOption) return <XCircle className="w-5 h-5 text-red-600" />;
    return <div className="w-5 h-5 border-2 border-slate-100 rounded-full" />;
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${question.type === QuestionType.JUDGE ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {question.type === QuestionType.JUDGE ? '判断题' : '选择题'}
            </span>
            {question.tags?.map(tag => (
                <span key={tag} className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md">#{tag}</span>
            ))}
        </div>
        <h2 className="text-xl font-bold leading-relaxed text-slate-800">
          {question.content}
        </h2>
      </div>

      {/* Options Area */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-20">
        {question.type === QuestionType.JUDGE ? (
          <div className="grid grid-cols-2 gap-4">
            {[true, false].map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={hasAnswered}
                className={`p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${getOptionStyle(opt)}`}
              >
                <span className="text-lg font-bold">{opt ? '正确 (√)' : '错误 (×)'}</span>
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
              className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group ${getOptionStyle(opt)}`}
            >
              <span className="font-medium pr-4">{opt}</span>
              {renderIcon(opt)}
            </button>
          ))
        )}
      </div>

      {/* Bottom Action Area (Fixed) */}
      {hasAnswered && (
        <div className="fixed bottom-[80px] left-0 right-0 p-4 max-w-md mx-auto z-20 flex flex-col gap-2">
            
           {/* Mnemonic Card (Collapsible) */}
           {showMnemonic && question.mnemonic && (
               <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-300">
                   <div className="flex items-start gap-3">
                       <BrainCircuit className="w-5 h-5 text-amber-600 mt-1 shrink-0" />
                       <div>
                           <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">巧记 / Mnemonic</h4>
                           <p className="text-sm text-amber-900 font-medium leading-relaxed">{question.mnemonic}</p>
                       </div>
                   </div>
               </div>
           )}

           <div className="flex gap-2">
                {!showMnemonic && question.mnemonic && (
                    <button 
                        onClick={() => setShowMnemonic(true)}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-slate-50"
                    >
                        <Lightbulb className="w-5 h-5" />
                        <span>看巧记</span>
                    </button>
                )}
                <button 
                    onClick={onNext}
                    className="flex-[2] bg-primary text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-600 active:scale-95 transition-all"
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