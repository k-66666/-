
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Move, RefreshCw, ChevronRight, ChevronDown, Eye, EyeOff } from 'lucide-react';

interface MindMapProps {
  content: string;
  onClose?: () => void;
}

interface TreeNode {
  id: string;
  text: string;
  level: number;
  children: TreeNode[];
  collapsed?: boolean;
  masked?: boolean; // New: Controls text blurring
  // Layout properties
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
];

const NODE_WIDTH = 180;
const NODE_PADDING_X = 16;
const NODE_PADDING_Y = 12;
const LEVEL_GAP = 80;
const NODE_GAP_Y = 20;

export const MindMap: React.FC<MindMapProps> = ({ content, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [root, setRoot] = useState<TreeNode | null>(null);
  
  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Viewport State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 50, y: 0 }); // Initial Offset
  const [isDragging, setIsDragging] = useState(false);
  const [globalMasked, setGlobalMasked] = useState(true); // Default to masked
  const lastPos = useRef({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Handle Native Fullscreen
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
      } catch (e) {
        console.error(e);
      }
    } else {
      if (document.exitFullscreen) await document.exitFullscreen();
    }
  };

  // 1. Parsing Logic (Smart Text Splitter)
  const parseContent = useCallback((text: string): TreeNode => {
    const cleanText = text.replace(/\\n/g, '\n').trim();
    
    // Root Node
    const rootNode: TreeNode = {
      id: 'root',
      text: '核心考点', // Default root text
      level: 0,
      children: [],
      masked: false, // Root is never masked
      x: 0, y: 0, width: 140, height: 50,
      color: '#ef4444'
    };

    // Split into primary chunks (Level 1)
    const regexL1 = /(?:^|[\n\s])(?=\d+[\.、\s])|(?=\(\d+\))|(?=[①-⑩])|(?=\d+\s)/g;
    let chunks = cleanText.split(regexL1).map(s => s.trim()).filter(s => s);

    if (chunks.length <= 1) {
        chunks = cleanText.split(/([。；;！!\n]+)/)
          .filter((_, i) => i % 2 === 0) 
          .map(s => s.trim())
          .filter(s => s.length > 4); 
    }

    if (chunks.length > 10) chunks = chunks.slice(0, 10);

    chunks.forEach((chunk, i) => {
        let label = chunk;
        const subSplit = label.split(/[:：-]/);
        
        let nodeText = label;
        let children: TreeNode[] = [];

        if (subSplit.length > 1 && subSplit[0].length < 15) {
             nodeText = subSplit[0].replace(/^(\d+[\.、\s]|[①-⑩]|\(\d+\))/, '').trim();
             const desc = subSplit.slice(1).join('').trim();
             if (desc) {
                 children.push({
                     id: `node-${i}-0`,
                     text: desc,
                     level: 2,
                     children: [],
                     masked: true,
                     x: 0, y: 0, width: 220, height: 0,
                     color: COLORS[i % COLORS.length]
                 });
             }
        } else {
             nodeText = nodeText.replace(/^(\d+[\.、\s]|[①-⑩]|\(\d+\))/, '').trim();
        }
        
        rootNode.children.push({
            id: `node-${i}`,
            text: nodeText,
            level: 1,
            children: children,
            masked: true, // Default children to masked
            x: 0, y: 0, width: children.length > 0 ? 160 : 200, height: 0,
            color: COLORS[i % COLORS.length]
        });
    });

    if (rootNode.children.length === 0) {
        rootNode.children.push({
            id: 'node-0',
            text: cleanText,
            level: 1,
            children: [],
            masked: true,
            x: 0, y: 0, width: 200, height: 0,
            color: COLORS[0]
        });
    }

    return rootNode;
  }, []);

  // 2. Layout Algorithm
  const calculateLayout = useCallback((node: TreeNode) => {
      // Step 1: Calculate Heights
      const measureNode = (n: TreeNode): number => {
          const lines = Math.ceil(n.text.length / (n.level === 0 ? 8 : 11));
          n.height = Math.max(40, lines * 20 + NODE_PADDING_Y * 2);
          
          if (n.collapsed || n.children.length === 0) {
              return n.height;
          }

          let childrenHeight = 0;
          n.children.forEach(child => {
              childrenHeight += measureNode(child);
          });
          childrenHeight += (n.children.length - 1) * NODE_GAP_Y;
          
          return Math.max(n.height, childrenHeight);
      };

      measureNode(node);

      // Step 2: Set Coordinates
      const layoutNode = (n: TreeNode, x: number, y: number, availableHeight: number) => {
          n.x = x;
          n.y = y; 
          
          if (n.collapsed || n.children.length === 0) return;

          // Simple Layout: Determine total height of children block
          const childBlockH = n.children.reduce((acc, c) => acc + (c as any)._subtreeHeight + NODE_GAP_Y, 0) - NODE_GAP_Y;
           
          let startY = n.y - childBlockH / 2;
           
          n.children.forEach(child => {
               const childH = (child as any)._subtreeHeight;
               const childCenterY = startY + childH / 2;
               layoutNode(child, n.x + n.width + LEVEL_GAP, childCenterY, childH);
               startY += childH + NODE_GAP_Y;
          });
      };
      
      const calcSubtreeHeight = (n: TreeNode): number => {
          if (n.collapsed || n.children.length === 0) {
              (n as any)._subtreeHeight = n.height;
              return n.height;
          }
          let h = 0;
          n.children.forEach(c => h += calcSubtreeHeight(c));
          h += (n.children.length - 1) * NODE_GAP_Y;
          (n as any)._subtreeHeight = Math.max(n.height, h);
          return (n as any)._subtreeHeight;
      };

      calcSubtreeHeight(node);
      layoutNode(node, 50, 0, (node as any)._subtreeHeight);
      
      return { ...node }; 
  }, []);

  // Initialize
  useEffect(() => {
    if (content) {
        const tree = parseContent(content);
        // Apply initial mask state based on globalMasked
        // Helper to apply mask recursively
        const applyMask = (n: TreeNode, mask: boolean) => {
            if (n.level > 0) n.masked = mask;
            n.children.forEach(c => applyMask(c, mask));
        }
        applyMask(tree, globalMasked);

        const layoutedTree = calculateLayout(tree);
        setRoot(layoutedTree);
        
        // Auto-Center
        setTimeout(() => {
            if (containerRef.current) {
                const h = containerRef.current.clientHeight;
                setPosition({ x: 50, y: h / 2 });
            }
        }, 0);
    }
  }, [content, parseContent, calculateLayout]); // Intentionally not re-running on globalMasked toggle to avoid reset

  // Logic to toggle Global Mask
  const toggleGlobalMask = () => {
      if (!root) return;
      const newMaskState = !globalMasked;
      setGlobalMasked(newMaskState);
      
      // Update all nodes
      const updateNode = (n: TreeNode) => {
          if (n.level > 0) n.masked = newMaskState;
          n.children.forEach(updateNode);
      };
      const newRoot = { ...root };
      updateNode(newRoot);
      // No layout change needed, just render update
      setRoot(newRoot);
  };

  // Logic to toggle Individual Node Mask (Click)
  const toggleNodeMask = (nodeId: string) => {
      if (!root) return;
      
      const updateNode = (n: TreeNode): boolean => {
          if (n.id === nodeId) {
              n.masked = !n.masked;
              return true;
          }
          for (let child of n.children) {
              if (updateNode(child)) return true;
          }
          return false;
      };
      
      const newRoot = { ...root };
      updateNode(newRoot);
      setRoot(newRoot);
  };

  // Logic to toggle Collapse (Double Click or Icon)
  const toggleCollapse = (nodeId: string) => {
      if (!root) return;
      
      const toggleNode = (n: TreeNode): boolean => {
          if (n.id === nodeId) {
              n.collapsed = !n.collapsed;
              return true;
          }
          for (let child of n.children) {
              if (toggleNode(child)) return true;
          }
          return false;
      };
      
      const newRoot = { ...root };
      toggleNode(newRoot);
      const layouted = calculateLayout(newRoot);
      setRoot(layouted);
  };

  // Interaction Handlers
  const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          setScale(s => Math.min(Math.max(s * delta, 0.2), 3));
      } else {
          setPosition(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
      }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest('.mindmap-node')) return; 
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      lastPos.current = { x: e.clientX, y: e.clientY };
      dragStartPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;

      setPosition(p => ({ x: p.x + dx, y: p.y + dy }));
      lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);

      // Check for click (minimal movement)
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // If clicked and not fullscreen, enter fullscreen
      if (dist < 5 && !isFullscreen && toggleFullscreen) {
          toggleFullscreen();
      }
  };

  // Render Helpers
  const renderLinks = (node: TreeNode): React.ReactNode[] => {
      if (node.collapsed || node.children.length === 0) return [];
      
      const links: React.ReactNode[] = [];
      const parentRight = node.x + node.width;
      const parentY = node.y;

      node.children.forEach(child => {
          const childLeft = child.x;
          const childY = child.y;
          
          const cp1x = parentRight + (childLeft - parentRight) / 2;
          const cp1y = parentY;
          const cp2x = parentRight + (childLeft - parentRight) / 2;
          const cp2y = childY;

          links.push(
              <path
                  key={`link-${node.id}-${child.id}`}
                  d={`M ${parentRight} ${parentY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${childLeft} ${childY}`}
                  stroke={child.color}
                  strokeWidth={2}
                  fill="none"
                  opacity={0.6}
              />
          );
          
          links.push(...renderLinks(child));
      });
      return links;
  };

  const renderNodes = (node: TreeNode): React.ReactNode[] => {
      const nodes: React.ReactNode[] = [];
      const isVisible = !node.masked;
      
      nodes.push(
          <foreignObject
              key={node.id}
              x={node.x}
              y={node.y - node.height / 2}
              width={node.width}
              height={node.height}
              className="mindmap-node"
          >
              <div 
                  className={`
                      w-full h-full rounded-xl border-2 flex items-center justify-center p-2 text-center relative
                      transition-all duration-200 cursor-pointer hover:shadow-lg active:scale-95 select-none
                      ${node.collapsed && node.children.length > 0 ? 'ring-4 ring-offset-2 ring-opacity-30' : ''}
                      ${node.masked ? 'bg-slate-100 dark:bg-slate-800' : ''} 
                  `}
                  style={{ 
                      backgroundColor: node.level === 0 ? node.color : (node.masked ? undefined : 'white'),
                      borderColor: node.color,
                      color: node.level === 0 ? 'white' : '#1e293b',
                      fontSize: node.level === 0 ? '14px' : '12px',
                      fontWeight: node.level === 0 ? 'bold' : 'normal',
                      boxShadow: node.collapsed ? `0 0 0 4px ${node.color}30` : 'none'
                  }}
                  onClick={(e) => {
                      e.stopPropagation();
                      if (node.level > 0) toggleNodeMask(node.id);
                  }}
                  onDoubleClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse(node.id);
                  }}
              >
                  {/* Text Content */}
                  <span className={`line-clamp-4 leading-tight pointer-events-none transition-all duration-300 ${isVisible ? '' : 'blur-md opacity-20 grayscale'}`}>
                    {node.text}
                  </span>
                  
                  {/* Mask Overlay Click Prompt */}
                  {!isVisible && node.level > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <EyeOff className="w-4 h-4 text-slate-400 opacity-50" />
                      </div>
                  )}
                  
                  {/* Collapse Indicator */}
                  {node.children.length > 0 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}
                        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50 z-10"
                      >
                          {node.collapsed ? <ChevronRight className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                  )}
              </div>
          </foreignObject>
      );

      if (!node.collapsed) {
          node.children.forEach(child => nodes.push(...renderNodes(child)));
      }
      return nodes;
  };

  const containerClass = isFullscreen
    ? "fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-900"
    : "relative w-full h-[400px] rounded-2xl border border-slate-200 dark:border-slate-800 my-2 shadow-inner bg-slate-50 dark:bg-slate-900 overflow-hidden transition-all duration-300";

  return (
    <div 
        ref={containerRef}
        className={containerClass}
    >
        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button 
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500 active:scale-95 transition-all"
                title={isFullscreen ? "退出全屏" : "全屏展开"}
            >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            
            {/* Mask Toggle */}
            <button 
                onClick={(e) => { e.stopPropagation(); toggleGlobalMask(); }}
                className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-500 active:scale-95 transition-all"
                title={globalMasked ? "显示全部" : "隐藏全部"}
            >
                {globalMasked ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            <div className="flex flex-col bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button onClick={(e) => { e.stopPropagation(); setScale(s => Math.min(s + 0.1, 3)); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ZoomIn className="w-5 h-5" /></button>
                <div className="h-px bg-slate-200 dark:bg-slate-700" />
                <button onClick={(e) => { e.stopPropagation(); setScale(s => Math.max(s - 0.1, 0.2)); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ZoomOut className="w-5 h-5" /></button>
            </div>
            <button 
                 onClick={(e) => { e.stopPropagation(); setScale(1); if(containerRef.current) setPosition({ x: 50, y: containerRef.current.clientHeight/2 }); }}
                 className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 active:scale-95 transition-all"
            >
                <RefreshCw className="w-5 h-5" />
            </button>
        </div>

        {/* Canvas Area */}
        <div 
            className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        >
            <svg width="100%" height="100%">
                 {/* Background Grid Pattern */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-200 dark:text-slate-800" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                <g transform={`translate(${position.x}, ${position.y}) scale(${scale})`}>
                    {root && (
                        <>
                            {renderLinks(root)}
                            {renderNodes(root)}
                        </>
                    )}
                </g>
            </svg>
        </div>
        
        {/* Helper Hint */}
        <div className="absolute bottom-4 left-4 pointer-events-none bg-white/80 dark:bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-full text-xs text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <Move className="w-3 h-3" />
            <span>拖拽画布 · 滚轮缩放 · <strong>单击</strong>节点显隐 · <strong>双击</strong>折叠</span>
        </div>
    </div>
  );
};
