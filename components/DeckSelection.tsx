
import React, { useState, useEffect } from 'react';
import { Book, LayoutGrid, Clock, Bell, Sparkles, Info, MessageCircle, AlertTriangle } from 'lucide-react';

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
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
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

      {/* 公告栏 Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-100">
            <Bell className="w-5 h-5 text-orange-500 fill-orange-500" />
            <h2 className="text-lg font-bold">公告栏</h2>
        </div>

        {/* Update Log */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                        v6.0
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-medium">2025-12-09 12:17</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 fill-current animate-pulse" />
                    <span>重大更新</span>
                </div>
            </div>
            
            <div className="relative z-10">
                <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">新增简答题 <strong>思维导图 (MindMap)</strong> 与 <strong>星图记忆</strong> 模式，助记更高效。</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">新增错题 <strong>全屏红牌警示</strong> (Flashcard)，强化记忆冲击。</span>
                    </li>

                    <li className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span className="leading-relaxed">UI 全面重构，优化动画流畅度与夜间模式体验。</span>
                    </li>
                </ul>
            </div>
        </div>

        {/* User Tips */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-inner">
             <div className="flex items-start gap-3">
                 <Info className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                 <div className="space-y-4 flex-1">
                     <div>
                         <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">用户公告</h3>
                         <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
                            <p>1. 建议使用浏览器（推荐 Chrome/Edge/Safari）直接运行以获得最佳体验。</p>
                            <p className="flex items-start gap-1 text-orange-600 dark:text-orange-400 font-medium">
                                <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                                请勿清除浏览器缓存/Cookies，否则刷题进度将会丢失。
                            </p>
                         </div>
                     </div>
                     
                     <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                         <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                            <MessageCircle className="w-3.5 h-3.5" /> 联系作者
                         </h3>
                         <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            <p className="mb-1">题目有误、新增题库或改进功能建议，请联系微信：</p>
                            <div className="flex flex-wrap gap-2 mt-1.5">
                                <span className="font-mono font-bold select-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                    k先生：17513607707
                                </span>
                                <span className="font-mono font-bold select-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                    z先生：18790660660
                                </span>
                            </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </div>
  );
};
