
import React, { useState, useEffect } from 'react';
import { Book, LayoutGrid, Clock } from 'lucide-react';

interface DeckSelectionProps {
  onSelect: (category: string) => void;
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
    <div className="absolute top-6 right-6 flex flex-col items-end z-20">
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

export const DeckSelection: React.FC<DeckSelectionProps> = ({ onSelect }) => {
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-100">
         <LayoutGrid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
         <h2 className="text-xl font-bold">发现牌组</h2>
      </div>
      
      <div className="grid gap-4">
        {/* Dialectics Card */}
        <button 
          onClick={() => onSelect('自然辩证法')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 dark:hover:border-blue-400 transition-all group relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
               <Book className="w-32 h-32" />
           </div>
           <div className="relative z-10">
               <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 font-bold text-xl">
                    辩
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">自然辩证法</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">研究生公共课复习题库</p>
               <div className="mt-4 flex items-center gap-2">
                   <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">不定项选择</span>
                   <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">判断题</span>
               </div>
           </div>
        </button>

        {/* ZhongTe Card */}
        <button 
          onClick={() => onSelect('中特')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 text-left hover:border-red-500 dark:hover:border-red-400 transition-all group relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
               <Book className="w-32 h-32" />
           </div>
           
           <ExamCountdown />

           <div className="relative z-10">
               <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 font-bold text-xl">
                    特
               </div>
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">中特</h3>
               <p className="text-sm text-slate-500 dark:text-slate-400">中国特色社会主义理论体系</p>
               <div className="mt-4 flex items-center gap-2">
                   <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">单选题 (150题)</span>
               </div>
           </div>
        </button>
      </div>
    </div>
  );
};
