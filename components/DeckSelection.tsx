
import React, { useState, useEffect } from 'react';
import { Book, LayoutGrid, Bell, Sparkles, Info, MessageCircle, AlertTriangle, Calendar, Target, Flame, X, Rocket, Clock, History, ChevronRight } from 'lucide-react';

interface DeckSelectionProps {
  onSelect: (category: string) => void;
}

// === VERSION DATA ===
const VERSION_HISTORY = [
    {
        version: 'v6.6',
        date: '2025.12.10 19:56',
        tag: '重要更新',
        isNew: true,
        logs: [
            "优化了加载性能，提升访问速度",
            "单选题100%正确，更正了三道错题",
            "我国经济发展的路径选择是()应选择C 若您的答案不为C.构建新发展格局，请清除浏览器缓存重新加载网站尝试",
            "完善社会主义市场经济体制的核心问题是处理好( )关系。应选择D.市场与供需",
            "经过( )个五年规划(计划),我们已经为实现建设社会主义现代化国家的目标奠定了坚实基础，应选择B.13",
            "如果您的题答案不是上述，请清除浏览器缓存，并重新加载网站尝试"
        ]
    },
    {
        version: 'v6.5',
        date: '2025.12.08',
        tag: '功能新增',
        isNew: false,
        logs: [
            "新增“2022真题”板块，包含选择题与材料分析题",
            "优化了错题本的排序算法，优先显示最近做错的题目",
            "增加了“简答复习”专题，重点攻克记忆难点"
        ]
    },
    {
        version: 'v6.0',
        date: '2025.12.01',
        tag: '正式发布',
        isNew: false,
        logs: [
            "华水期中刷题神器正式上线！",
            "收录自然辩证法、中特核心题库",
            "支持刷题、错题本、统计分析功能"
        ]
    }
];

const LATEST_VERSION = VERSION_HISTORY[0];

const ExamCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number} | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
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

  let message = "按部就班，稳扎稳打";
  let colorClass = "from-blue-500 to-cyan-400";
  let icon = <Calendar className="w-3.5 h-3.5" />;

  if (timeLeft.d <= 1) {
      message = "决战时刻，稳住能赢！";
      colorClass = "from-red-500 to-orange-500 animate-pulse";
      icon = <Flame className="w-3.5 h-3.5 fill-current" />;
  } else if (timeLeft.d <= 3) {
      message = "最后冲刺，乾坤未定！";
      colorClass = "from-orange-500 to-amber-400";
      icon = <Target className="w-3.5 h-3.5" />;
  } else if (timeLeft.d <= 7) {
      message = "查漏补缺，保持节奏";
      colorClass = "from-indigo-500 to-purple-400";
  }

  return (
    <div className="mt-3 bg-white/50 dark:bg-black/20 rounded-xl p-3 border border-red-100 dark:border-red-900/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-1.5">
            <div className={`flex items-center gap-1.5 text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-gradient-to-r shadow-sm ${colorClass}`}>
                {icon}
                <span>{message}</span>
            </div>
            <div className="text-[10px] font-bold text-red-400 dark:text-red-300">
                距离考试
            </div>
        </div>
        <div className="flex items-baseline gap-1 text-slate-800 dark:text-slate-100 font-mono tracking-tight">
             <span className="text-2xl font-black tabular-nums">{timeLeft.d}</span>
             <span className="text-xs font-bold text-slate-400 mr-2">天</span>
             <span className="text-xl font-black tabular-nums">{timeLeft.h}</span>
             <span className="text-xs font-bold text-slate-400 mr-2">时</span>
             <span className="text-xl font-black tabular-nums">{timeLeft.m}</span>
             <span className="text-xs font-bold text-slate-400">分</span>
        </div>
    </div>
  );
};

