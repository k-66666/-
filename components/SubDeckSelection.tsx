

import React, { useState, useEffect } from 'react';
import { CheckSquare, ListChecks, Scale, Infinity as InfinityIcon, ArrowLeft, FileText, Sparkles, BookOpen } from 'lucide-react';
import { Question, UserProgress } from '../types';

export interface SubDeckConfig {
    type: 'range' | 'tag';
    min?: number;
    max?: number;
    tag?: string;
    label: string;
}

interface SubDeckSelectionProps {
  category: string;
  questions: Question[];
  progress: UserProgress;
  onSelect: (config: SubDeckConfig | null) => void;
  onBack: () => void;
}

const ExamCountdown = () => {
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

  return (
    <div className="flex flex-col items-end">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600/80 dark:text-red-400/80 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>距离考试</span>
        </div>
        <div className="text-xl font-black text-slate-800 dark:text-slate-200 font-mono tracking-tight leading-none">
            {timeLeft.d}<span className="text-xs font-bold text-slate-400 mx-0.5">天</span>
            {timeLeft.h}<span className="text-xs font-bold text-slate-400 mx-0.5">时</span>
            {timeLeft.m}<span className="text-xs font-bold text-slate-400 ml-0.5">分</span>
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

  const getTagStats = (tag: string) => {
      const tagQs = questions.filter(q => q.tags?.includes(tag));
      return calculateStats(tagQs);
  }

  const getTagAndSubTagStats = (tag: string, subTag: string) => {
      const tagQs = questions.filter(q => q.tags?.includes(tag) && q.tags?.includes(subTag));
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

  const rangeOptions = [
    {
      label: '单选题 (基础)',
      min: 1,
      max: 150,
      icon: <CheckSquare className="w-6 h-6 text-blue-500" />,
      color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    {
      label: '多选题 (进阶)',
      min: 151,
      max: 300,
      icon: <ListChecks className="w-6 h-6 text-purple-500" />,
      color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    },
    {
      label: '判断题 (速刷)',
      min: 301,
      max: 450,
      icon: <Scale className="w-6 h-6 text-green-500" />,
      color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    {
      label: '全真模拟 (全部)',
      min: 1,
      max: 1000,
      icon: <InfinityIcon className="w-6 h-6 text-orange-500" />,
      color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    }
  ];

  const examStats = getTagStats('2022真题');
  // Specific stats for just the Essays of 2022
  const essay2022Stats = getTagAndSubTagStats('2022真题', '简答');
  const essay2021Stats = getTagAndSubTagStats('2021真题', '简答');

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between mb-2">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
            </button>
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{category}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">请选择要复习的题型</p>
            </div>
         </div>
         <div className="pt-1">
             <ExamCountdown />
         </div>
      </div>
      
      <div className="grid gap-3">
        {/* Real Exam Card */}
        <button 
            onClick={() => onSelect({ type: 'tag', tag: '2022真题', label: '2022-2023期末真题 (A卷)' })}
            className="w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all active:scale-95 hover:shadow-md bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 dark:border-opacity-50"
        >
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm shrink-0">
                <FileText className="w-6 h-6 text-red-500" />
            </div>
            <div>
                <div className="font-bold text-slate-800 dark:text-slate-100">2022-2023期末真题 (A卷)</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {examStats.count > 0 ? `${examStats.count}道题 · 第${examStats.round}遍刷` : '暂无题目'}
                </div>
            </div>
        </button>

        {/* Essay Questions Section */}
        <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={() => onSelect({ type: 'tag', tag: '2022真题', label: '2022-2023 简答题' })}
                className="w-full p-3 rounded-2xl border text-left flex flex-col gap-3 transition-all active:scale-95 hover:shadow-md bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 dark:border-opacity-50"
            >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm shrink-0">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100">2022-2023 简答</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {essay2022Stats.count > 0 ? `${essay2022Stats.count}道 · 可视化速记` : '暂无题目'}
                    </div>
                </div>
            </button>

            <button 
                onClick={() => onSelect({ type: 'tag', tag: '2021真题', label: '2021-2022 简答题' })}
                className="w-full p-3 rounded-2xl border text-left flex flex-col gap-3 transition-all active:scale-95 hover:shadow-md bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 dark:border-opacity-50"
            >
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm shrink-0">
                    <BookOpen className="w-5 h-5 text-cyan-500" />
                </div>
                <div>
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100">2021-2022 简答</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {essay2021Stats.count > 0 ? `${essay2021Stats.count}道 · 可视化速记` : '暂无题目'}
                    </div>
                </div>
            </button>
        </div>

        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />

        {/* Standard Ranges */}
        {rangeOptions.map((opt, idx) => {
            const stats = getDeckStats(opt.min, opt.max);
            const subText = stats.count > 0 
                ? `${stats.count}道题 · 第${stats.round}遍刷` 
                : '暂无题目';

            return (
                <button 
                    key={idx}
                    onClick={() => onSelect({ type: 'range', min: opt.min, max: opt.max, label: opt.label })}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all active:scale-95 hover:shadow-md ${opt.color} dark:border-opacity-50`}
                >
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm shrink-0">
                        {opt.icon}
                    </div>
                    <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100">{opt.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{subText}</div>
                    </div>
                </button>
            );
        })}
      </div>
    </div>
  );
};
