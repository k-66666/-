
import React, { useRef, useEffect, useState } from 'react';
import { X, Maximize2, Minimize2, RefreshCw, Eye, EyeOff, Play, Zap, HelpCircle } from 'lucide-react';
import { playTone, playWrong } from '../utils/sound';

interface VisualMnemonicProps {
  content: string;
  onClose?: () => void;
}

interface Node {
  id: number;
  label: string; // The short label like "1" or "A"
  text: string;  // The full content
  angle: number; // Polar coordinate angle
  radius: number; // Polar coordinate radius
  y: number; // Height in 3D
  state: 'locked' | 'active' | 'done';
  color: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  color: string;
  size: number;
  type: 'spark' | 'text_frag' | 'shockwave';
}

// Color Palette - Neon Cyberpunk
const COLORS = ['#00f3ff', '#00ff9f', '#facc15', '#ff0055', '#d946ef'];
// Pentatonic Scale frequencies for Combo Sound
const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];

export const VisualMnemonic: React.FC<VisualMnemonicProps> = ({ content, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false); 
  const [activeText, setActiveText] = useState(""); 
  const [showInstructions, setShowInstructions] = useState(false);
  
  // Refs for loop
  const nodesRef = useRef<Node[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cameraRef = useRef({ 
      rotY: 0, 
      targetRotY: 0, 
      z: -800, 
      shake: 0 
  });
  const requestRef = useRef<number>(0);
  const touchRef = useRef({ startX: 0, lastX: 0, isDragging: false, velocity: 0 });
  const activeIndexRef = useRef(0);

  // --- 1. Initialization ---
  useEffect(() => {
    initGame();
    return () => cancelAnimationFrame(requestRef.current);
  }, [content]);

  // Handle Fullscreen Change events (ESC key etc)
  useEffect(() => {
      const handleFsChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
      if (!containerRef.current) return;

      if (!document.fullscreenElement) {
          try {
              await containerRef.current.requestFullscreen();
          } catch (err) {
              console.error("Fullscreen error:", err);
          }
      } else {
          if (document.exitFullscreen) {
              document.exitFullscreen();
          }
      }
  };

  const initGame = () => {
    // Parse content
    const text = content.replace(/\\n/g, '\n').trim();
    const splitRegex = /(?:^|[\n。；;])(?=(?:\d+[\.、\s])|(?:\(\d+\))|[①-⑩])/g;
    let rawSegments = text.split(splitRegex).map(s => s.trim()).filter(s => s.length > 0);

    if (rawSegments.length <= 1) {
        rawSegments = text.split(/([。；;！!\n]+)/)
            .reduce((acc, curr, idx) => {
                if (idx % 2 === 1 && acc.length > 0) acc[acc.length - 1] += curr;
                else if (curr.trim().length > 0) acc.push(curr.trim());
                return acc;
            }, [] as string[])
            .filter(s => s.length > 2);
    }
    if (rawSegments.length === 0) rawSegments = [text];

    // Create Nodes in a Spiral Helix
    const newNodes: Node[] = rawSegments.map((seg, i) => {
      const labelMatch = seg.match(/^(\d+|[①-⑩])/);
      const label = labelMatch ? labelMatch[1] : (i + 1).toString();
      
      const stepAngle = 0.8; 
      const angle = i * stepAngle;
      const radius = 180;
      const y = (i * 60) - (rawSegments.length * 30); 

      return {
        id: i,
        label,
        text: seg.replace(/^(\d+[\.、\)]|[①-⑩])\s*/, ''),
        angle,
        radius,
        y,
        state: i === 0 ? 'active' : 'locked',
        color: COLORS[i % COLORS.length]
      };
    });

    nodesRef.current = newNodes;
    activeIndexRef.current = 0;
    particlesRef.current = [];
    // Reset camera target
    cameraRef.current = { rotY: 0, targetRotY: 0, z: -800, shake: 0 };
    setCombo(0);
    setScore(0);
    setGameWon(false);
    setActiveText(""); 
  };

  // --- 2. Game Logic ---

  const playComboSound = (currentCombo: number) => {
      const baseIndex = currentCombo % SCALE.length;
      const octaveBoost = Math.floor(currentCombo / SCALE.length) * 2; 
      const freq = SCALE[baseIndex] * (1 + (octaveBoost * 0.5));
      
      playTone(freq, 'triangle', 0.2);
  };

  const spawnExplosion = (x: number, y: number, z: number, color: string) => {
      // Sparks
      for(let i=0; i<25; i++) {
          const speed = Math.random() * 10 + 5;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          particlesRef.current.push({
              x, y, z,
              vx: Math.sin(phi) * Math.cos(theta) * speed,
              vy: Math.sin(phi) * Math.sin(theta) * speed,
              vz: Math.cos(phi) * speed,
              life: 1.0,
              color,
              size: Math.random() * 5 + 2,
              type: 'spark'
          });
      }
      // Shockwave
      particlesRef.current.push({
          x, y, z, vx:0, vy:0, vz:0, life: 1, color, size: 10, type: 'shockwave'
      });
  };

  const handleNodeClick = (nodeIndex: number) => {
      const node = nodesRef.current[nodeIndex];
      const activeIdx = activeIndexRef.current;

      if (nodeIndex === activeIdx) {
          // --- SUCCESS ---
          
          if (navigator.vibrate) navigator.vibrate(50);
          
          node.state = 'done';
          const nextIdx = activeIdx + 1;
          
          // Music
          playComboSound(combo);

          // Update Next Node
          if (nextIdx < nodesRef.current.length) {
              nodesRef.current[nextIdx].state = 'active';
              activeIndexRef.current = nextIdx;
          } else {
              setGameWon(true);
              activeIndexRef.current = -1; // Done
              playTone(880, 'sine', 0.5); // Victory tone
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
          }

          // Visuals
          spawnExplosion(
              Math.sin(node.angle) * node.radius, 
              node.y, 
              Math.cos(node.angle) * node.radius, 
              node.color
          );
          
          cameraRef.current.shake = 10;
          
          // UI Updates
          setCombo(c => c + 1);
          setScore(s => s + 100 + (combo * 20));
          setActiveText(node.text); // SHOW TEXT ONLY ON SUCCESS

      } else if (node.state === 'locked') {
          // --- FAILURE ---
          playWrong();
          if (navigator.vibrate) navigator.vibrate([50, 50]);
          cameraRef.current.shake = 20;
          setCombo(0);
      }
  };

  // --- Input Handling (Touch/Mouse) for Smooth Rotate ---
  const handleStart = (clientX: number) => {
      touchRef.current.startX = clientX;
      touchRef.current.lastX = clientX;
      touchRef.current.isDragging = true;
      touchRef.current.velocity = 0;
  };

  const handleMove = (clientX: number) => {
      if (!touchRef.current.isDragging) return;
      const deltaX = clientX - touchRef.current.lastX;
      touchRef.current.lastX = clientX;
      
      // Rotate sensitivity
      const sensitivity = 0.005;
      cameraRef.current.targetRotY -= deltaX * sensitivity;
      touchRef.current.velocity = deltaX; // Track for inertia
  };

  const handleEnd = () => {
      touchRef.current.isDragging = false;
  };

  // --- Raycasting for Clicks ---
  const checkIntersection = (cx: number, cy: number, w: number, h: number, fov: number) => {
      let hitId = -1;
      let minDepth = -Infinity;

      nodesRef.current.forEach(n => {
          const relAngle = n.angle + cameraRef.current.rotY;
          const x3d = Math.sin(relAngle) * n.radius;
          const z3d = Math.cos(relAngle) * n.radius;
          const y3d = n.y;
          
          const zFinal = z3d - cameraRef.current.z;
          
          if (zFinal > 10) {
              const scale = fov / zFinal;
              const x2d = w/2 + x3d * scale;
              const y2d = h/2 + y3d * scale;
              const hitSize = 60 * scale; 
              
              const dist = Math.hypot(cx - x2d, cy - y2d);
              if (dist < hitSize) {
                  if (zFinal > minDepth) { 
                      hitId = n.id;
                      minDepth = zFinal; 
                  }
              }
          }
      });
      return hitId;
  };

  // --- 3. Render Loop ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const render = () => {
      frame++;
      
      // Auto-resize
      if (containerRef.current) {
          const cw = containerRef.current.clientWidth;
          const ch = containerRef.current.clientHeight;
          if (canvas.width !== cw || canvas.height !== ch) {
              canvas.width = cw;
              canvas.height = ch;
          }
      }

      const w = canvas.width;
      const h = canvas.height;
      const fov = 600; // Field of View

      // --- Physics & Camera ---
      
      // Inertia / Momentum
      if (!touchRef.current.isDragging) {
          // Apply friction to velocity
          touchRef.current.velocity *= 0.92;
          // Apply velocity to rotation
          cameraRef.current.targetRotY -= touchRef.current.velocity * 0.005;
          
          // Auto-Rotate to Active Node if idle
          const activeIdx = activeIndexRef.current;
          if (Math.abs(touchRef.current.velocity) < 0.1 && activeIdx !== -1 && activeIdx < nodesRef.current.length) {
              const targetNode = nodesRef.current[activeIdx];
              let desiredRot = -targetNode.angle;
              // Shortest path angle interpolation
              let diff = desiredRot - cameraRef.current.targetRotY;
              while (diff > Math.PI) diff -= Math.PI * 2;
              while (diff < -Math.PI) diff += Math.PI * 2;
              
              cameraRef.current.targetRotY += diff * 0.05; // Auto-center strength
          }
      }

      // Smooth Camera Rotation (Lerp)
      // Lerp currentRot -> targetRot
      const rotDiff = cameraRef.current.targetRotY - cameraRef.current.rotY;
      cameraRef.current.rotY += rotDiff * 0.1; // Smoothness factor (0.1 is smooth, 1 is instant)

      // Victory Spin
      if (gameWon) {
          cameraRef.current.targetRotY += 0.02;
      }

      // Camera Shake
      if (cameraRef.current.shake > 0) {
          cameraRef.current.shake *= 0.9;
      }
      const sx = (Math.random() - 0.5) * cameraRef.current.shake;
      const sy = (Math.random() - 0.5) * cameraRef.current.shake;

      // Clear Screen
      const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // --- Draw 3D Elements ---

      // Project Nodes
      const projectedNodes = nodesRef.current.map(n => {
          const relAngle = n.angle + cameraRef.current.rotY;
          const x3d = Math.sin(relAngle) * n.radius;
          const z3d = Math.cos(relAngle) * n.radius;
          
          // Apply perspective
          const zFinal = z3d - cameraRef.current.z; 
          
          if (zFinal <= 10) return { visible: false, z: zFinal, x:0, y:0, scale:0, node: n };

          const scale = fov / zFinal;
          return {
              visible: true,
              x: w/2 + x3d * scale + sx,
              y: h/2 + n.y * scale + sy,
              scale,
              z: zFinal,
              node: n
          };
      });

      projectedNodes.sort((a, b) => b.z - a.z);

      // Draw Connections
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for(let i=0; i<projectedNodes.length-1; i++) {
          const p1 = projectedNodes[i];
          const p2 = projectedNodes.find(p => p.node.id === p1.node.id + 1); 
          
          if (p1.visible && p2 && p2.visible && p1.node.state === 'done') {
              ctx.strokeStyle = p1.node.color;
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
          }
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw Particles
      for(let i=particlesRef.current.length-1; i>=0; i--) {
          const p = particlesRef.current[i];
          p.life -= 0.02;
          p.x += p.vx; p.y += p.vy; p.z += p.vz;
          
          if (p.life <= 0) {
              particlesRef.current.splice(i, 1);
              continue;
          }

          // Rotate Particle World Pos
          const px = p.x * Math.cos(cameraRef.current.rotY) - p.z * Math.sin(cameraRef.current.rotY);
          const pz = p.z * Math.cos(cameraRef.current.rotY) + p.x * Math.sin(cameraRef.current.rotY);
          
          const zFinal = pz - cameraRef.current.z;
          if (zFinal > 10) {
              const scale = fov / zFinal;
              const particleSx = w/2 + px * scale + sx;
              const particleSy = h/2 + p.y * scale + sy;
              
              if (p.type === 'shockwave') {
                  ctx.strokeStyle = p.color;
                  ctx.lineWidth = 2 * scale;
                  ctx.globalAlpha = p.life * 0.5;
                  ctx.beginPath();
                  ctx.arc(particleSx, particleSy, p.size * (1-p.life) * 10 * scale, 0, Math.PI*2);
                  ctx.stroke();
              } else {
                  ctx.fillStyle = p.color;
                  ctx.globalAlpha = p.life;
                  ctx.beginPath();
                  ctx.arc(particleSx, particleSy, p.size * scale, 0, Math.PI*2);
                  ctx.fill();
              }
          }
      }
      ctx.globalAlpha = 1;

      // Draw Nodes
      projectedNodes.forEach(p => {
          if (!p.visible) return;
          const { x, y, scale, node } = p;
          
          const isTarget = node.state === 'active';
          const size = (isTarget ? 40 : 25) * scale;
          
          // Glow Effect for Active/Done
          if (isTarget || node.state === 'done') {
              const glow = ctx.createRadialGradient(x, y, size*0.1, x, y, size * 2.5);
              glow.addColorStop(0, node.color);
              glow.addColorStop(1, 'transparent');
              ctx.fillStyle = glow;
              // Pulsing effect
              ctx.globalAlpha = 0.3 + (Math.sin(frame * 0.15) * 0.2);
              ctx.beginPath();
              ctx.arc(x, y, size * 2.5, 0, Math.PI*2);
              ctx.fill();
          }

          // Node Shape (Hexagon)
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
              const ang = (Math.PI / 3) * i + (isTarget ? frame * 0.05 : 0);
              const r = size * (node.state === 'locked' ? 0.7 : 1);
              ctx.lineTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r);
          }
          ctx.closePath();

          ctx.fillStyle = node.state === 'locked' ? '#0f172a' : '#fff';
          ctx.strokeStyle = node.color;
          ctx.lineWidth = 3 * scale;
          
          ctx.globalAlpha = node.state === 'locked' ? 0.5 : 1;
          ctx.fill();
          ctx.stroke();

          // Node Label (The Number)
          ctx.fillStyle = node.state === 'locked' ? node.color : '#0f172a';
          ctx.font = `bold ${Math.max(12, 18 * scale)}px 'Inter', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = 1;
          ctx.fillText(node.label, x, y);

          // CONTENT TEXT (HIDING LOGIC)
          // Logic: 
          // 1. If Done -> Always Show
          // 2. If Active -> Show ONLY if showHint is true. Else show ???
          // 3. If Locked -> Show nothing
          if (scale > 0.4) {
             const yOffset = y - size * 1.8;
             
             if (node.state === 'done') {
                 // Completed Text
                 ctx.fillStyle = '#fff';
                 ctx.font = `bold ${Math.max(12, 16 * scale)}px 'Noto Sans SC', sans-serif`;
                 ctx.shadowColor = 'black';
                 ctx.shadowBlur = 6;
                 ctx.fillText(node.text.substring(0, 12) + (node.text.length > 12 ? '...' : ''), x, yOffset);
                 ctx.shadowBlur = 0;
             } else if (node.state === 'active') {
                 // Active Text
                 if (showHint) {
                     ctx.fillStyle = '#fff';
                     ctx.font = `bold ${Math.max(12, 16 * scale)}px 'Noto Sans SC', sans-serif`;
                     ctx.fillText(node.text.substring(0, 10) + '...', x, yOffset);
                 } else {
                     // HIDDEN STATE (Default)
                     ctx.fillStyle = 'rgba(255,255,255,0.6)';
                     ctx.font = `italic ${Math.max(10, 14 * scale)}px sans-serif`;
                     ctx.fillText("???", x, yOffset);
                     
                     // "Tap to Reveal" indicator
                     if (frame % 60 < 30) {
                         ctx.fillStyle = node.color;
                         ctx.font = `bold ${Math.max(8, 10 * scale)}px sans-serif`;
                         ctx.fillText("点击回忆", x, y + size * 1.8);
                     }
                 }
             }
          }
      });

      requestRef.current = requestAnimationFrame(render);
    };

    render();
  }, [showHint]); // Re-bind effect if showHint changes to update render loop logic

  // --- Render UI ---
  const containerClass = isFullscreen 
    ? "fixed inset-0 z-50 bg-slate-950 flex flex-col" 
    : "relative w-full h-[450px] rounded-2xl overflow-hidden bg-slate-950 shadow-inner border border-slate-800 my-4 touch-none select-none";

  return (
    <div ref={containerRef} className={containerClass}>
        <canvas 
            ref={canvasRef}
            className="block w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={(e) => {
                if (gameWon) {
                    initGame(); // Click anywhere to replay if won
                    return;
                }
                const rect = canvasRef.current!.getBoundingClientRect();
                const hit = checkIntersection(e.clientX - rect.left, e.clientY - rect.top, canvasRef.current!.width, canvasRef.current!.height, 600);
                if (hit !== -1) handleNodeClick(hit);
                else handleStart(e.clientX);
            }}
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            
            onTouchStart={(e) => {
                if (gameWon) {
                    initGame(); // Tap anywhere to replay if won
                    return;
                }
                const touch = e.touches[0];
                handleStart(touch.clientX);
            }}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            onTouchEnd={(e) => {
                if (gameWon) return; // Handled by start
                const touch = e.changedTouches[0];
                const rect = canvasRef.current!.getBoundingClientRect();
                // Check if it was a tap (little movement)
                const dist = Math.abs(touch.clientX - touchRef.current.startX);
                if (dist < 10) {
                    const hit = checkIntersection(touch.clientX - rect.left, touch.clientY - rect.top, canvasRef.current!.width, canvasRef.current!.height, 600);
                    if (hit !== -1) handleNodeClick(hit);
                }
                handleEnd();
            }}
        />

        {/* HUD Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start pointer-events-none z-10">
            <div className="flex flex-col gap-2">
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg px-3 py-1 text-xs font-mono text-blue-400 font-bold shadow-lg">
                    SYNC: {Math.round((score / (nodesRef.current.length * 200 || 1)) * 100)}%
                </div>
            </div>

            <div className="flex gap-2 pointer-events-auto">
                <button 
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="p-3 rounded-xl bg-slate-800/80 text-blue-400 hover:text-white border border-slate-700 active:scale-95 transition-all"
                >
                    <HelpCircle className="w-5 h-5" />
                </button>
                <button 
                    onMouseDown={() => setShowHint(true)}
                    onMouseUp={() => setShowHint(false)}
                    onTouchStart={() => setShowHint(true)}
                    onTouchEnd={() => setShowHint(false)}
                    className="p-3 rounded-xl bg-slate-800/80 text-blue-400 border border-blue-500/30 active:scale-95 transition-all shadow-lg"
                    title="按住偷看"
                >
                    {showHint ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <button onClick={initGame} className="p-3 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all">
                    <RefreshCw className="w-5 h-5" />
                </button>
                <button onClick={toggleFullscreen} className="p-3 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all">
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>
                {isFullscreen && onClose && (
                    <button onClick={() => { 
                        if (document.fullscreenElement) document.exitFullscreen(); 
                        onClose(); 
                    }} className="p-3 rounded-xl bg-red-900/80 text-red-300 border border-red-800 active:scale-95">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>

        {/* Instructions Overlay */}
        {showInstructions && (
            <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowInstructions(false)}>
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        游戏说明
                    </h3>
                    <ul className="space-y-3 text-slate-300 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="bg-slate-800 text-blue-400 font-bold px-2 rounded">1</span>
                            <span><strong>点击</strong>发光的节点激活它。</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-slate-800 text-blue-400 font-bold px-2 rounded">2</span>
                            <span>在脑海中<strong>回忆</strong>该节点对应的关键词。</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-slate-800 text-blue-400 font-bold px-2 rounded">3</span>
                            <span>记不住？按住右上角的<strong>眼睛图标</strong>偷看。</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-slate-800 text-blue-400 font-bold px-2 rounded">4</span>
                            <span>点亮所有节点即完成<strong>记忆同步</strong>。</span>
                        </li>
                    </ul>
                    <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl mt-2">
                        开始记忆
                    </button>
                </div>
            </div>
        )}

        {/* Center Flash Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            {combo > 1 && (
                <div key={combo} className="text-3xl font-black italic text-yellow-400 tracking-tighter animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] stroke-black" style={{ textShadow: '2px 2px 0px black' }}>
                    {combo} COMBO!
                </div>
            )}
            
            {activeText && (
                <div key={activeText} className="mt-12 px-8 py-4 bg-black/80 backdrop-blur-xl border-y-2 border-blue-500 text-white font-bold text-xl md:text-3xl text-center max-w-[95%] shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-in zoom-in slide-in-from-bottom-5 duration-300">
                    {activeText}
                </div>
            )}

            {gameWon && (
                <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                    <div className="px-8 py-3 bg-green-500 text-black font-black text-2xl rounded-full animate-bounce shadow-[0_0_30px_#22c55e]">
                        记忆同步完成
                    </div>
                    <div className="px-4 py-2 bg-slate-900/80 rounded-full text-slate-300 text-sm font-bold border border-slate-700 animate-pulse">
                        点击任意处开启下一轮记忆
                    </div>
                </div>
            )}
        </div>

        {/* Bottom Instructions (Only visible when idle) */}
        {!gameWon && !activeText && !showInstructions && (
            <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-slate-700 text-xs text-slate-300 flex items-center gap-2 shadow-xl">
                    <Zap className="w-3 h-3 text-yellow-400 fill-current animate-pulse" />
                    <span>点击序号回忆关键词 · 按住右上角眼睛偷看</span>
                </div>
            </div>
        )}
    </div>
  );
};
