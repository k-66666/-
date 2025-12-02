import React from 'react';
import { BookOpen, BarChart2, PlusCircle, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'quiz' | 'stats' | 'manage';
  onTabChange: (tab: 'quiz' | 'stats' | 'manage') => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    // Outer container: Fixed to viewport, handles safe areas for mobile
    <div className="fixed inset-0 flex flex-col w-full max-w-md mx-auto bg-white shadow-2xl border-x border-slate-100 overflow-hidden">
      
      {/* Header - Fixed at top */}
      <header className="flex-none bg-white border-b border-slate-100 p-4 pt-safe-top z-10 flex items-center justify-between">
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

      {/* Main Content - Scrollable Area */}
      {/* flex-1 ensures it takes all available space between Header and Nav */}
      <main className="flex-1 overflow-y-auto overscroll-contain bg-slate-50 p-4 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation - Fixed at bottom */}
      <nav className="flex-none bg-white border-t border-slate-100 px-6 py-3 pb-safe-bottom flex justify-between items-center z-50">
        <button 
          onClick={() => onTabChange('quiz')}
          className={`flex flex-col items-center gap-1 transition-colors active:scale-95 touch-manipulation ${activeTab === 'quiz' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-[10px] font-bold">刷题</span>
        </button>
        
        <button 
          onClick={() => onTabChange('stats')}
          className={`flex flex-col items-center gap-1 transition-colors active:scale-95 touch-manipulation ${activeTab === 'stats' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <BarChart2 className="w-6 h-6" />
          <span className="text-[10px] font-bold">统计</span>
        </button>

        <button 
          onClick={() => onTabChange('manage')}
          className={`flex flex-col items-center gap-1 transition-colors active:scale-95 touch-manipulation ${activeTab === 'manage' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <PlusCircle className="w-6 h-6" />
          <span className="text-[10px] font-bold">题库</span>
        </button>
      </nav>
    </div>
  );
};