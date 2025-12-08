
import React, { useRef, useEffect, useState } from 'react';
import { X, Maximize2, Minimize2, RefreshCw, Trophy, Sparkles, Smartphone, List, Rocket } from 'lucide-react';

interface VisualMnemonicProps {
  content: string;
  onClose?: () => void;
}

interface Node {
  id: number;
  label: string; // The short label like "1" or "A"
  text: string;  // The full content
  x: number;
  y: number;
  z: number;
  unlocked: boolean;
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
  maxLife: number;
  color: string;
  size: number;
}

export const VisualMnemonic: React.FC<VisualMnemonicProps> = ({ content, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [viewMode, setViewMode] = useState<'default' | 'fullscreen' | 'landscape'>('default');
  const [showList, setShowList] = useState(false);
  const [activeNodeIdx, setActiveNodeIdx] = useState<number>(-1);
  const [camera, setCamera] = useState({ x: 0, y: 0, z: -450, rotX: 0.2, rotY: 0.5 });
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, lastX: 0, lastY: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number>(0);

  // Palette for different memory chunks
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  // 1. Improved Parsing Logic (Smart Split)
  useEffect(() => {
    let rawSegments: string[] = [];

    // Clean input
    const text = content.replace(/\\n/g, '\n').trim();

    // Regex Explanation:
    // Matches start of line or punctuation, followed by a lookahead for a numbering pattern
    // Patterns: "1.", "1、", "(1)", "①"
    const splitRegex = /(?:^|[\n。；;])(?=(?:\d+[\.、\s])|(?:\(\d+\))|[①-⑩])/g;
    
    // Split and filter empty strings
    const potentialSegments = text.split(splitRegex).map(s => s.trim()).filter(s => s.length > 0);

    if (potentialSegments.length > 1) {
        rawSegments = potentialSegments;
    } else {
        // Fallback: Split by major punctuation if no numbered list detected
        rawSegments = text.split(/([。；;！!\n]+)/)
            .reduce((acc, curr, idx) => {
                // Reattach punctuation to previous segment to keep sentences complete
                if (idx % 2 === 1 && acc.length > 0) {
                    acc[acc.length - 1] += curr;
                } else if (curr.trim().length > 0) {
                    acc.push(curr.trim());
                }
                return acc;
            }, [] as string[])
            .filter(s => s.length > 2); // Filter out tiny noise
    }

    if (rawSegments.length === 0) rawSegments = [text];

    // Generate Nodes from Segments
    const newNodes: Node[] = rawSegments.map((seg, i) => {
      // Extract a label if possible (e.g. "1." -> "1")
      const labelMatch = seg.match(/^(\d+|[①-⑩])/);
      const label = labelMatch ? labelMatch[1] : (i + 1).toString();
      
      // Helix / Spiral Layout Calculation
      const theta = i * 0.8 + Math.PI; // Spiral angle
      const radius = 120 + (i * 5); // Radius grows slightly
      const ySpacing = 60; 
      
      return {
        id: i,
        label,
        text: seg.replace(/^(\d+[\.、\)]|[①-⑩])\s*/, ''), // Remove the number from the display text for cleaner look
        x: Math.cos(theta) * radius,
        y: (i - (rawSegments.length - 1) / 2) * ySpacing,
        z: Math.sin(theta) * radius,
        unlocked: false,
        color: COLORS[i % COLORS.length]
      };
    });

    setNodes(newNodes);
    setActiveNodeIdx(-1);
    // Reset Camera slightly
    setCamera(prev => ({ ...prev, rotY: 0.5, rotX: 0.2 }));

  }, [content]);

  // 2. Input Handlers
  const handleStart = (clientX: number, clientY: number) => {
    mouseRef.current.isDown = true;
    mouseRef.current.lastX = clientX;
    mouseRef.current.lastY = clientY;
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!mouseRef.current.isDown) return;
    const dx = clientX - mouseRef.current.lastX;
    const dy = clientY - mouseRef.current.lastY;
    
    setCamera(prev => ({
      ...prev,
      rotY: prev.rotY + dx * 0.005,
      rotX: Math.max(-1.2, Math.min(1.2, prev.rotX + dy * 0.005))
    }));

    mouseRef.current.lastX = clientX;
    mouseRef.current.lastY = clientY;
  };

  const spawnParticles = (x: number, y: number, z: number, color: string, count: number = 30) => {
      for(let i=0; i<count; i++) {
          const speed = 2 + Math.random() * 4;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          
          particlesRef.current.push({
              x, y, z,
              vx: Math.sin(phi) * Math.cos(theta) * speed,
              vy: Math.sin(phi) * Math.sin(theta) * speed,
              vz: Math.cos(phi) * speed,
              life: 1.0,
              maxLife: 1.0 + Math.random(),
              color,
              size: 2 + Math.random() * 4
          });
      }
  };

  const unlockNode = (index: number) => {
      const node = nodes[index];
      if (!node.unlocked) {
          // First time unlock effect
          spawnParticles(node.x, node.y, node.z, '#ffffff', 50); // White flash
          spawnParticles(node.x, node.y, node.z, node.color, 30);
          setNodes(prev => prev.map((n, i) => i === index ? { ...n, unlocked: true } : n));
      } else {
          // Just interaction effect
          spawnParticles(node.x, node.y, node.z, node.color, 15);
      }
      setActiveNodeIdx(index);
  };

  // 3. Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;

    const render = () => {
      frame++;
      // Handle resizing based on viewMode
      const isLandscape = viewMode === 'landscape';
      // In landscape, we swap dimensions effectively in CSS, but canvas needs actual pixels
      // However, since we rotate the container DIV, the canvas internal w/h should match the DIV's w/h
      const width = canvas.width = containerRef.current?.clientWidth || 300;
      const height = canvas.height = containerRef.current?.clientHeight || 400;
      
      const cx = width / 2;
      const cy = height / 2;
      const focalLength = 500; // FOV

      // --- Background ---
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height));
      grad.addColorStop(0, '#0f172a'); // Slate-900
      grad.addColorStop(1, '#020617'); // Slate-950
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = '#ffffff';
      for(let i=0; i<60; i++) {
          const x = (Math.sin(i * 132.1) * width + frame * 0.1 * ((i%3)+1)) % width;
          const y = (Math.cos(i * 53.2) * height) % height;
          const size = Math.random() * 1.5;
          const blink = Math.sin(frame * 0.05 + i) * 0.5 + 0.5;
          ctx.globalAlpha = 0.2 + blink * 0.6;
          ctx.beginPath();
          ctx.arc(x < 0 ? x+width : x, y < 0 ? y+height : y, size, 0, Math.PI*2);
          ctx.fill();
      }
      ctx.globalAlpha = 1;

      // --- 3D Projection Helper ---
      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        let rx = x, rz = z;
        const cosY = Math.cos(camera.rotY), sinY = Math.sin(camera.rotY);
        let x1 = rx * cosY - rz * sinY;
        let z1 = rz * cosY + rx * sinY;
        rx = x1; rz = z1;

        // Rotate X
        let ry = y;
        const cosX = Math.cos(camera.rotX), sinX = Math.sin(camera.rotX);
        let y2 = ry * cosX - rz * sinX;
        let z2 = rz * cosX + ry * sinX;
        ry = y2; rz = z2;

        // Translate Z
        rz += camera.z * -1; // Move camera back

        // Perspective Divide
        const scale = focalLength / (focalLength + rz);
        return {
            x: cx + rx * scale,
            y: cy + ry * scale,
            scale,
            z: rz,
            visible: rz > -focalLength + 50 // Clip plane
        };
      };

      // --- Draw Connections (Lines) ---
      ctx.lineWidth = 2;
      for (let i = 0; i < nodes.length - 1; i++) {
          const p1 = project(nodes[i].x, nodes[i].y, nodes[i].z);
          const p2 = project(nodes[i+1].x, nodes[i+1].y, nodes[i+1].z);
          
          if (p1.visible && p2.visible) {
              const gradLine = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
              gradLine.addColorStop(0, nodes[i].unlocked ? nodes[i].color : '#334155');
              gradLine.addColorStop(1, nodes[i+1].unlocked ? nodes[i+1].color : '#334155');
              
              ctx.strokeStyle = gradLine;
              ctx.globalAlpha = (nodes[i].unlocked && nodes[i+1].unlocked) ? 0.6 : 0.1;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
          }
      }
      ctx.globalAlpha = 1;

      // --- Draw Particles ---
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.z += p.vz;
          p.life -= 0.015;
          const proj = project(p.x, p.y, p.z);
          if (proj.visible) {
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.life;
              const size = p.size * proj.scale;
              ctx.beginPath();
              ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
              ctx.fill();
          }
      });
      ctx.globalAlpha = 1;

      // --- Draw Nodes (Planets) ---
      // Sort by Z for Painter's Algo
      const projectedNodes = nodes.map(n => ({...n, proj: project(n.x, n.y, n.z)}));
      projectedNodes.sort((a, b) => b.proj.z - a.proj.z);

      projectedNodes.forEach(node => {
          if (!node.proj.visible) return;

          const { x, y, scale } = node.proj;
          const size = (node.id === activeNodeIdx ? 24 : 16) * scale;
          const opacity = node.unlocked ? 1 : 0.4;
          
          // Glow/Atmosphere
          if (node.unlocked || node.id === activeNodeIdx) {
              const glow = ctx.createRadialGradient(x, y, size*0.5, x, y, size * 2.5);
              glow.addColorStop(0, node.color);
              glow.addColorStop(1, 'transparent');
              ctx.fillStyle = glow;
              ctx.globalAlpha = 0.4 * (Math.sin(frame * 0.05) * 0.3 + 0.7); // Pulsing
              ctx.beginPath();
              ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
              ctx.fill();
          }

          // Planet Body
          ctx.globalAlpha = opacity;
          ctx.fillStyle = '#0f172a'; // Core
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Rim Light
          ctx.strokeStyle = node.unlocked ? node.color : '#475569';
          ctx.lineWidth = (node.id === activeNodeIdx ? 3 : 1.5) * scale;
          ctx.stroke();

          // Label
          ctx.globalAlpha = node.unlocked ? 1 : 0.6;
          ctx.fillStyle = node.unlocked ? '#fff' : '#94a3b8';
          ctx.font = `bold ${10 * scale}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.label, x, y);
          ctx.globalAlpha = 1;
      });

      requestRef.current = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(requestRef.current);
  }, [nodes, camera, activeNodeIdx, viewMode]); // Re-render when viewMode changes size

  // Click Handler (Raycast-ish)
  const handleCanvasClick = (e: React.MouseEvent) => {
      // If drag distance is small, treat as click
      const dragDist = Math.hypot(e.clientX - mouseRef.current.lastX, e.clientY - mouseRef.current.lastY);
      if (dragDist > 10) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;
      const focalLength = 500;

      let closestId = -1;
      let minD = 50; // Hit radius

      nodes.forEach((n) => {
           let rx = n.x, rz = n.z;
           const cosY = Math.cos(camera.rotY), sinY = Math.sin(camera.rotY);
           let x1 = rx * cosY - rz * sinY;
           let z1 = rz * cosY + rx * sinY;
           rx = x1; rz = z1;

           let ry = n.y;
           const cosX = Math.cos(camera.rotX), sinX = Math.sin(camera.rotX);
           let y2 = ry * cosX - rz * sinX;
           let z2 = rz * cosX + ry * sinX;
           ry = y2; rz = z2;

           rz += camera.z * -1;
           if (rz > 0) {
               const scale = focalLength / (focalLength + rz);
               const px = cx + rx * scale;
               const py = cy + ry * scale;
               const dist = Math.hypot(mx - px, my - py);
               if (dist < minD * scale * 1.5) { // Scale hit area
                   minD = dist;
                   closestId = n.id;
               }
           }
      });

      if (closestId !== -1) {
          unlockNode(closestId);
      }
  };

  const unlockedCount = nodes.filter(n => n.unlocked).length;
  const isComplete = unlockedCount === nodes.length && nodes.length > 0;

  return (
    <div 
        ref={containerRef}
        className={`relative rounded-3xl overflow-hidden bg-slate-950 transition-all duration-300 shadow-2xl ring-1 ring-slate-800
        ${viewMode !== 'default' ? 'fixed z-50 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'w-full h-96 my-4'}
        `}
        style={viewMode === 'landscape' ? {
            top: 0,
            left: '100vw',
            width: '100vh',
            height: '100vw',
            transform: 'rotate(90deg)',
            transformOrigin: 'top left',
            borderRadius: 0,
            margin: 0
        } : viewMode === 'fullscreen' ? {
            inset: 0,
            borderRadius: 0,
            margin: 0
        } : {}}
    >
        {/* Render Canvas */}
        <canvas 
            ref={canvasRef}
            className="w-full h-full touch-none cursor-move block"
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleCanvasClick}
            onMouseLeave={() => { mouseRef.current.isDown = false; }}
            onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={() => { mouseRef.current.isDown = false; }}
        />
        
        {/* --- UI HUD --- */}
        
        {/* Top Bar Status */}
        <div className="absolute top-4 left-4 z-10 flex gap-2 pointer-events-none">
            <div className={`backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold border shadow-lg flex items-center gap-2 transition-all ${isComplete ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-800/60 text-blue-400 border-blue-500/30'}`}>
                {isComplete ? <Trophy className="w-3.5 h-3.5" /> : <Rocket className="w-3.5 h-3.5" />}
                <span>{isComplete ? '同步完成' : `记忆同步 ${unlockedCount}/${nodes.length}`}</span>
            </div>
        </div>

        {/* Top Right Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button 
                onClick={() => setCamera({ x: 0, y: 0, z: -450, rotX: 0.2, rotY: 0.5 })}
                className="p-2 bg-slate-800/60 backdrop-blur rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="重置视角"
            >
                <RefreshCw className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setShowList(!showList)}
                className={`p-2 backdrop-blur rounded-full transition-colors ${showList ? 'bg-blue-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
                title="列表视图"
            >
                <List className="w-4 h-4" />
            </button>
            <button 
                onClick={() => setViewMode(viewMode === 'landscape' ? 'default' : 'landscape')}
                className={`p-2 backdrop-blur rounded-full transition-colors ${viewMode === 'landscape' ? 'bg-purple-600 text-white' : 'bg-slate-800/60 text-slate-400 hover:text-white'}`}
                title="手机横屏沉浸模式"
            >
                <Smartphone className={`w-4 h-4 ${viewMode === 'landscape' ? 'rotate-90' : ''}`} />
            </button>
            <button 
                onClick={() => setViewMode(viewMode === 'fullscreen' ? 'default' : 'fullscreen')}
                className="p-2 bg-slate-800/60 backdrop-blur rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
                {viewMode === 'fullscreen' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {viewMode !== 'default' && onClose && (
                <button onClick={() => { setViewMode('default'); onClose(); }} className="p-2 bg-red-900/80 backdrop-blur rounded-full text-red-300 hover:bg-red-800 transition-colors">
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>

        {/* Floating List Panel (Toggleable) */}
        {showList && (
             <div className="absolute right-4 top-16 bottom-20 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl p-4 overflow-y-auto z-20 shadow-2xl animate-in slide-in-from-right-10">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">关键记忆点</h3>
                 <div className="space-y-2">
                     {nodes.map((node) => (
                         <button 
                            key={node.id}
                            onClick={() => unlockNode(node.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${node.unlocked 
                                ? 'bg-slate-800/50 border-slate-700 text-slate-300' 
                                : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-600'
                            } ${activeNodeIdx === node.id ? 'ring-1 ring-blue-500 bg-blue-900/20' : ''}`}
                         >
                             <div className="flex items-start gap-2">
                                 <span className="font-bold shrink-0 mt-0.5" style={{ color: node.color }}>{node.label}.</span>
                                 <span className="leading-relaxed">{node.text.slice(0, 30)}...</span>
                             </div>
                         </button>
                     ))}
                 </div>
             </div>
        )}

        {/* Bottom Content Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none flex flex-col items-center justify-end">
            {activeNodeIdx !== -1 ? (
                <div className="animate-in slide-in-from-bottom-8 duration-300 max-w-lg w-full">
                     <div 
                        className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-5 rounded-2xl shadow-2xl relative overflow-hidden"
                     >
                         <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: nodes[activeNodeIdx].color }} />
                         <div className="flex justify-between items-center mb-2 pl-3">
                            <span className="text-xs font-black tracking-widest uppercase flex items-center gap-2" style={{ color: nodes[activeNodeIdx].color }}>
                                <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
                                节点 {nodes[activeNodeIdx].label} 已同步
                            </span>
                         </div>
                         <div className="text-sm md:text-base font-medium text-white leading-relaxed pl-3 text-shadow-sm">
                            {nodes[activeNodeIdx].text}
                         </div>
                     </div>
                </div>
            ) : (
                 <div className="text-center">
                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/40 backdrop-blur-md rounded-full border border-slate-700/50 text-xs font-medium text-slate-300 animate-bounce">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>拖动旋转 · 点击星球 · 收集碎片</span>
                     </div>
                 </div>
            )}
        </div>
        
    </div>
  );
};
