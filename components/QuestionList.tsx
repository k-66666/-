
import React, { useState, useMemo } from 'react';
import { Question, QuestionType } from '../types';
import { Search, X, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface QuestionListProps {
  questions: Question[];
  onSelect: (q: Question) => void;
  onClose: () => void;
  progress: any; // Using any for simplicity in props matching, specific type in logic
}

export const QuestionList: React.FC<QuestionListProps> = ({ questions, onSelect, onClose, progress }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuestions = useMemo(() => {
      if (!searchTerm) return questions;
      const lower = searchTerm.toLowerCase();
      return questions.filter(q => q.content.toLowerCase().includes(lower) || q.id.includes(lower));
  }, [questions, searchTerm]);

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
             <div className="text-xs font-bold text-slate-400 px-1 mb-2">共 {filteredQuestions.length} 道题目</div>
             {filteredQuestions.map((q, idx) => {
                 const stats = progress.questionStats[q.id];
                 const isMastered = stats && stats.attempts.length > 0 && stats.attempts.every((a: boolean) => a);
                 const isMistake = stats && stats.attempts.some((a: boolean) => !a);

                 return (
                     <button 
                        key={q.id}
                        onClick={() => onSelect(q)}
                        className="w-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left hover:border-blue-500 dark:hover:border-blue-500 transition-colors shadow-sm group active:scale-[0.99] duration-200"
                     >
                         <div className="flex items-start gap-3">
                             <div className="text-[10px] font-bold text-slate-400 mt-1 w-6 shrink-0">{idx + 1}</div>
                             <div className="flex-1 min-w-0">
                                 <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed mb-2">
                                     {q.content}
                                 </p>
                                 <div className="flex items-center gap-2">
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                                        q.type === QuestionType.JUDGE ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 
                                        q.type === QuestionType.ESSAY ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                                        'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    }`}>
                                        {q.type === QuestionType.JUDGE ? '判断' : q.type === QuestionType.ESSAY ? '简答' : '选择'}
                                    </span>
                                     {isMastered && (
                                         <span className="text-[10px] flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                                             <CheckCircle2 className="w-3 h-3" /> 已掌握
                                         </span>
                                     )}
                                     {isMistake && (
                                         <span className="text-[10px] flex items-center gap-1 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                                             <AlertTriangle className="w-3 h-3" /> 易错
                                         </span>
                                     )}
                                 </div>
                             </div>
                             <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 shrink-0" />
                         </div>
                     </button>
                 );
             })}
        </div>
    </div>
  );
};
