import React from 'react';
import { BookOpen, BarChart2, PlusCircle, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'quiz' | 'stats' | 'manage';
  onTabChange: (tab: 'quiz' | 'stats' | 'manage') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-2xl overflow-hidden border-x border-slate-100">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-100 p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800">自然辩证法</h1>
            <p className="text-xs text-slate-400 font-medium">期末复习神器</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center pb-6 md:pb-3">
        <button 
          onClick={() => onTabChange('quiz')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'quiz' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold">刷题</span>
        </button>
        
        <button 
          onClick={() => onTabChange('stats')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'stats' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-bold">统计</span>
        </button>

        <button 
          onClick={() => onTabChange('manage')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'manage' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold">题库</span>
        </button>
      </nav>
    </div>
  );
};