
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Question, QuestionType } from '../types';
import { Search, X, ChevronRight, CheckCircle2, AlertTriangle, HelpCircle, Eye, Target } from 'lucide-react';

interface QuestionListProps {
  questions: Question[];
  onSelect: (q: Question) => void;
  onClose: () => void;
  progress: any;
  activeId?: string; // New prop for auto-scrolling
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions, onSelect, onClose, progress, activeId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const filteredQuestions = useMemo(() => {
      if (!searchTerm) return questions;
      const lower = searchTerm.toLowerCase();
      return questions.filter(q => q.content.toLowerCase().includes(lower) || q.id.toLowerCase().includes(lower));
  }, [questions, searchTerm]);

  // Auto-scroll to active question on mount
  useEffect(() => {
    if (activeId && itemRefs.current.has(activeId)) {
        itemRefs.current.get(activeId)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeId]);

  const getAnswerDisplay = (q: Question) => {
    if (q.type === QuestionType.JUDGE) {
        return q.correctAnswer ? '正确 (√)' : '错误 (×)';
    }
    if (q.type === QuestionType.ESSAY) {
        return String(q.correctAnswer);
    }
    const answers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [String(q.correctAnswer)];
    return answers.join('、');
  };

  return (
    <div className="fixed inset-0 z-50 w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300 border-x border-slate-200 dark:border-slate-800 shadow-2xl">
        <div className="flex-none p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm pt-safe-top">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-6 h-6 text-slate-500" />
            </button>
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索题目..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-safe-bottom">
             <div className="flex justify-between items-center px-1 mb-2">
                 <div className="text-xs font-bold text-slate-400">共 {filteredQuestions.length} 道题目</div>
                 {activeId && <div className="text-[10px] text-blue-500 font-bold flex items-center gap-1"><Target className="w-3 h-3"/> 当前定位</div>}
             </div>
             
             {filteredQuestions.map((q, idx) => {
                 const stats = progress.questionStats[q.id];
                 const attempts = stats?.attempts || [];
                 const hasAttempted = attempts.length > 0;
                 const isMastered = hasAttempted && attempts[attempts.length - 1] === true; // Last attempt was correct
                 const isWrongLast = hasAttempted && attempts[attempts.length - 1] === false; // Last attempt was wrong
                 const isActive = q.id === activeId;

                 return (
                     <button 
                        key={q.id}
                        ref={el => { if (el) itemRefs.current.set(q.id, el); }}
                        onClick={() => onSelect(q)}
                        className={`w-full p-4 rounded-xl border text-left transition-all shadow-sm group duration-200 relative overflow-hidden
                            ${isActive 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 shadow-blue-100 dark:shadow-none' 
                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-300'
                            }
                        `}
                     >
                         {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                         
                         <div className="flex items-start gap-3">
                             <div className={`text-[10px] font-bold mt-1 w-6 shrink-0 flex flex-col items-center gap-1 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                 <span>{idx + 1}</span>
                             </div>
                             
                             <div className="flex-1 min-w-0">
                                 <p className={`text-sm font-medium line-clamp-2 leading-relaxed mb-2 ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-800 dark:text-slate-200'}`}>
                                     {q.content}
                                 </p>
                                 
                                 <div className="flex flex-wrap items-center gap-2">
                                     {/* Question Type Badge */}
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                        q.type === QuestionType.JUDGE ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 
                                        q.type === QuestionType.ESSAY ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                                        'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    }`}>
                                        {q.type === QuestionType.JUDGE ? '判断' : q.type === QuestionType.ESSAY ? '简答' : '选择'}
                                    </span>

                                    {/* Status Badges */}
                                    {isMastered && (
                                         <span className="text-[10px] flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                                             <CheckCircle2 className="w-3 h-3" /> 已对
                                         </span>
                                     )}
                                     {isWrongLast && (
                                         <span className="text-[10px] flex items-center gap-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                                             <AlertTriangle className="w-3 h-3" /> 做错
                                         </span>
                                     )}
                                     {!hasAttempted && (
                                         <span className="text-[10px] flex items-center gap-1 text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                                             <HelpCircle className="w-3 h-3" /> 未做
                                         </span>
                                     )}

                                     {/* Correct Answer Display (Subtle) */}
                                     {(hasAttempted || isActive) && (
                                         <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700 ml-auto max-w-[45%]">
                                             <span className="shrink-0 font-bold opacity-70">答案:</span>
                                             <span className="truncate font-mono font-bold">{getAnswerDisplay(q)}</span>
                                         </div>
                                     )}
                                 </div>
                             </div>
                             
                             <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-500'}`} />
                         </div>
                     </button>
                 );
             })}
        </div>
    </div>
  );
};
