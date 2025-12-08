
import React from 'react';
import { UserProgress, Question, QuestionType, QuestionStat } from '../types';
import { Trophy, Target, AlertCircle, Zap, BarChart3, ArrowUpRight, Play, RotateCw, RefreshCw, BrainCircuit, Activity } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface StatsViewProps {
  progress: UserProgress;
  totalQuestions: number;
  questions: Question[]; // Need questions to identify types
  onReview: (question: Question) => void;
  currentRound: number;
  currentRoundProgress: number;
  onCompleteRound: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ progress, totalQuestions, questions, onReview, currentRound, currentRoundProgress, onCompleteRound }) => {
  const attemptedQuestions = Object.values(progress.questionStats) as QuestionStat[];
  
  // Calculate Overall Accuracy
  const totalAttempts = attemptedQuestions.reduce((acc, s) => acc + s.attempts.length, 0);
  const totalCorrect = attemptedQuestions.reduce((acc, s) => acc + s.attempts.filter(a => a).length, 0);
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Calculate round progress percentage
  const roundPercentage = totalQuestions > 0 ? Math.round((currentRoundProgress / totalQuestions) * 100) : 0;
  const isRoundComplete = currentRoundProgress >= totalQuestions && totalQuestions > 0;

  // Type Analysis for Radar Chart
  const getStatsByType = (type: QuestionType) => {
    const typeQs = questions.filter(q => q.type === type);
    const count = typeQs.length;
    if (count === 0) return { accuracy: 100, count: 0 }; // Default to full if no questions of this type

    const typeStats = typeQs.map(q => progress.questionStats[q.id]).filter((s): s is QuestionStat => !!s);
    if (typeStats.length === 0) return { accuracy: 0, count: 0 };

    const correct = typeStats.reduce((acc, s) => acc + s.attempts.filter(a => a).length, 0);
    const total = typeStats.reduce((acc, s) => acc + s.attempts.length, 0);
    return {
        accuracy: total === 0 ? 0 : Math.round((correct / total) * 100),
        count: typeQs.length
    };
  };

  const choiceStats = getStatsByType(QuestionType.CHOICE);
  const judgeStats = getStatsByType(QuestionType.JUDGE);
  const essayStats = getStatsByType(QuestionType.ESSAY);

  // Radar Data
  const radarData = [
    { subject: '选择题', A: choiceStats.accuracy, fullMark: 100 },
    { subject: '判断题', A: judgeStats.accuracy, fullMark: 100 },
    { subject: '简答题', A: essayStats.accuracy, fullMark: 100 },
    { subject: '活跃度', A: Math.min(100, (progress.streak * 5)), fullMark: 100 }, // Mock metric based on streak
    { subject: '覆盖率', A: Math.round((attemptedQuestions.length / (totalQuestions || 1)) * 100), fullMark: 100 },
  ];

  // Hardest Questions (Top 5 mistakes sorted by TOTAL wrong attempts)
  const hardestQuestions = Object.keys(progress.questionStats)
    .map(id => {
        const q = questions.find(q => q.id === id);
        if (!q) return null;
        const stat = progress.questionStats[id];
        const failures = stat.attempts.filter(a => !a).length;
        return { q, failures };
    })
    .filter((item): item is {q: Question, failures: number} => !!item && item.failures > 0)
    .sort((a, b) => b.failures - a.failures)
    .slice(0, 5);

  const getAnswerDisplay = (q: Question) => {
      if (q.type === QuestionType.JUDGE) {
          return q.correctAnswer ? '正确' : '错误';
      }
      if (q.type === QuestionType.ESSAY) {
          return '查看详情';
      }
      if (Array.isArray(q.correctAnswer)) {
          return (q.correctAnswer as string[]).join('、');
      }
      return String(q.correctAnswer);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      
      {/* Hero Stats Swapped as Requested */}
      <div className="grid grid-cols-2 gap-3 h-36">
        
        {/* Left Card: Round Progress (Dark) */}
        <div className="bg-slate-900 dark:bg-blue-950/40 rounded-2xl p-4 text-white shadow-xl relative overflow-hidden flex flex-col justify-between group">
            {/* Background Decor */}
            <div className="absolute -right-6 -top-6 opacity-10 rotate-12 transition-transform duration-700 group-hover:rotate-45">
                <RefreshCw className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-2 z-10 opacity-80">
                <RotateCw className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">当前轮次</span>
            </div>

            <div className="z-10">
                 <div className="text-3xl font-black tracking-tighter flex items-baseline gap-1">
                    <span className="text-sm font-medium opacity-60">第</span>
                    {currentRound}
                    <span className="text-sm font-medium opacity-60">轮</span>
                 </div>
                 <div className="text-[10px] mt-1 opacity-60 font-medium flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    刷题 {currentRoundProgress} / {totalQuestions}
                 </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/50 h-1.5 rounded-full mt-2 overflow-hidden z-10">
              <div className="bg-blue-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${roundPercentage}%` }} />
            </div>

            {isRoundComplete && (
              <button 
                onClick={onCompleteRound}
                className="absolute inset-0 bg-blue-600/95 hover:bg-blue-500 backdrop-blur-sm flex flex-col items-center justify-center text-white font-bold transition-all z-20 animate-in fade-in"
              >
                  <Trophy className="w-8 h-8 mb-1 animate-bounce" />
                  <span>开启下一轮</span>
              </button>
            )}
        </div>

        {/* Right Card: Accuracy (Light) - The request target */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden flex flex-col justify-between group">
            <div className="flex items-center gap-2 mb-2 text-slate-400 dark:text-slate-500 z-10">
                <Target className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">正确率</span>
            </div>
            
            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <div className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                        {overallAccuracy}<span className="text-sm text-slate-400 ml-0.5">%</span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                        累计答题 {totalAttempts} 次
                    </div>
                </div>
                
                {/* 3D-ish Ring Graphic */}
                <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-100 dark:text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        <path className="text-blue-500 drop-shadow-md transition-all duration-1000 ease-out" strokeDasharray={`${overallAccuracy}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-xl scale-75 animate-pulse" />
                </div>
            </div>
        </div>
      </div>

      {/* Radar Chart Section (New Visual) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" />
            能力五维雷达
        </h3>
        <div className="h-48 w-full -ml-2">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                    <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="My Stats"
                        dataKey="A"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="#3b82f6"
                        fillOpacity={0.3}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: 8, border: 'none', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', fontSize: 12 }}
                        itemStyle={{ color: '#fff' }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Hall of Shame */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            高频错题榜
          </h3>
          <div className="space-y-3">
              {hardestQuestions.length > 0 ? hardestQuestions.map((item, idx) => (
                  <button 
                      key={idx} 
                      onClick={() => onReview(item.q!)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/50 dark:hover:bg-slate-900 transition-colors text-left group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2 mb-1">
                              {item.q?.content}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-2">
                              <span>错 {item.failures} 次</span>
                              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                              <span className="text-green-600 dark:text-green-400 truncate max-w-[100px]">
                                答案: {getAnswerDisplay(item.q!)}
                              </span>
                          </p>
                      </div>
                      <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                             <Play className="w-4 h-4 text-blue-500 fill-current" />
                      </div>
                  </button>
              )) : (
                  <div className="text-center py-8 opacity-50">
                      <BrainCircuit className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-xs text-slate-400">暂无高频错题，继续保持！</p>
                  </div>
              )}
          </div>
      </div>

    </div>
  );
};
