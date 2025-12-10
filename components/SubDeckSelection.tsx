
import React, { useState, useEffect } from 'react';
import { CheckSquare, ListChecks, ArrowLeft, Sparkles, Star, HelpCircle, Calendar, Target, Flame } from 'lucide-react';
import { Question, UserProgress, QuestionType } from '../types';

export interface SubDeckConfig {
    type: 'range' | 'tag';
    min?: number;
    max?: number;
    tag?: string;
    label: string;
    questionType?: QuestionType;
}

interface SubDeckSelectionProps {
  category: string;
  questions: Question[];
  progress: UserProgress;
  onSelect: (config: SubDeckConfig | null) => void;
  onBack: () => void;
}

const ExamCountdownHeader = () => {
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number} | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      // Target: Current Year, December (11), 11th, 14:00:00
      const target = new Date(now.getFullYear(), 11, 11, 14, 0, 0);
      
      const diff = target.getTime() - now.getTime();
      
      if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ d, h, m });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  if (!timeLeft) return null;

  // Encouragement logic
  let message = "保持节奏";
  let textColor = "text-blue-500";
  let bgClass = "bg-blue-50 dark:bg-blue-900/20";
  
  if (timeLeft.d <= 1) {
      message = "决战时刻！";
      textColor = "text-red-500";
      bgClass = "bg-red-50 dark:bg-red-900/20 animate-pulse";
  } else if (timeLeft.d <= 3) {
      message = "最后冲刺！";
      textColor = "text-orange-500";
      bgClass = "bg-orange-50 dark:bg-orange-900/20";
  }

  return (
    <div className="flex flex-col items-end">
        <div className={`flex items-center gap-1.5 text-[10px] font-bold ${textColor} ${bgClass} px-2 py-1 rounded-full mb-1`}>
            {timeLeft.d <= 1 && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
            )}
            <span>{message}</span>
        </div>
        <div className="text-xl font-black text-slate-800 dark:text-slate-200 font-mono tracking-tight leading-none flex items-baseline">
            {timeLeft.d}<span className="text-[10px] font-bold text-slate-400 mx-0.5">天</span>
            {timeLeft.h}<span className="text-[10px] font-bold text-slate-400 mx-0.5">时</span>
        </div>
    </div>
  );
};

