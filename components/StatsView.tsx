import React from 'react';
import { UserProgress } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Trophy, Target, AlertCircle, Zap } from 'lucide-react';

interface StatsViewProps {
  progress: UserProgress;
  totalQuestions: number;
}

export const StatsView: React.FC<StatsViewProps> = ({ progress, totalQuestions }) => {
  const rawAccuracy = progress.totalAnswered > 0 
    ? Math.round((Object.values(progress.questionStats).reduce((acc, stat) => acc + stat.attempts.filter(a=>a).length, 0) / progress.totalAnswered) * 100) 
    : 0;
  
  const attemptedQuestions = Object.values(progress.questionStats);
  const firstTryCorrectCount = attemptedQuestions.filter(stat => stat.attempts.length > 0 && stat.attempts[0] === true).length;
  const firstTryAccuracy = attemptedQuestions.length > 0
    ? Math.round((firstTryCorrectCount / attemptedQuestions.length) * 100)
    : 0;

  const distinctAnswered = Object.keys(progress.questionStats).length;
  const coverage = Math.round((distinctAnswered / totalQuestions) * 100);

  const data = [
    { name: '一次做对', value: firstTryCorrectCount },
    { name: '需要复习', value: distinctAnswered - firstTryCorrectCount },
  ];

  const COLORS = ['#3b82f6', '#cbd5e1']; // Blue & Slate

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

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6 uppercase tracking-wider">学习质量分析</h3>
        <div className="h-48 w-full">
            {distinctAnswered > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={data}
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={70}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {data.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                     itemStyle={{ color: '#fff' }}
                   />
                   <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                 </PieChart>
               </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
                    <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                    <p className="font-medium text-xs">暂无数据，快去刷题吧！</p>
                </div>
            )}
        </div>
      </div>

      {/* Insight Card */}
      <div className={`rounded-2xl p-5 border shadow-sm ${firstTryAccuracy < 60 ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'}`}>
        <h3 className={`text-xs font-bold mb-2 uppercase tracking-wider flex items-center gap-2 ${firstTryAccuracy < 60 ? 'text-orange-700 dark:text-orange-400' : 'text-blue-700 dark:text-blue-400'}`}>
            <Target className="w-4 h-4" />
            {firstTryAccuracy < 60 ? "基础薄弱" : "状态极佳"}
        </h3>
        <p className={`text-sm leading-relaxed font-medium ${firstTryAccuracy < 60 ? 'text-orange-800 dark:text-orange-300' : 'text-blue-800 dark:text-blue-300'}`}>
            {firstTryAccuracy < 60 
                ? "建议切换到「错题」栏目重点复习。多看题目下方的巧记，不要死记硬背。" 
                : "你的第一直觉非常准！继续保持，尝试挑战更多新题，巩固记忆。"}
        </p>
      </div>

    </div>
  );
};