const AnnouncementModal = ({ version, onClose }: { version: typeof LATEST_VERSION, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-pop relative">
                
                {/* Decorative Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 pt-8 pb-12 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform rotate-12 scale-150 -translate-y-4 translate-x-4">
                        <Rocket className="w-32 h-32 text-white" />
                    </div>
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-3 py-1 text-white text-[10px] font-bold mb-3 shadow-sm">
                            <Sparkles className="w-3 h-3 animate-pulse" />
                            <span>{version.tag}</span>
                        </div>
                        <h2 className="text-3xl font-black text-white mb-1">{version.version}</h2>
                        <p className="text-blue-100 text-xs font-medium opacity-90">{version.date}</p>
                    </div>
                </div>

                {/* Content Body - Overlapping header */}
                <div className="relative z-20 -mt-8 px-4 pb-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-5">
                         <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                            <Bell className="w-4 h-4 text-orange-500" />
                            更新内容
                         </h3>
                         <ul className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
                            {version.logs.map((log, idx) => (
                                <li key={idx} className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <span>{log}</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0">
                    <button 
                        onClick={onClose}
                        className="w-full py-3.5 bg-slate-900 dark:bg-blue-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <span>我知道了</span>
                    </button>
                </div>

                {/* Close X Top Right */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 text-white rounded-full transition-colors z-30"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

const HistoryModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-in-right">
                
                {/* Header */}
                <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-2">
                         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400">
                             <History className="w-5 h-5" />
                         </div>
                         <div>
                             <h2 className="text-lg font-bold text-slate-800 dark:text-white">历史公告</h2>
                             <p className="text-xs text-slate-500 dark:text-slate-400">版本更新记录</p>
                         </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950">
                    {VERSION_HISTORY.map((ver, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-md ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                        {ver.version}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{ver.date}</span>
                                </div>
                                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                                    {ver.tag}
                                </span>
                            </div>
                            <ul className="space-y-2">
                                {ver.logs.map((log, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                                        <span>{log}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const DeckSelection: React.FC<DeckSelectionProps> = ({ onSelect }) => {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const storageKey = `seen_version_${LATEST_VERSION.version}`;
    const hasSeen = localStorage.getItem(storageKey);
    
    // Check if new version unseen
    if (!hasSeen) {
        const timer = setTimeout(() => setShowAnnouncement(true), 600);
        return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseAnnouncement = () => {
      setShowAnnouncement(false);
      localStorage.setItem(`seen_version_${LATEST_VERSION.version}`, 'true');
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Floating Announcement Modal for New Version */}
      {showAnnouncement && <AnnouncementModal version={LATEST_VERSION} onClose={handleCloseAnnouncement} />}

      {/* History Modal */}
      {showHistory && <HistoryModal onClose={() => setShowHistory(false)} />}

      <div className="flex items-center gap-2 mb-2 px-1">
         <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
             <LayoutGrid className="w-5 h-5 text-blue-600 dark:text-blue-400" />
         </div>
         <div>
             <h2 className="text-lg font-black text-slate-800 dark:text-white">发现牌组</h2>
             <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">选择科目开始复习</p>
         </div>
      </div>
      
      <div className="grid gap-5">
        {/* Dialectics Card */}
        <button 
          onClick={() => onSelect('自然辩证法')}
          className="group relative w-full text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700/50 group-hover:shadow-xl group-hover:border-blue-200 dark:group-hover:border-blue-700/50 transition-all" />
           <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 ease-out origin-top-right">
               <Book className="w-40 h-40" />
           </div>
           
           <div className="relative z-10 p-5 flex flex-col h-full">
               <div className="flex justify-between items-start mb-4">
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 flex items-center justify-center text-white font-black text-2xl">
                        辩
                   </div>
                   <div className="flex gap-1">
                        <span className="text-[10px] font-bold bg-white/80 dark:bg-slate-800/80 backdrop-blur px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-500">不定项</span>
                        <span className="text-[10px] font-bold bg-white/80 dark:bg-slate-800/80 backdrop-blur px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-500">判断题</span>
                   </div>
               </div>
               
               <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">自然辩证法</h3>
               <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[80%]">
                   研究生公共课核心题库，包含深度解析与巧记。
               </p>
           </div>
        </button>

        {/* ZhongTe Card */}
        <button 
          onClick={() => onSelect('中特')}
          className="group relative w-full text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-slate-900 rounded-3xl shadow-md border border-red-100 dark:border-red-900/30 group-hover:shadow-xl group-hover:shadow-red-500/10 group-hover:border-red-200 dark:group-hover:border-red-800/50 transition-all" />
           
           <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 ease-out origin-top-right">
               <Target className="w-40 h-40" />
           </div>

           <div className="relative z-10 p-5">
               <div className="flex justify-between items-start mb-2">
                   <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20 flex items-center justify-center text-white font-black text-2xl">
                        特
                   </div>
               </div>

               <h3 className="text-xl font-black text-slate-800 dark:text-white mb-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">中国特色社会主义</h3>
               <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                   包含2025新版试卷结构，重点难点全覆盖。
               </p>

               <ExamCountdown />

               <div className="mt-3 flex items-start gap-2 bg-white/60 dark:bg-slate-800/40 rounded-lg p-2.5 border border-red-100/50 dark:border-red-900/20">
                   <Sparkles className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0 animate-pulse" />
                   <div className="text-[10px] leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                       <span className="font-bold text-red-600 dark:text-red-400 block mb-0.5">2025 试卷结构</span>
                       单选30道(1分) · 多选5道(2分) · 简答2道(5分) · 论述2道(15分) · 材料1道(20分)
                   </div>
               </div>
           </div>
        </button>
      </div>

      {/* 公告栏 Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Bell className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-base font-bold text-slate-700 dark:text-slate-200">公告栏</h2>
            </div>
            
            {/* History Trigger */}
            <button 
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-blue-500 transition-colors bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full"
            >
                <History className="w-3 h-3" />
                历史公告
            </button>
        </div>

        {/* Static Latest Log Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-[40px] pointer-events-none transition-transform group-hover:scale-110" />
            
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <span className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                        {LATEST_VERSION.version}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">{LATEST_VERSION.date}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full ring-1 ring-blue-500/10">
                    <Sparkles className="w-3 h-3 fill-current animate-pulse" />
                    <span>{LATEST_VERSION.tag}</span>
                </div>
            </div>
            
            <div className="relative z-10">
                <ul className="space-y-3">
                    {LATEST_VERSION.logs.map((log, idx) => (
                        <li key={idx} className="flex gap-3 text-xs text-slate-600 dark:text-slate-300 group/item leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0 group-hover/item:scale-125 transition-transform" />
                            <span>{log}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* User Tips */}
        <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-inner">
             <div className="flex items-start gap-4">
                 <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                    <Info className="w-5 h-5 text-slate-400" />
                 </div>
                 <div className="space-y-4 flex-1">
                     <div>
                         <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-2">
                             用户须知
                         </h3>
                         <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed space-y-2 font-medium">
                            <p>推荐使用 Chrome/Edge/Safari 浏览器访问以获得最佳动画体验。</p>
                            <p className="flex items-start gap-1.5 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 p-2 rounded-lg border border-orange-100 dark:border-orange-900/30">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span>请勿清除浏览器缓存/Cookies，否则刷题进度将会丢失。</span>
                            </p>
                         </div>
                     </div>
                     
                     <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                         <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                            <MessageCircle className="w-3.5 h-3.5" /> 联系作者
                         </h3>
                         <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            <p className="mb-2">感谢支持，如有题目勘误或功能建议，请联系：</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="font-mono text-[10px] font-bold select-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-colors cursor-text">
                                    k先生：17513607707
                                </span>
                                <span className="font-mono text-[10px] font-bold select-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-colors cursor-text">
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