export const SubDeckSelection: React.FC<SubDeckSelectionProps> = ({ category, questions, progress, onSelect, onBack }) => {
  
  // Helper to calculate stats for a range
  const getDeckStats = (min: number, max: number) => {
    // Filter questions in this range
    const rangeQs = questions.filter(q => {
        const match = q.id.match(/^zhongte_(\d+)$/);
        if (match) {
            const num = parseInt(match[1]);
            return num >= min && num <= max;
        }
        return false;
    });
    return calculateStats(rangeQs);
  };

  const getTagStats = (tag: string, type?: QuestionType) => {
      let tagQs = questions.filter(q => q.tags?.includes(tag));
      if (type) {
          tagQs = tagQs.filter(q => q.type === type);
      }
      return calculateStats(tagQs);
  }

  const calculateStats = (qs: Question[]) => {
    const count = qs.length;
    if (count === 0) return { count: 0, round: 1 };

    let minAttempts = Infinity;
    for (const q of qs) {
        const stats = progress.questionStats[q.id];
        const attempts = stats ? stats.attempts.length : 0;
        if (attempts < minAttempts) minAttempts = attempts;
    }
    
    if (minAttempts === Infinity) minAttempts = 0;
    return { count, round: minAttempts + 1 };
  }

  const reviewEssayStats = getTagStats('简答复习', QuestionType.ESSAY);
  const exam2022Stats = getTagStats('2022真题');
  const exam2021Stats = getTagStats('2021真题');

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-start justify-between mb-2 px-1">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">{category}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">请选择要复习的题型</p>
            </div>
         </div>
         <div className="pt-1">
             <ExamCountdownHeader />
         </div>
      </div>
      
      <div className="grid gap-3">
        
        <div className="flex items-center gap-2 px-1 mt-2">
            <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">历年真题</h3>
        </div>

        {/* 2022 Exam */}
        <button 
            onClick={() => onSelect({ type: 'tag', tag: '2022真题', label: '2022真题 ' })}
            className="w-full p-4 rounded-3xl border text-left flex items-center gap-4 transition-all active:scale-95 shadow-lg shadow-red-500/5 hover:shadow-xl hover:shadow-red-500/10 bg-gradient-to-br from-white to-red-50/50 dark:from-slate-900 dark:to-slate-800/50 border-red-100 dark:border-red-900/30 group relative overflow-hidden"
        >
            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:scale-125 transition-transform duration-500">
                <Star className="w-24 h-24" />
            </div>
            
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0 text-white font-black text-lg">
                22
            </div>
            <div className="relative z-10">
                <div className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    2022真题 (A卷)
                    <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold animate-pulse">New</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {exam2022Stats.count > 0 ? `${exam2022Stats.count}道题 · 含选择/材料` : '暂无题目'}
                </div>
            </div>
        </button>

        {/* 2021 Exam */}
        <button 
            onClick={() => onSelect({ type: 'tag', tag: '2021真题', label: '2021真题 (A卷)' })}
            className="w-full p-4 rounded-3xl border text-left flex items-center gap-4 transition-all active:scale-95 shadow-sm hover:shadow-md bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 group"
        >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400 font-black text-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                21
            </div>
            <div>
                <div className="font-bold text-lg text-slate-900 dark:text-white">
                    2021真题 (A卷)
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {exam2021Stats.count > 0 ? `${exam2021Stats.count}道题 · 简答` : '暂无题目'}
                </div>
            </div>
        </button>

        {/* Review Essays */}
        <button 
            onClick={() => onSelect({ type: 'tag', tag: '简答复习', label: '简答题重点复习', questionType: QuestionType.ESSAY })}
            className="w-full p-4 rounded-3xl border text-left flex items-center gap-4 transition-all active:scale-95 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-indigo-500 mt-2 relative overflow-hidden group"
        >
             <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500 rotate-12">
                <Sparkles className="w-24 h-24" />
            </div>

            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
                <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="relative z-10">
                <div className="font-black text-lg text-white flex items-center gap-2">
                    简答题重点复习 
                </div>
                <div className="text-xs text-indigo-100 font-medium mt-1 opacity-90">
                    {reviewEssayStats.count > 0 ? `${reviewEssayStats.count}道精选 · 高频考点` : '暂无题目'}
                </div>
            </div>
        </button>

        <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
        
        <div className="flex items-center gap-2 px-1">
            <ListChecks className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">章节题库</h3>
        </div>

        {/* Question Bank (1-150) */}
        <button 
            onClick={() => onSelect({ type: 'range', min: 1, max: 150, label: '单选题库（重点）' })}
            className="w-full p-4 rounded-3xl border text-left flex items-center gap-4 transition-all active:scale-95 hover:shadow-md bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/50 group"
        >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm shrink-0 border border-blue-100 dark:border-blue-900/30">
                <CheckSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
                <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">单选题库 (重点)</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {getDeckStats(1, 150).count}道题 
                </div>
            </div>
        </button>

        {/* Multi Choice (151-300) */}
        <button 
            onClick={() => onSelect({ type: 'range', min: 151, max: 300, label: '多选题库' })}
            className="w-full p-4 rounded-3xl border text-left flex items-center gap-4 transition-all active:scale-95 hover:shadow-md bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800/50 group"
        >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm shrink-0 border border-purple-100 dark:border-purple-900/30">
                <ListChecks className="w-6 h-6 text-purple-500" />
            </div>
            <div>
                <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">多选题库</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {getDeckStats(151, 300).count}道题 
                </div>
            </div>
        </button>

        {/* Judge (301-450) */}
        <button 
            onClick={() => onSelect({ type: 'range', min: 301, max: 450, label: '判断题库 ' })}
            className="w-full p-4 rounded-3xl border text-left flex items-center gap-4 transition-all active:scale-95 hover:shadow-md bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-800/50 group"
        >
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm shrink-0 border border-green-100 dark:border-green-900/30">
                <HelpCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
                <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">判断题库 </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {getDeckStats(301, 450).count}道题 
                </div>
            </div>
        </button>

      </div>
    </div>
  );
};
