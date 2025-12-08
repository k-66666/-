import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question, QuestionType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, Flame, AlertOctagon, RotateCcw, BookOpen, AlertTriangle, Pin, PinOff, CheckSquare, Search, ChevronDown, MousePointer2, Scan, Trophy, Zap } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  streak: number;
  masteryPercentage: number;
  answeredCount: number;
  totalCount: number;
  mistakeCount: number;
  isPinned: boolean;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  onRetry: () => void;
  onTogglePin: () => void;
  isMistakeMode?: boolean;
}

// --- Types for the Game Engine ---
interface GameNode {
  id: string;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  status: 'active' | 'captured' | 'collecting';
  color: string;
}

// --- Gamified Memory Engine ---
const GamifiedMemoryEngine = ({ centerText, points, onComplete }: { centerText: string, points: string[], onComplete: () => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<GameNode[]>([]);
    const [gameStatus, setGameStatus] = useState<'intro' | 'playing' | 'victory'>('intro');
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const requestRef = useRef<number>(0);
    
    // Colors for the cyberpunk theme
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

    // Initialize Game
    useEffect(() => {
        if (points.length === 0) return;
        
        const initialNodes: GameNode[] = points.map((text, i) => ({
            id: `node-${i}`,
            text,
            x: Math.random() * 60 + 20, // 20-80%
            y: Math.random() * 60 + 20, // 20-80%
            vx: (Math.random() - 0.5) * 0.4, // Random velocity
            vy: (Math.random() - 0.5) * 0.4,
            status: 'active',
            color: colors[i % colors.length]
        }));
        setNodes(initialNodes);
        
        // Start intro animation sequence
        const timer = setTimeout(() => setGameStatus('playing'), 1500);
        return () => clearTimeout(timer);
    }, [points]);

    // Physics Loop
    const updatePhysics = () => {
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.status === 'captured') return node;

            let { x, y, vx, vy } = node;

            if (node.status === 'collecting') {
                // Fly to center (50, 50)
                const dx = 50 - x;
                const dy = 50 - y;
                x += dx * 0.15;
                y += dy * 0.15;
                
                // If close enough, mark captured
                if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                    return { ...node, status: 'captured', x: 50, y: 50 };
                }
                return { ...node, x, y };
            }

            // Normal floating physics
            x += vx;
            y += vy;

            // Wall bounce
            if (x <= 10 || x >= 90) vx *= -1;
            if (y <= 10 || y >= 90) vy *= -1;

            return { ...node, x, y, vx, vy };
        }));

        requestRef.current = requestAnimationFrame(updatePhysics);
    };

    useEffect(() => {
        if (gameStatus === 'playing') {
            requestRef.current = requestAnimationFrame(updatePhysics);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [gameStatus]);

    // Check Win Condition
    useEffect(() => {
        if (nodes.length > 0 && nodes.every(n => n.status === 'captured') && gameStatus !== 'victory') {
            setGameStatus('victory');
            setTimeout(onComplete, 1000);
        }
    }, [nodes, gameStatus]);

    const handleNodeClick = (id: string) => {
        if (gameStatus !== 'playing') return;
        
        setNodes(prev => {
            const node = prev.find(n => n.id === id);
            if (!node || node.status !== 'active') return prev;
            
            // Trigger haptic/sound effect logic here
            setScore(s => s + 100 + (combo * 10));
            setCombo(c => c + 1);
            
            return prev.map(n => n.id === id ? { ...n, status: 'collecting' } : n);
        });

        // Reset combo if no click for 2 seconds
        // (Simplified logic for React state)
    };

    return (
        <div ref={containerRef} className="relative w-full h-[400px] bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl group select-none">
            
            {/* 1. Background Grid & Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)_translateY(-100px)_scale(1.5)] opacity-50 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,rgba(2,6,23,1)_80%)] pointer-events-none" />
            
            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_2px,3px_100%] pointer-events-none z-20" />

            {/* 2. HUD Interface */}
            <div className="absolute top-4 left-4 z-10 font-mono text-xs">
                <div className="flex items-center gap-2 text-cyan-400 mb-1">
                    <Scan className="w-4 h-4 animate-pulse" />
                    <span>NEURAL_LINK: {gameStatus === 'playing' ? 'ACTIVE' : gameStatus.toUpperCase()}</span>
                </div>
                <div className="text-slate-500">TARGETS: {nodes.filter(n => n.status === 'captured').length}/{nodes.length}</div>
            </div>

            <div className="absolute top-4 right-4 z-10 font-mono text-right">
                <div className="text-2xl font-black text-yellow-400 tabular-nums tracking-tighter drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                    {score.toString().padStart(6, '0')}
                </div>
                {combo > 1 && (
                    <div className="text-xs font-bold text-orange-500 animate-bounce">
                        {combo}x COMBO!
                    </div>
                )}
            </div>

            {/* 3. The Central Core (Question) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 z-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <div className={`relative transition-all duration-500 ${gameStatus === 'victory' ? 'scale-125' : 'scale-100'}`}>
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
                    <div className="relative bg-slate-900/80 backdrop-blur-md border border-blue-500/50 p-4 rounded-full shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                        <BrainCircuit className={`w-12 h-12 text-blue-400 ${gameStatus === 'playing' ? 'animate-pulse' : ''}`} />
                    </div>
                </div>
                {/* Connecting Beams */}
                {nodes.filter(n => n.status === 'captured').map(n => (
                    <div key={`beam-${n.id}`} className="absolute top-1/2 left-1/2 w-[200px] h-[2px] bg-gradient-to-r from-blue-500 to-transparent origin-left animate-pulse" 
                        style={{ 
                            transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
                            opacity: 0.5
                        }} 
                    />
                ))}
            </div>

            {/* 4. Game Nodes (The Keywords) */}
            {gameStatus !== 'intro' && nodes.map((node) => {
                if (node.status === 'captured') return null; // Don't render captured nodes floating
                
                return (
                    <button
                        key={node.id}
                        onClick={() => handleNodeClick(node.id)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform active:scale-95 ${node.status === 'collecting' ? 'duration-500 ease-in' : 'duration-0'}`}
                        style={{
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                            zIndex: 10
                        }}
                    >
                        {/* The Node Appearance */}
                        <div 
                            className="relative px-4 py-2 bg-slate-900/90 backdrop-blur-xl border-2 rounded-lg shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center gap-2 overflow-hidden hover:scale-105 transition-all"
                            style={{ 
                                borderColor: node.color,
                                boxShadow: `0 0 20px ${node.color}40`
                            }}
                        >
                            {/* Scanning Line Animation */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                            
                            <div className="w-2 h-2 rounded-full animate-ping absolute left-2" style={{ backgroundColor: node.color }} />
                            <span className="relative z-10 text-sm font-bold text-white tracking-wide pl-2" style={{ textShadow: `0 0 10px ${node.color}` }}>
                                {node.text}
                            </span>
                        </div>
                        
                        {/* Target Reticle Effect */}
                        <div className="absolute inset-0 -m-2 border border-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity scale-110 group-hover:scale-100 duration-300 pointer-events-none">
                            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
                            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />
                        </div>
                    </button>
                );
            })}

            {/* 5. Intro Overlay */}
            {gameStatus === 'intro' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50">
                    <div className="text-center animate-in zoom-in duration-500">
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-2">
                            SYSTEM LINK
                        </div>
                        <div className="text-sm text-cyan-500 font-mono animate-pulse">
                            INITIALIZING MEMORY PROTOCOLS...
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Victory Overlay */}
            {gameStatus === 'victory' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] animate-in zoom-in duration-300 scale-150">
                        100%
                    </div>
                    <div className="text-yellow-100 font-bold tracking-[0.5em] text-sm mt-2 animate-in slide-in-from-bottom-4 fade-in duration-700">
                        SYNCHRONIZED
                    </div>
                </div>
            )}
            
            {/* Captured List (HUD Bottom) */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 justify-center pointer-events-none">
                 {nodes.filter(n => n.status === 'captured').map(n => (
                     <div key={n.id} className="bg-slate-900/80 border border-slate-700 text-slate-300 px-2 py-1 rounded text-[10px] font-mono animate-in slide-in-from-bottom-2 fade-in">
                         {n.text}
                     </div>
                 ))}
            </div>
        </div>
    );
};

export const QuizCard: React.FC<QuizCardProps> = ({ 
    question, 
    streak, 
    masteryPercentage, 
    answeredCount, 
    totalCount, 
    mistakeCount, 
    isPinned,
    onAnswer, 
    onNext, 
    onRetry, 
    onTogglePin, 
    isMistakeMode 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<any[] | boolean | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [flashType, setFlashType] = useState<'none' | 'green' | 'red'>('none');
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [essayRevealed, setEssayRevealed] = useState(false);
  
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setSelectedOptions(question.type === QuestionType.CHOICE ? [] : null);
    setHasAnswered(false);
    setShowMnemonic(false);
    setIsShaking(false);
    setShowConfetti(false);
    setFlashType('none');
    setIsCorrectAnswer(false);
    setIsMinimized(false);
    setEssayRevealed(false);
  }, [question]);

  const setsAreEqual = (a: any[], b: any[]) => {
      if (!a || !b) return false;
      if (a.length !== b.length) return false;
      const sortedA = [...a].sort();
      const sortedB = [...b].sort();
      return sortedA.every((val, index) => val === sortedB[index]);
  };

  const handleToggleOption = (letterIndex: number) => {
      if (hasAnswered) return;
      const letter = String.fromCharCode(65 + letterIndex);
      const current = (selectedOptions as string[]) || [];
      if (current.includes(letter)) {
          setSelectedOptions(current.filter(o => o !== letter));
      } else {
          setSelectedOptions([...current, letter]);
      }
  };

  const submitChoiceAnswer = () => {
      const correct = question.correctAnswer as string[];
      const selected = (selectedOptions as string[]) || [];
      const isCorrect = setsAreEqual(selected, correct);
      processSubmission(isCorrect);
  };

  const handleJudgeSelect = (val: boolean) => {
      if (hasAnswered) return;
      setSelectedOptions(val);
      const isCorrect = val === question.correctAnswer;
      processSubmission(isCorrect);
  };

  const handleEssaySelfGrade = (grade: 'mastered' | 'review') => {
      const isCorrect = grade === 'mastered';
      processSubmission(isCorrect);
  };

  const processSubmission = (isCorrect: boolean) => {
      setHasAnswered(true);
      setIsCorrectAnswer(isCorrect);
      onAnswer(isCorrect);

      if (isCorrect) {
        setShowConfetti(true);
        setFlashType('green');
      } else {
        setIsShaking(true);
        setFlashType('red');
        setTimeout(() => setIsShaking(false), 400); 
        setShowMnemonic(true);
      }
  };

  const getOptionStyle = (option: string | boolean, index?: number) => {
    const base = "transition-all duration-300 border-2 font-medium relative overflow-hidden";
    
    if (question.type === QuestionType.CHOICE && typeof index === 'number') {
        const letter = String.fromCharCode(65 + index);
        const currentSelected = (selectedOptions as string[]) || [];
        const selected = currentSelected.includes(letter);
        const correctAnswers = (question.correctAnswer as string[]) || [];
        const isCorrectOption = correctAnswers.includes(letter);

        if (!hasAnswered) {
            if (selected) return `${base} bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/40 dark:border-blue-400 dark:text-blue-300`;
            return `${base} bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-300`;
        }
        
        if (isCorrectOption) {
            return `${base} bg-white dark:bg-slate-900 border-green-500 text-green-600 dark:text-green-400 border-2 shadow-lg scale-[1.02] z-10`;
        } else {
            if (selected) {
                return `${base} bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 line-through opacity-80`;
            }
            return `${base} bg-slate-50 dark:bg-slate-950 border-transparent text-slate-300 dark:text-slate-800 opacity-40 grayscale`;
        }
    }
    
    const selectedJudge = selectedOptions === option;
    if (!hasAnswered) return `${base} bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-400`;
    
    if (option === question.correctAnswer) return `${base} bg-white dark:bg-slate-900 border-green-500 text-green-600 dark:text-green-400 border-2 shadow-lg scale-[1.02] z-10`;
    
    if (selectedJudge && option !== question.correctAnswer) {
        return `${base} bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 line-through opacity-80`;
    }
    return `${base} bg-slate-50 dark:bg-slate-950 border-transparent text-slate-300 dark:text-slate-800 opacity-40 grayscale`;
  };

  const getCorrectAnswerText = () => {
      if (question.type === QuestionType.JUDGE) {
          return question.correctAnswer ? '正确 (√)' : '错误 (×)';
      }
      const answer = question.correctAnswer;
      if (typeof answer === 'string') return [answer];
      if (!Array.isArray(answer)) return [];
      
      const correctLetters = answer as string[];
      if (question.options) {
          return correctLetters.map(letter => {
              const idx = letter.charCodeAt(0) - 65;
              const text = question.options![idx];
              return `${letter}. ${text}`;
          });
      }
      return [correctLetters.join('、')];
  };

  const Confetti = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {[...Array(15)].map((_, i) => (
        <div key={i} className="confetti" style={{ 
          left: `${Math.random() * 100}%`, 
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 4)],
          animationDelay: `${Math.random() * 0.2}s`
        }} />
      ))}
    </div>
  );

  const showRetry = isMistakeMode && mistakeCount <= 1 && !isCorrectAnswer && hasAnswered;

  return (
    <div className="flex flex-col h-full relative z-0">
      {flashType === 'green' && <div className="absolute inset-0 z-10 animate-flash-green pointer-events-none rounded-3xl" />}
      {flashType === 'red' && <div className="absolute inset-0 z-10 animate-flash-red pointer-events-none rounded-3xl" />}
      {showConfetti && <Confetti />}

      <div className="flex items-center justify-between gap-4 mb-4 px-1">
          <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{answeredCount} / {totalCount}</span>
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg ${mistakeCount > 0 ? 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>错题 {mistakeCount}</span>
              </div>
          </div>
          <div className={`flex items-center gap-1.5 font-bold transition-transform duration-300 ${streak > 0 ? 'scale-110' : ''}`}>
             <div className={`p-1 rounded-full ${streak > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
                 <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'animate-pulse' : ''}`} fill={streak > 0 ? "currentColor" : "none"} />
             </div>
             <span className={`text-sm ${streak > 0 ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`}>{streak}</span>
          </div>
      </div>

      <div className="mb-6 px-1">
          <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${masteryPercentage}%` }} />
            </div>
      </div>

      <div className={`flex-shrink-0 mb-6 transition-all duration-300 ${isShaking ? 'animate-shake' : ''}`}>
        <div className="flex items-center justify-between mb-3">
             <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${question.type === QuestionType.JUDGE ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : question.type === QuestionType.ESSAY ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'}`}>
                    {question.type === QuestionType.JUDGE ? '判断题' : question.type === QuestionType.ESSAY ? '简答/论述题' : '单选题'}
                </span>
             </div>
        </div>
        <h2 className="text-xl font-bold leading-relaxed text-slate-800 dark:text-slate-100">
          {question.content}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-48 space-y-3 px-1 scroll-smooth" style={{ perspective: '1000px' }}>
        {question.type === QuestionType.ESSAY ? (
            <div className="space-y-6">
                 {!essayRevealed ? (
                     <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
                         <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center animate-bounce shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => setEssayRevealed(true)}>
                             <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                             <MousePointer2 className="w-12 h-12 text-indigo-500 relative z-10" />
                         </div>
                         <div className="space-y-2">
                             <p className="text-slate-500 dark:text-slate-400 font-bold">准备好开始记忆了吗？</p>
                             <p className="text-slate-400 dark:text-slate-500 text-xs">点击下方按钮启动神经连结</p>
                         </div>
                         <button 
                            onClick={() => setEssayRevealed(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 transition-all flex items-center gap-2 mt-4"
                         >
                            <Zap className="w-5 h-5" /> 启动记忆引擎
                         </button>
                     </div>
                 ) : (
                     <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                         {/* Gamified Memory Engine */}
                         <div className="w-full">
                             <h3 className="text-xs font-bold text-indigo-500 dark:text-cyan-500 uppercase tracking-wider flex items-center gap-1.5 mb-3 px-1">
                                <Trophy className="w-4 h-4 animate-bounce" /> 神经连结协议 (Neural Link Protocol)
                            </h3>
                             <GamifiedMemoryEngine 
                                centerText={question.content}
                                points={question.keyPoints || []}
                                onComplete={() => {}}
                             />
                             <div className="text-center text-[10px] text-slate-400 mt-2">
                                 点击浮动的关键词来收集它们！
                             </div>
                         </div>
                         
                         {/* Full Reference Answer */}
                         {!hasAnswered && (
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/30 text-sm text-indigo-900 dark:text-indigo-200 mt-4 leading-loose shadow-inner">
                                <span className="font-bold block mb-3 text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-b border-indigo-200 dark:border-indigo-800 pb-2">
                                    <BookOpen className="w-4 h-4" /> 完整参考答案
                                </span>
                                <div className="whitespace-pre-wrap font-medium opacity-90 text-justify">
                                    {String(question.correctAnswer)}
                                </div>
                            </div>
                         )}

                         {/* Self Grading Buttons */}
                         {!hasAnswered && (
                             <div className="grid grid-cols-2 gap-4 mt-8 pb-10">
                                 <button 
                                    onClick={() => handleEssaySelfGrade('review')}
                                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 font-bold flex flex-col items-center gap-2 shadow-sm hover:border-orange-300 transition-all active:scale-95"
                                 >
                                     <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-1">
                                        <RotateCcw className="w-6 h-6" />
                                     </div>
                                     <span>模糊 / 没记住</span>
                                 </button>
                                 <button 
                                    onClick={() => handleEssaySelfGrade('mastered')}
                                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-green-100 dark:border-green-900/50 text-green-600 dark:text-green-400 font-bold flex flex-col items-center gap-2 shadow-sm hover:border-green-300 transition-all active:scale-95"
                                 >
                                     <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-1">
                                         <CheckCircle2 className="w-6 h-6" />
                                     </div>
                                     <span>完全掌握</span>
                                 </button>
                             </div>
                         )}
                     </div>
                 )}
            </div>
        ) : question.type === QuestionType.JUDGE ? (
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[true, false].map((opt, idx) => (
              <button key={idx} onClick={() => handleJudgeSelect(opt)} disabled={hasAnswered} className={`p-6 rounded-xl flex flex-col items-center justify-center gap-2 ${getOptionStyle(opt)}`}>
                {hasAnswered && opt === question.correctAnswer ? <CheckCircle2 className="w-8 h-8 mb-1" /> : hasAnswered && (selectedOptions === opt) ? <XCircle className="w-8 h-8 mb-1" /> : null}
                <span className="text-lg font-bold">{opt ? '正确' : '错误'}</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            {question.options?.map((opt, idx) => {
                const letter = String.fromCharCode(65 + idx);
                const isSelected = ((selectedOptions as string[]) || []).includes(letter);
                const correctAnswers = (question.correctAnswer as string[]) || [];
                const isCorrectOption = correctAnswers.includes(letter);
                
                return (
                <button key={idx} onClick={() => handleToggleOption(idx)} disabled={hasAnswered} className={`w-full p-4 rounded-xl text-left flex items-start gap-3 group ${getOptionStyle(opt, idx)}`}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 mt-0.5 border transition-colors ${hasAnswered ? (isCorrectOption ? 'border-green-500 text-green-600' : 'border-slate-300 text-slate-300') : (isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400 group-hover:border-blue-400')}`}>
                    {hasAnswered && isCorrectOption ? <CheckCircle2 className="w-6 h-6" /> : (isSelected && !hasAnswered ? <CheckSquare className="w-4 h-4"/> : letter)}
                </div>
                <span className="flex-1 leading-relaxed">{opt}</span>
                </button>
            )})}
            {!hasAnswered && (
                <button onClick={submitChoiceAnswer} disabled={!selectedOptions || (selectedOptions as string[]).length === 0} className="w-full mt-6 bg-slate-800 dark:bg-blue-600 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                    确认提交 <ArrowRight className="w-4 h-4" />
                </button>
            )}
          </>
        )}
      </div>

      {hasAnswered && isMinimized && (
          <div 
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto px-4 z-30 animate-in slide-in-from-bottom-10"
          >
              <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-center gap-4 shadow-xl cursor-pointer hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2">
                      <ChevronDown className="w-5 h-5 animate-bounce rotate-180" />
                      <span className="font-bold text-sm">展开解析 & 答案</span>
                  </div>
                  <div className={`text-xs font-bold px-2.5 py-1 rounded-md ${isCorrectAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {isCorrectAnswer ? '掌握' : '需复习'}
                  </div>
              </div>
          </div>
      )}

      {hasAnswered && !isMinimized && (
        <div className="fixed bottom-[72px] left-0 right-0 p-4 max-w-md mx-auto z-30 animate-in slide-in-from-bottom-20 duration-300">
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-5 max-h-[70vh] overflow-y-auto relative">
               
               <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                   <div className={`flex items-center gap-2 font-black text-xl ${isCorrectAnswer ? 'text-green-500' : 'text-slate-500'}`}>
                        {isCorrectAnswer ? <><CheckCircle2 className="w-7 h-7" /><span>回答正确!</span></> : <><AlertOctagon className="w-7 h-7 text-slate-500" /><span>回答错误</span></>}
                   </div>
                   <div className="flex gap-2">
                        {isMistakeMode && (
                                <button onClick={onTogglePin} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${isPinned ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {isPinned ? <Pin className="w-3.5 h-3.5 fill-current" /> : <PinOff className="w-3.5 h-3.5" />}
                                    {isPinned ? '已保留' : '不保留'}
                                </button>
                        )}
                        <button onClick={() => setIsMinimized(true)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 transition-colors">
                            <ChevronDown className="w-5 h-5" />
                        </button>
                   </div>
               </div>

               <div className="mb-5 p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30">
                   <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">完整参考答案</span>
                   </div>
                   <div className="space-y-1">
                        {question.type === QuestionType.JUDGE ? (
                            <div className="text-xl font-black text-green-700 dark:text-green-300">
                                {question.correctAnswer ? '正确 (√)' : '错误 (×)'}
                            </div>
                        ) : question.type === QuestionType.ESSAY ? (
                            <div className="text-sm font-medium text-green-900 dark:text-green-100 leading-relaxed whitespace-pre-wrap">
                                {question.correctAnswer as string}
                            </div>
                        ) : (
                            (getCorrectAnswerText() as string[]).map((ans, i) => (
                                <div key={i} className="text-sm font-bold text-green-700 dark:text-green-300 leading-snug">
                                    {ans}
                                </div>
                            ))
                        )}
                   </div>
               </div>

               {question.analysis && (
                   <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-3 flex gap-3 border border-blue-100 dark:border-blue-800/30">
                       <Search className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                       <div>
                           <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">深度辨析 Analysis</div>
                           <div className="text-sm font-medium text-blue-900 dark:text-blue-100 leading-relaxed">{question.analysis}</div>
                       </div>
                   </div>
               )}

               {question.mnemonic && (
                   <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-5 flex gap-3 border border-amber-100 dark:border-amber-800/30">
                       <BrainCircuit className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                       <div>
                           <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">巧记 Mnemonic</div>
                           <div className="text-sm font-bold text-amber-900 dark:text-amber-100">{question.mnemonic}</div>
                       </div>
                   </div>
               )}

               <div className="flex gap-3">
                    {showRetry ? (
                        <button onClick={onRetry} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2">
                            <RotateCcw className="w-5 h-5" /> <span>重试 (最后一道)</span>
                        </button>
                    ) : (
                        <button onClick={onNext} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2">
                            <span>下一题</span> <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
               </div>
           </div>
        </div>
      )}
    </div>
  );
};