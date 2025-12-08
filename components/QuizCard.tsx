import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Question, QuestionType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit, Flame, AlertOctagon, RotateCcw, BookOpen, AlertTriangle, Pin, PinOff, CheckSquare, Search, ChevronDown, MousePointer2, Scan, Trophy, Zap, Skull, ShieldCheck } from 'lucide-react';

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
  index: number; // The correct order index
  x: number;
  y: number;
  vx: number;
  vy: number;
  status: 'active' | 'captured' | 'wrong';
  color: string;
  rotation: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

// --- Neural Reconstruction Engine (V2) ---
const GamifiedMemoryEngine = ({ centerText, points, onComplete }: { centerText: string, points: string[], onComplete: () => void }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<GameNode[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [gameStatus, setGameStatus] = useState<'intro' | 'playing' | 'victory' | 'failed'>('intro');
    const [nextIndex, setNextIndex] = useState(0); // Which index we are looking for (0, 1, 2...)
    const [combo, setCombo] = useState(0);
    const [systemStability, setSystemStability] = useState(100);
    const [glitchActive, setGlitchActive] = useState(false);
    
    const requestRef = useRef<number>(0);
    const particleIdCounter = useRef(0);

    // Neon Cyberpunk Palette
    const colors = ['#00f3ff', '#bc13fe', '#ff003c', '#e2ff00', '#00ff9f'];

    // Initialize Game
    useEffect(() => {
        if (points.length === 0) return;
        
        // Randomize initial positions but keep index for logic
        const initialNodes: GameNode[] = points.map((text, i) => ({
            id: `node-${i}`,
            text,
            index: i,
            x: Math.random() * 60 + 20, // 20-80%
            y: Math.random() * 60 + 20,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            status: 'active',
            color: colors[i % colors.length],
            rotation: Math.random() * 10 - 5
        }));
        setNodes(initialNodes);
        
        const timer = setTimeout(() => setGameStatus('playing'), 2000);
        return () => clearTimeout(timer);
    }, [points]);

    // Spawn Particles Explosion
    const spawnParticles = (x: number, y: number, color: string, amount: number = 20) => {
        const newParticles: Particle[] = [];
        for (let i = 0; i < amount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            newParticles.push({
                id: particleIdCounter.current++,
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color,
                size: Math.random() * 4 + 1
            });
        }
        setParticles(prev => [...prev, ...newParticles]);
    };

    // Physics Loop
    const updatePhysics = () => {
        // 1. Update Nodes
        setNodes(prevNodes => prevNodes.map(node => {
            if (node.status === 'captured') return node;

            let { x, y, vx, vy } = node;

            // Physics
            x += vx;
            y += vy;
            // Wall bounce
            if (x <= 5 || x >= 95) vx *= -1;
            if (y <= 10 || y >= 85) vy *= -1; // Keep some space at bottom for HUD

            return { ...node, x, y, vx, vy };
        }));

        // 2. Update Particles
        setParticles(prevParts => prevParts
            .map(p => ({
                ...p,
                x: p.x + p.vx * 0.1, // Scale speed for DOM pixels roughly
                y: p.y + p.vy * 0.1,
                life: p.life - 0.02
            }))
            .filter(p => p.life > 0)
        );

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

    // Check Victory
    useEffect(() => {
        if (nodes.length > 0 && nodes.every(n => n.status === 'captured') && gameStatus !== 'victory') {
            setGameStatus('victory');
            setTimeout(onComplete, 1500);
        }
    }, [nodes, gameStatus]);

    const handleNodeClick = (e: React.MouseEvent, node: GameNode) => {
        if (gameStatus !== 'playing') return;
        
        // Rect for particle spawn position relative to container
        const rect = containerRef.current?.getBoundingClientRect();
        const clickX = rect ? ((e.clientX - rect.left) / rect.width) * 100 : 50;
        const clickY = rect ? ((e.clientY - rect.top) / rect.height) * 100 : 50;

        if (node.index === nextIndex) {
            // --- CORRECT SEQUENCE ---
            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'captured' } : n));
            setNextIndex(prev => prev + 1);
            setCombo(prev => prev + 1);
            
            // Effect
            spawnParticles(clickX, clickY, '#00f3ff', 30); // Blue explosion
            
        } else {
            // --- WRONG SEQUENCE ---
            setCombo(0);
            setSystemStability(prev => Math.max(0, prev - 15));
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 500);

            // Effect
            spawnParticles(clickX, clickY, '#ff003c', 10); // Red explosion
            
            // Punishment: Node turns red briefly
            setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'wrong' } : n));
            setTimeout(() => {
                setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'active' } : n));
            }, 600);
        }
    };

    return (
        <div ref={containerRef} className={`relative w-full h-[450px] bg-slate-950 rounded-xl overflow-hidden border-2 shadow-2xl group select-none ${glitchActive ? 'border-red-500 animate-shake' : 'border-slate-800'}`}>
            
            {/* 0. Glitch Overlay */}
            {glitchActive && (
                <div className="absolute inset-0 bg-red-500/20 z-50 pointer-events-none mix-blend-overlay animate-pulse" />
            )}

            {/* 1. Background Grid (Moving) */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [transform:perspective(500px)_rotateX(60deg)_translateY(-100px)_scale(2)] opacity-60 pointer-events-none" />
            
            {/* 2. HUD Interface */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
                <div className="font-mono text-xs">
                    <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <Scan className="w-4 h-4 animate-spin-slow" />
                        <span>NEURAL_LINK: {gameStatus === 'playing' ? 'SYNCING...' : gameStatus.toUpperCase()}</span>
                    </div>
                    <div className="text-slate-500 flex gap-1 items-center">
                        SEQUENCE: 
                        <span className="text-white font-bold">{nextIndex}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-600">{nodes.length}</span>
                    </div>
                </div>
                
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                         <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                             <div 
                                className={`h-full transition-all duration-300 ${systemStability > 50 ? 'bg-cyan-400' : 'bg-red-500'}`} 
                                style={{ width: `${systemStability}%` }} 
                             />
                         </div>
                         <span className={`text-[10px] font-mono font-bold ${systemStability > 50 ? 'text-cyan-400' : 'text-red-500'}`}>{systemStability}%</span>
                    </div>
                    {combo > 1 && (
                        <div className="text-xl font-black italic text-yellow-400 mt-1 animate-bounce drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]">
                            {combo}x CHAIN
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Central Core (Hint / Decor) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-20 pointer-events-none">
                <div className={`w-64 h-64 border border-cyan-500/30 rounded-full flex items-center justify-center ${gameStatus === 'playing' ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
                    <div className="w-48 h-48 border border-purple-500/30 rounded-full" />
                </div>
            </div>

            {/* 4. Game Nodes (Shards) */}
            {gameStatus !== 'intro' && nodes.map((node) => {
                if (node.status === 'captured') return null;
                
                const isTarget = node.index === nextIndex;
                const isWrong = node.status === 'wrong';

                return (
                    <button
                        key={node.id}
                        onMouseDown={(e) => handleNodeClick(e, node)}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-10 focus:outline-none touch-manipulation"
                        style={{
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                        }}
                    >
                        {/* Hexagon Shard */}
                        <div 
                            className={`
                                relative px-5 py-3 clip-hex transition-all duration-200
                                ${isWrong ? 'bg-red-600 animate-shake scale-110' : 'bg-slate-900/90 hover:bg-slate-800'}
                                ${isTarget && !isWrong ? 'shadow-[0_0_15px_rgba(34,211,238,0.4)] border-cyan-400/50' : ''}
                            `}
                            style={{
                                transform: `rotate(${node.rotation}deg)`,
                                borderLeft: `3px solid ${isWrong ? '#ff003c' : node.color}` 
                            }}
                        >
                            {/* Scanning Line */}
                            {!isWrong && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />}
                            
                            <span className={`relative z-10 text-xs font-bold tracking-wide pointer-events-none ${isWrong ? 'text-white' : 'text-slate-200'}`} style={{ textShadow: '0 1px 2px black' }}>
                                {node.text}
                            </span>
                        </div>
                        
                        {/* Target Hint (Optional, subtle pulse if it's the next one) */}
                        {isTarget && !isWrong && (
                             <div className="absolute inset-0 -m-4 border border-cyan-400/20 rounded-full animate-ping pointer-events-none" />
                        )}
                    </button>
                );
            })}

            {/* 5. Particle Layer */}
            {particles.map(p => (
                <div 
                    key={p.id}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        opacity: p.life,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`
                    }}
                />
            ))}

            {/* 6. Bottom Logic Timeline */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-slate-900/95 border-t border-slate-800 z-30 flex items-center px-4 gap-2 overflow-x-auto">
                 <div className="text-[10px] font-mono text-slate-500 shrink-0 mr-2 flex flex-col items-center">
                    <ShieldCheck className="w-4 h-4 text-slate-600" />
                    <span>LOGIC</span>
                 </div>
                 {nodes.filter(n => n.status === 'captured').sort((a,b) => a.index - b.index).map((n, i) => (
                     <React.Fragment key={n.id}>
                         <div className="bg-cyan-900/30 border border-cyan-500/30 text-cyan-100 px-3 py-1.5 rounded text-[10px] font-mono whitespace-nowrap animate-pop clip-hex">
                             {n.text}
                         </div>
                         <ArrowRight className="w-3 h-3 text-slate-700 shrink-0" />
                     </React.Fragment>
                 ))}
                 <div className="w-4 h-4 border border-slate-700 border-dashed rounded-full animate-pulse shrink-0" />
            </div>

            {/* 7. Intro Overlay */}
            {gameStatus === 'intro' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-50 backdrop-blur-sm">
                    <BrainCircuit className="w-16 h-16 text-cyan-500 mb-4 animate-pulse" />
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-2 tracking-tighter">
                        NEURAL RECONSTRUCTION
                    </div>
                    <div className="bg-red-500/10 border border-red-500/50 px-4 py-2 rounded text-red-400 text-xs font-mono mb-4 animate-bounce">
                        ⚠ WARNING: SEQUENCE REQUIRED
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                        Tap keywords in the CORRECT LOGICAL ORDER.
                    </div>
                </div>
            )}
            
            {/* 8. Victory Overlay */}
            {gameStatus === 'victory' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none bg-cyan-900/20 backdrop-blur-[2px]">
                    <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-in zoom-in duration-300">
                        SYNC
                    </div>
                    <div className="text-cyan-200 font-mono tracking-[0.5em] text-sm mt-2 animate-in slide-in-from-bottom-4 fade-in duration-700">
                        COMPLETE
                    </div>
                </div>
            )}
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
                             <p className="text-slate-500 dark:text-slate-400 font-bold">准备好重建记忆了吗？</p>
                             <p className="text-slate-400 dark:text-slate-500 text-xs">点击启动神经重构协议</p>
                         </div>
                         <button 
                            onClick={() => setEssayRevealed(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 transition-all flex items-center gap-2 mt-4"
                         >
                            <Zap className="w-5 h-5" /> 启动重构引擎
                         </button>
                     </div>
                 ) : (
                     <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">
                         {/* Gamified Memory Engine */}
                         <div className="w-full">
                             <h3 className="text-xs font-bold text-indigo-500 dark:text-cyan-500 uppercase tracking-wider flex items-center gap-1.5 mb-3 px-1">
                                <Trophy className="w-4 h-4 animate-bounce" /> 神经连结协议 V2.0 (Neural Link)
                            </h3>
                             <GamifiedMemoryEngine 
                                centerText={question.content}
                                points={question.keyPoints || []}
                                onComplete={() => {}}
                             />
                             <div className="text-center text-[10px] text-slate-400 mt-2 flex items-center justify-center gap-1">
                                 <Skull className="w-3 h-3 text-red-500" />
                                 <span>警告：必须按逻辑顺序点击关键词，错误将导致系统不稳定。</span>
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