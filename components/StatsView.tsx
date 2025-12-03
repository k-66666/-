import React from 'react';
import { UserProgress } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Trophy, Target, AlertCircle, Zap } from 'lucide-react';

interface StatsViewProps {
  progress: UserProgress;
  totalQuestions: number;
}

export const StatsView: React.FC<StatsViewProps> = ({ progress, totalQuestions }) => {
  // Calculate overall accuracy (raw count)
  const rawAccuracy = progress.totalAnswered > 0 
    ? Math.round((Object.values(progress.questionStats).reduce((acc, stat) => acc + stat.attempts.filter(a=>a).length, 0) / progress.totalAnswered) * 100) 
    : 0;
  
  // Calculate First Try Accuracy (True mastery)
  const attemptedQuestions = Object.values(progress.questionStats);
  const firstTryCorrectCount = attemptedQuestions.filter(stat => stat.attempts.length > 0 && stat.attempts[0] === true).length;
  const firstTryAccuracy = attemptedQuestions.length > 0
    ? Math.round((firstTryCorrectCount / attemptedQuestions.length) * 100)
    : 0;

  const distinctAnswered = Object.keys(progress.questionStats).length;
  const coverage = Math.round((distinctAnswered / totalQuestions) * 100);

  const data = [
    { name: '第一次做对', value: firstTryCorrectCount },
    { name: '第一次做错', value: distinctAnswered - firstTryCorrectCount },
  ];

  const COLORS = ['#10b981', '#f59e0b'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-5 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Zap className="w-16 h-16" /></div>
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Zap className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">第一直觉正确率</span>
          </div>
          <div className="text-4xl font-black tracking-tight">{firstTryAccuracy}%</div>
          <div className="text-xs mt-2 opacity-70 font-medium">真实水平的体现</div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-2 text-slate-400">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">刷题进度</span>
          </div>
          <div className="text-4xl font-black text-slate-800">{coverage}%</div>
          <div className="text-xs mt-2 text-slate-400 font-medium">{distinctAnswered} / {totalQuestions} 题库</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">首答表现分布</h3>
        <div className="h-64 w-full">
            {distinctAnswered > 0 ? (
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
                    <p className="font-medium">暂无数据，快去刷题吧！</p>
                </div>
            )}
        </div>
      </div>

      {/* Weakness Analysis */}
      <div className={`rounded-3xl p-6 border-l-8 shadow-sm ${firstTryAccuracy < 60 ? 'bg-orange-50 border-orange-400' : 'bg-green-50 border-green-400'}`}>
        <h3 className={`text-sm font-bold mb-2 uppercase tracking-wider ${firstTryAccuracy < 60 ? 'text-orange-800' : 'text-green-800'}`}>
            {firstTryAccuracy < 60 ? "基础薄弱预警" : "学霸认证"}
        </h3>
        <p className={`text-sm leading-relaxed font-medium ${firstTryAccuracy < 60 ? 'text-orange-700' : 'text-green-700'}`}>
            {firstTryAccuracy < 60 
                ? "你的第一直觉正确率偏低。建议开启「错题本」模式，重点攻克那些第一眼就看错的题目，不要死记硬背，多看巧记。" 
                : "你的第一直觉非常准！继续保持这种状态，尝试挑战更多新题，或者休息一下。"}
        </p>
      </div>

    </div>
  );
};