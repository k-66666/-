import React from 'react';
import { BookOpen, BarChart2, PlusCircle, GraduationCap, AlertTriangle, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'quiz' | 'mistakes' | 'stats' | 'manage';
  onTabChange: (tab: 'quiz' | 'mistakes' | 'stats' | 'manage') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, theme, toggleTheme }) => {
  return (
    // Outer container: Handles dark mode background
    <div className="fixed inset-0 flex flex-col w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-950 border-x border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      
      {/* Header */}
      <header className="flex-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 pt-safe-top z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">自然辩证法</h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">期末复习神器</p>
          </div>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain p-4 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-none bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 pb-safe-bottom flex justify-between items-center z-50">
        <NavButton 
            active={activeTab === 'quiz'} 
            onClick={() => onTabChange('quiz')} 
            icon={<BookOpen className="w-6 h-6" />} 
            label="刷题" 
        />
        <NavButton 
            active={activeTab === 'mistakes'} 
            onClick={() => onTabChange('mistakes')} 
            icon={<AlertTriangle className="w-6 h-6" />} 
            label="错题" 
        />
        <NavButton 
            active={activeTab === 'stats'} 
            onClick={() => onTabChange('stats')} 
            icon={<BarChart2 className="w-6 h-6" />} 
            label="统计" 
        />
        <NavButton 
            active={activeTab === 'manage'} 
            onClick={() => onTabChange('manage')} 
            icon={<PlusCircle className="w-6 h-6" />} 
            label="题库" 
        />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 active:scale-95 touch-manipulation flex-1
        ${active ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
    >
      {icon}
      <span className="text-[10px] font-bold">{label}</span>
    </button>
);