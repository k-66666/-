import React from 'react';
import { UserProgress, Question, QuestionType, QuestionStat } from '../types';
import { Trophy, Target, AlertCircle, Zap, BarChart3, ArrowUpRight, Play } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StatsViewProps {
  progress: UserProgress;
  totalQuestions: number;
  questions: Question[]; // Need questions to identify types
  onReview: (question: Question) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ progress, totalQuestions, questions, onReview }) => {
  const attemptedQuestions = Object.values(progress.questionStats) as QuestionStat[];
  const firstTryCorrectCount = attemptedQuestions.filter(stat => stat.attempts.length > 0 && stat.attempts[0] === true).length;
  const firstTryAccuracy = attemptedQuestions.length > 0
    ? Math.round((firstTryCorrectCount / attemptedQuestions.length) * 100)
    : 0;

  const distinctAnswered = Object.keys(progress.questionStats).length;
  const coverage = Math.round((distinctAnswered / totalQuestions) * 100);

  // Type Analysis
  const getAccuracyByType = (type: QuestionType) => {
    const typeQs = questions.filter(q => q.type === type);
    const typeStats = typeQs.map(q => progress.questionStats[q.id]).filter((s): s is QuestionStat => !!s);
    if (typeStats.length === 0) return 0;
    const correct = typeStats.reduce((acc, s) => acc + s.attempts.filter(a => a).length, 0);
    const total = typeStats.reduce((acc, s) => acc + s.attempts.length, 0);
    return total === 0 ? 0 : Math.round((correct / total) * 100);
  };

  const choiceAccuracy = getAccuracyByType(QuestionType.CHOICE);
  const judgeAccuracy = getAccuracyByType(QuestionType.JUDGE);

  const barData = [
    { name: '选择题', accuracy: choiceAccuracy },
    { name: '判断题', accuracy: judgeAccuracy },
  ];

  // Hardest Questions (Top 5 mistakes)
  const hardestQuestions = Object.keys(progress.questionStats)
    .map(id => {
        const q = questions.find(q => q.id === id);
        const stat = progress.questionStats[id];
        const failures = stat.attempts.filter(a => !a).length;
        return { q, failures };
    })
    .filter(item => item.q && item.failures > 0)
    .sort((a, b) => b.failures - a.failures)
    .slice(0, 5);

  return (
    <div className="space-y-4 animate-in fade-in duration-500 pb-20">
      
      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900 dark:bg-blue-600 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Zap className="w-16 h-16" /></div>
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">第一直觉</span>
          </div>
          <div className="text-4xl font-black tracking-tight">{firstTryAccuracy}%</div>
          <div className="text-[10px] mt-2 opacity-60 font-medium">真实掌握水平</div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-2 text-slate-400 dark:text-slate-500">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">刷题进度</span>
          </div>
          <div className="text-4xl font-black text-slate-800 dark:text-slate-200">{coverage}%</div>
          <div className="text-[10px] mt-2 text-slate-400 dark:text-slate-500 font-medium">{distinctAnswered} / {totalQuestions} 题库</div>
        </div>
      </div>

      {/* Type Analysis Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            题型正确率对比
        </h3>
        <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 30 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={50} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: 8, border: 'none', background: '#1e293b', color: '#fff' }} />
                    <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#a855f7" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Hall of Shame (Hardest Questions) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            高频错题榜 (Top 5)
          </h3>
          <div className="space-y-3">
              {hardestQuestions.length > 0 ? hardestQuestions.map((item, idx) => (
                  <button 
                      key={idx} 
                      onClick={() => onReview(item.q!)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/50 dark:hover:bg-slate-900 transition-colors text-left group"
                  >
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-2 mb-1">
                              {item.q?.content}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              答案: <span className="text-green-600 dark:text-green-400">
                                {item.q?.type === QuestionType.JUDGE 
                                    ? (item.q?.correctAnswer ? '正确' : '错误') 
                                    : (item.q?.correctAnswer as string[]).join('、')
                                }
                              </span>
                          </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-xs font-bold text-orange-500 shrink-0">
                            错 {item.failures} 次
                        </div>
                        <div className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Play className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                  </button>
              )) : (
                  <p className="text-xs text-slate-400 text-center py-4">暂无高频错题，继续保持！</p>
              )}
          </div>
      </div>

    </div>
  );
};