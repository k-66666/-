
import React from 'react';
import { BookOpen, BarChart2, PlusCircle, GraduationCap, AlertTriangle, Moon, Sun, ArrowLeft, LayoutGrid, Sparkles, Volume2, VolumeX, ZapOff } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'quiz' | 'mistakes' | 'stats' | 'manage';
  onTabChange: (tab: 'quiz' | 'mistakes' | 'stats' | 'manage') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  effectsEnabled: boolean;
  toggleEffects: () => void;
  title?: string;
  onBack?: () => void;
  showNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
    children, 
    activeTab, 
    onTabChange, 
    theme, 
    toggleTheme,
    soundEnabled,
    toggleSound,
    effectsEnabled,
    toggleEffects, 
    title = "华水期中神器",
    onBack,
    showNav = true
}) => {
  return (
    // Outer container: Handles dark mode background
    <div className="fixed inset-0 flex flex-col w-full max-w-md mx-auto bg-slate-50 dark:bg-slate-950 border-x border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
      
      {/* Header */}
      <header className="flex-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 pt-safe-top z-10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          {onBack ? (
              <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0">
                  <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
          ) : (
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl shrink-0">
               <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          )}
          
          <div className="min-w-0">
            <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-tight truncate">{title}</h1>
            {!onBack && <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">by k</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-0.5 shrink-0">
             {/* Effects Toggle */}
             <button 
              onClick={toggleEffects}
              className={`p-2 rounded-full transition-all duration-300 ${effectsEnabled ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title={effectsEnabled ? "关闭特效" : "开启特效"}
            >
              {effectsEnabled ? <Sparkles className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
            </button>

            {/* Sound Toggle */}
            <button 
              onClick={toggleSound}
              className={`p-2 rounded-full transition-all duration-300 ${soundEnabled ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title={soundEnabled ? "关闭音效" : "开启音效"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

            {onBack && (
                <button 
                onClick={onBack}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                title="切换题组"
                >
                <LayoutGrid className="w-5 h-5" />
                </button>
            )}
            <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain p-4 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
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
      )}
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
