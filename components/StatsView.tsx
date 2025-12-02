import React from 'react';
import { UserProgress } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Trophy, Target, AlertCircle } from 'lucide-react';

interface StatsViewProps {
  progress: UserProgress;
  totalQuestions: number;
}

export const StatsView: React.FC<StatsViewProps> = ({ progress, totalQuestions }) => {
  const accuracy = progress.totalAnswered > 0 
    ? Math.round((progress.correctCount / progress.totalAnswered) * 100) 
    : 0;

  const distinctAnswered = Object.keys(progress.questionStats).length;
  const coverage = Math.round((distinctAnswered / totalQuestions) * 100);

  const data = [
    { name: '正确', value: progress.correctCount },
    { name: '错误', value: progress.totalAnswered - progress.correctCount },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Target className="w-4 h-4" />
            <span className="text-xs font-bold">正确率</span>
          </div>
          <div className="text-3xl font-bold">{accuracy}%</div>
          <div className="text-xs mt-1 opacity-70">基于 {progress.totalAnswered} 次答题</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold">刷题进度</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{coverage}%</div>
          <div className="text-xs mt-1 text-slate-400">{distinctAnswered} / {totalQuestions} 题库</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 mb-4">答题分布</h3>
        <div className="h-64 w-full">
            {progress.totalAnswered > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={data}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {data.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                   <Legend verticalAlign="bottom" height={36}/>
                 </PieChart>
               </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300">
                    <AlertCircle className="w-12 h-12 mb-2" />
                    <p>暂无数据，快去刷题吧！</p>
                </div>
            )}
        </div>
      </div>

      {/* Weakness Analysis (Mockup logic based on stats) */}
      <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
        <h3 className="text-sm font-bold text-orange-800 mb-2">需要加强</h3>
        <p className="text-sm text-orange-700 leading-relaxed">
            {accuracy < 60 ? "你的基础还需要巩固，建议多看错题解析和巧记。" : "你的表现不错！继续保持，重点关注那些第一次做错的题目。"}
        </p>
      </div>

    </div>
  );
};