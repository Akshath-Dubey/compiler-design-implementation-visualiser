/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  List,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  FileCode,
  Zap,
  Cpu,
  Bookmark,
  Scale,
  Hash,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { Token, ASTNode, CompilerResult, TokenType } from '../types';
import AdPlaceholder from './AdPlaceholder';

interface PhaseDisplayProps {
  compilerResult: CompilerResult | null;
  code: string;
}

export default function PhaseDisplay({ compilerResult, code }: PhaseDisplayProps) {
  const [activePhase, setActivePhase] = useState<number>(1);
  const [tokenFilter, setTokenFilter] = useState<string>('ALL');
  const [hoveredToken, setHoveredToken] = useState<Token | null>(null);

  if (!compilerResult) {
    return (
      <div id="no-result-panel" className="flex flex-col items-center justify-center border border-dashed border-slate-800 bg-slate-950/40 py-20 px-8 rounded-xl text-center">
        <Cpu className="w-16 h-16 text-slate-705 text-emerald-500/30 animate-pulse mb-4" />
        <h3 className="text-xl font-bold text-slate-205 text-slate-300">Awaiting Compilation Stream</h3>
        <p className="text-sm text-slate-500 max-w-md mt-2">
          Click the "Visualize Compiler Phases" button above. The compiler engine will parse, check, and synthesize target assembly code for your source in real-time.
        </p>
      </div>
    );
  }

  const { tokens, ast, semantic, tac, optimizedTac, optimizations, assembly } = compilerResult;

  // Render Phase Tabs Sidebar Helper
  const phases = [
    { id: 1, name: 'Lexical Analyzer', short: 'Scan text', icon: List, desc: 'Scanner / Tokenizer' },
    { id: 2, name: 'Syntax Analyzer', short: 'AST parser', icon: GitBranch, desc: 'Abstract Syntax Tree' },
    { id: 3, name: 'Semantic Analyzer', short: 'Context evaluation', icon: ShieldCheck, desc: 'Type & Scope Check' },
    { id: 4, name: 'Intermediate Code Generator', short: 'IR synthesis', icon: FileCode, desc: 'Three-Address Code' },
    { id: 5, name: 'Code Optimization', short: 'Code optimizer', icon: Zap, desc: 'Pruning & Folding' },
    { id: 6, name: 'Target Code Generator', short: 'Asm instruction', icon: Cpu, desc: 'Intel x86 Assembly' }
  ];

  const getPhaseStateColor = (pId: number) => {
    if (pId === 3 && !semantic.passed) {
      return 'border-rose-500/50 bg-rose-500/5 text-rose-400';
    }
    if (activePhase === pId) {
      return 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
    }
    return 'border-slate-800 hover:border-slate-700 bg-slate-950/60 text-slate-400 hover:text-slate-200';
  };

  return (
    <div id="phase-visualizer" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* 1. Sidebar Navigation - 3 columns */}
      <div id="sidebar-tabs" className="lg:col-span-4 flex flex-col gap-3 bg-slate-900/60 border border-slate-850 p-4 rounded-xl shadow-xl">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-emerald-500" /> Compiler Progress Rail
          </h3>
        </div>
        
        <div className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0 scrollbar-thin">
          {phases.map((p) => {
            const Icon = p.icon;
            const isSemanticFailed = p.id === 3 && !semantic.passed;

            return (
              <button
                key={p.id}
                id={`phase-tab-${p.id}`}
                onClick={() => setActivePhase(p.id)}
                className={`flex-1 text-left p-3 border rounded-lg transition-all cursor-pointer min-w-[200px] sm:min-w-fit flex items-center gap-3 relative overflow-hidden group/tab ${getPhaseStateColor(
                  p.id
                )}`}
              >
                {/* Visual completion accent dot */}
                <div className={`absolute top-0 left-0 w-1 h-full ${isSemanticFailed ? 'bg-rose-500' : p.id === activePhase ? 'bg-emerald-500' : 'bg-transparent group-hover/tab:bg-slate-700'} transition-all`} />

                <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-md">
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500 group-hover/tab:text-emerald-400 transition-colors">Phase {p.id}</span>
                    {isSemanticFailed && (
                      <span className="text-[9px] font-mono bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-bold border border-rose-500/30">FAILED</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold tracking-tight truncate">{p.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic AdSense/Ezoic Premium Sponsored Placement Slot */}
        <div className="border-t border-slate-800/80 mt-4 pt-4" />
        <AdPlaceholder type="sidebar" id="sidebar-sponsored-slot" />
      </div>

      {/* 2. Main Visual Panel Output - 8 columns */}
      <div id="main-phase-output" className="lg:col-span-8 bg-slate-900 border border-slate-850 rounded-xl p-5 shadow-2x0 min-h-[500px] flex flex-col relative overflow-hidden">
        {/* Dynamic header backing style */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400" />

        {/* Dynamic Title based on Active Phase */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">COMPILING: PHASE {activePhase} / 6</span>
            <h2 id="phase-display-title" className="text-xl font-bold tracking-tight text-slate-100 mt-0.5">
              {phases[activePhase - 1].name}
            </h2>
            <p id="phase-display-desc" className="text-xs text-slate-400 mt-1">
              {getPhaseDescription(activePhase)}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/5 text-emerald-400 border border-emerald-500/10 rounded-xl">
            {React.createElement(phases[activePhase - 1].icon, { className: 'w-6 h-6 animate-pulse' })}
          </div>
        </div>

        {/* RENDERING INDIVIDUAL DEEP ANALYSIS STAGES */}
        <div className="flex-1 flex flex-col">
          {activePhase === 1 && (
            <LexicalVisualizer
              tokens={tokens}
              code={code}
              tokenFilter={tokenFilter}
              setTokenFilter={setTokenFilter}
              hoveredToken={hoveredToken}
              setHoveredToken={setHoveredToken}
            />
          )}

          {activePhase === 2 && <SyntaxVisualizer ast={ast} />}

          {activePhase === 3 && <SemanticVisualizer semantic={semantic} />}

          {activePhase === 4 && <IntermediateCodeVisualizer tac={tac} code={code} />}

          {activePhase === 5 && <OptimizationVisualizer optimizations={optimizations} original={tac} optimized={optimizedTac} />}

          {activePhase === 6 && <AssemblyVisualizer assembly={assembly} />}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// LEXICAL ANALYZER (PHASE 1) SUB-VIEWER
// =========================================================

interface LexicalVisualizerProps {
  tokens: Token[];
  code: string;
  tokenFilter: string;
  setTokenFilter: (f: string) => void;
  hoveredToken: Token | null;
  setHoveredToken: (t: Token | null) => void;
}

function LexicalVisualizer({
  tokens,
  code,
  tokenFilter,
  setTokenFilter,
  hoveredToken,
  setHoveredToken
}: LexicalVisualizerProps) {
  // Categorize token types
  const categories = ['ALL', 'KEYWORD', 'IDENTIFIER', 'NUMBER', 'OPERATOR', 'COMPARISON', 'ASSIGN', 'COMMENT', 'PUNCTUATION'];

  const filteredTokens = tokens.filter((t) => tokenFilter === 'ALL' || t.type === tokenFilter);

  // Custom highlights in original code representation
  const renderCodeWithTokenHighlights = () => {
    const lines = code.split('\n');
    return (
      <pre className="font-mono text-xs leading-relaxed overflow-x-auto selection:bg-slate-800 text-slate-300">
        <code>
          {lines.map((lineText, lineIdx) => {
            const lineNum = lineIdx + 1;
            // Find all tokens corresponding to this line
            const lineTokens = tokens.filter((t) => t.line === lineNum && t.type !== 'COMMENT' && t.type !== 'UNKNOWN');

            // Sort tokens by columns descending so we can splice or replace indices
            // Or just check characters one by one and highlight if matching coordinate!
            let characters = Array.from(lineText);
            return (
              <div key={lineIdx} className="hover:bg-slate-950/40 px-2 rounded -mx-2 flex items-start gap-4 h-[1.5rem]">
                <span className="text-slate-600 select-none w-5 text-right font-medium">{lineNum}</span>
                <span className="flex-1 overflow-x-auto whitespace-pre">
                  {characters.map((char, charIdx) => {
                    const col = charIdx + 1;
                    // Check if a hovered token contains this token coordinate
                    const matchingToken = tokens.find(
                      (t) =>
                        t.line === lineNum &&
                        col >= t.column &&
                        col < t.column + t.value.length
                    );

                    let styleClass = '';
                    if (hoveredToken && matchingToken && hoveredToken.id === matchingToken.id) {
                      styleClass = 'bg-emerald-500/30 text-emerald-300 font-bold border-b border-emerald-400';
                    } else if (matchingToken) {
                      styleClass = getTokenStyleClass(matchingToken.type);
                    }

                    return (
                      <span
                        key={charIdx}
                        className={`transition-all ${styleClass}`}
                        onMouseEnter={() => matchingToken && setHoveredToken(matchingToken)}
                        onMouseLeave={() => setHoveredToken(null)}
                        title={matchingToken ? `Token: ${matchingToken.type} (${matchingToken.value})` : undefined}
                      >
                        {char}
                      </span>
                    );
                  })}
                </span>
              </div>
            );
          })}
        </code>
      </pre>
    );
  };

  return (
    <div id="lexical-analyser-view" className="flex flex-col gap-6">
      {/* Code Inspector Side and Token Ledger Side Split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Source Text with Live Hover Highlights */}
        <div className="border border-slate-800 bg-slate-950/80 p-4 rounded-xl flex flex-col h-112 overflow-hidden shadow-inner relative group">
          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-mono font-semibold text-slate-400 select-none">HOVER CODE CHARS</span>
          </div>

          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Laser Code Highlight
          </h3>
          <div className="flex-1 overflow-y-auto">
            {renderCodeWithTokenHighlights()}
          </div>
        </div>

        {/* Tokens List Table Column */}
        <div className="border border-slate-800 bg-slate-950/60 p-4 rounded-xl flex flex-col h-112 overflow-hidden relative">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5 justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" /> Token Ledger Grid
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 border border-slate-800 py-0.5 px-2 rounded-full">
              Count: {filteredTokens.length} / {tokens.length}
            </span>
          </h3>

          {/* Type filters select banner */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none flex-wrap mb-3 select-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setTokenFilter(cat)}
                className={`text-[10px] font-mono px-2 py-1 rounded-md border font-bold transition-all ${
                  tokenFilter === cat
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tokens scrolling list table */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden rounded-lg border border-slate-850">
            <table className="w-full text-left font-mono text-xs text-slate-300">
              <thead className="bg-slate-900 text-slate-500 sticky top-0 uppercase text-[10px] font-bold border-b border-slate-850">
                <tr>
                  <th className="py-2.5 px-3">Token ID</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Value Literal</th>
                  <th className="py-2.5 px-3 text-right">Coord [L:C]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredTokens.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500">
                      No tokens found matching category '{tokenFilter}'
                    </td>
                  </tr>
                ) : (
                  filteredTokens.map((tok) => {
                    const isHovered = hoveredToken && hoveredToken.id === tok.id;
                    return (
                      <tr
                        key={tok.id}
                        onMouseEnter={() => setHoveredToken(tok)}
                        onMouseLeave={() => setHoveredToken(null)}
                        className={`transition-all hover:bg-slate-955 cursor-crosshair border-l-2 ${
                          isHovered 
                            ? 'bg-emerald-500/10 text-emerald-300 border-l-emerald-500 scale-[0.99] font-semibold' 
                            : 'border-l-transparent'
                        }`}
                      >
                        <td className="py-2 px-3 text-slate-500 font-bold">{tok.id}</td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTokenPillClass(tok.type)}`}>
                            {tok.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-slate-200 font-bold max-w-[150px] truncate">{tok.value}</td>
                        <td className="py-2 px-3 text-right text-slate-550 text-slate-500">
                          {tok.line}:{tok.column}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTokenStyleClass(type: TokenType): string {
  switch (type) {
    case 'KEYWORD': return 'text-violet-400 font-bold';
    case 'IDENTIFIER': return 'text-emerald-300';
    case 'NUMBER': return 'text-amber-400';
    case 'STRING': return 'text-orange-400';
    case 'OPERATOR': return 'text-cyan-400 font-bold';
    case 'COMPARISON': return 'text-yellow-400 font-bold';
    case 'ASSIGN': return 'text-teal-400 font-bold';
    case 'PUNCTUATION': return 'text-slate-505 text-slate-500';
    case 'PAREN': return 'text-slate-400';
    case 'BRACE': return 'text-pink-500';
    case 'COMMENT': return 'text-slate-600 italic';
    default: return '';
  }
}

function getTokenPillClass(type: TokenType): string {
  switch (type) {
    case 'KEYWORD': return 'bg-violet-950/40 text-violet-400 border border-violet-900/40';
    case 'IDENTIFIER': return 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40';
    case 'NUMBER': return 'bg-amber-950/40 text-amber-400 border border-amber-900/30';
    case 'STRING': return 'bg-orange-950/40 text-orange-400 border border-orange-900/30';
    case 'OPERATOR': return 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/30';
    case 'COMPARISON': return 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/30';
    case 'ASSIGN': return 'bg-teal-950/40 text-teal-400 border border-teal-900/30';
    case 'COMMENT': return 'bg-slate-900 text-slate-400 border border-slate-800';
    default: return 'bg-slate-900 text-slate-400 border border-slate-800';
  }
}

// =========================================================
// SYNTAX ANALYZER (PHASE 2 - AST TREE CARDS) SUB-VIEWER
// =========================================================

interface SyntaxVisualizerProps {
  ast: ASTNode;
}

// Layout Tree Node schema
interface LayoutNode {
  id: string;
  originalNode: ASTNode;
  label: string;
  sublabel?: string;
  type: string;
  children: LayoutNode[];
  x: number;
  y: number;
}

function SyntaxVisualizer({ ast }: SyntaxVisualizerProps) {
  const [viewMode, setViewMode] = useState<'diagram' | 'cards'>('diagram');
  const [selectedLayoutNode, setSelectedLayoutNode] = useState<LayoutNode | null>(null);

  // Parse standard compiler AST into layoutable tree
  const buildLayoutTree = (node: ASTNode, depth: number = 0): LayoutNode => {
    const rawChildren: ASTNode[] = [];
    if (node.test) rawChildren.push(node.test);
    if (node.left) rawChildren.push(node.left);
    if (node.right) rawChildren.push(node.right);
    if (node.consequent) rawChildren.push(...node.consequent);
    if (node.alternate) rawChildren.push(...node.alternate);

    const children = rawChildren.filter(Boolean).map((child) => buildLayoutTree(child, depth + 1));

    let label: string = node.type;
    let sublabel = '';

    if (node.type === 'VariableDeclaration') {
      label = `Decl: ${node.name || '?'}`;
      sublabel = node.dataType ? `(type: ${node.dataType})` : '';
    } else if (node.type === 'Assignment') {
      label = `Assign: ${node.name || '?'}`;
    } else if (node.type === 'BinaryExpression') {
      label = `Op: ${node.operator || '?'}`;
    } else if (node.type === 'IfStatement') {
      label = 'If Statement';
    } else if (node.type === 'Identifier') {
      label = `Id: ${node.name || '?'}`;
    } else if (node.type === 'Literal') {
      label = node.value !== undefined ? `Lit: ${node.value.toString()}` : 'Literal';
      sublabel = node.dataType ? `[${node.dataType}]` : '';
    } else if (node.type === 'ErrorNode') {
      label = 'Parser Error';
      sublabel = node.errorMessage || '';
    } else if (node.type === 'Program') {
      label = 'Program Root';
    }

    return {
      id: node.id || `layout-node-${Math.random()}`,
      originalNode: node,
      label,
      sublabel,
      type: node.type,
      children,
      x: 0,
      y: depth * 110 + 50 // 110px vertical distance to make nodes readable
    };
  };

  // Traverses layout nodes to lay them out horizontally
  const assignCoordinates = (node: LayoutNode, leftBoundary: number = 0): { rightBoundary: number; x: number } => {
    if (node.children.length === 0) {
      const x = leftBoundary + 75; // 150px spacing for node box width + gap
      node.x = x;
      return { rightBoundary: leftBoundary + 160, x };
    }

    let currentLeft = leftBoundary;
    const childXPositions: number[] = [];

    for (const child of node.children) {
      const res = assignCoordinates(child, currentLeft);
      currentLeft = res.rightBoundary;
      childXPositions.push(res.x);
    }

    const sum = childXPositions.reduce((a, b) => a + b, 0);
    const avgX = sum / childXPositions.length;
    node.x = avgX;

    const selfRightBoundary = node.x + 80;
    return { rightBoundary: Math.max(currentLeft, selfRightBoundary), x: avgX };
  };

  // Build the layout from raw ast
  let layoutRoot: LayoutNode | null = null;
  let treeWidth = 800;
  let maxDepthY = 300;

  if (ast) {
    layoutRoot = buildLayoutTree(ast);
    const res = assignCoordinates(layoutRoot, 10);
    treeWidth = Math.max(res.rightBoundary + 40, 700);

    // Calculate maximum height
    const calculateMaxY = (n: LayoutNode) => {
      if (n.y > maxDepthY) maxDepthY = n.y;
      n.children.forEach(calculateMaxY);
    };
    calculateMaxY(layoutRoot);
  }

  // Draw connecting curves
  const drawVerticalCurve = (px: number, py: number, cx: number, cy: number) => {
    const midY = (py + cy) / 2;
    return `M ${px} ${py + 22} C ${px} ${midY}, ${cx} ${midY}, ${cx} ${cy - 22}`;
  };

  // Color scheme based on AST node type
  const getNodeColorGroup = (type: string, isSelected: boolean) => {
    const baseColors = (() => {
      switch (type) {
        case 'VariableDeclaration':
          return { border: '#10b981', fill: '#064e3b', text: '#34d399', badge: '#10b981' }; // emerald
        case 'Assignment':
          return { border: '#06b6d4', fill: '#083344', text: '#22d3ee', badge: '#06b6d4' }; // cyan
        case 'BinaryExpression':
          return { border: '#f59e0b', fill: '#451a03', text: '#fbbf24', badge: '#f59e0b' }; // amber
        case 'IfStatement':
          return { border: '#8b5cf6', fill: '#2e1065', text: '#a78bfa', badge: '#8b5cf6' }; // violet
        case 'Identifier':
          return { border: '#f43f5e', fill: '#4c0519', text: '#fda4af', badge: '#f43f5e' }; // rose
        case 'Literal':
          return { border: '#cbd5e1', fill: '#1e293b', text: '#f1f5f9', badge: '#94a3b8' }; // slate
        case 'ErrorNode':
          return { border: '#ef4444', fill: '#450a0a', text: '#fca5a5', badge: '#ef4444' }; // red
        case 'Program':
          return { border: '#3b82f6', fill: '#0f172a', text: '#93c5fd', badge: '#3b82f6' }; // blue
        default:
          return { border: '#6b7280', fill: '#111827', text: '#e5e7eb', badge: '#6b7280' };
      }
    })();

    if (isSelected) {
      return {
        ...baseColors,
        border: '#ffffff', // bright white border and extra glow if selected
        shadow: 'rgba(255,255,255,0.4)'
      };
    }
    return {
      ...baseColors,
      shadow: 'transparent'
    };
  };

  // Collect all edges and nodes for render
  const renderList: { edges: React.ReactNode[]; nodes: React.ReactNode[] } = { edges: [], nodes: [] };

  const traverseRender = (n: LayoutNode) => {
    const colors = getNodeColorGroup(n.type, selectedLayoutNode?.id === n.id);

    // Render node
    renderList.nodes.push(
      <g
        key={n.id}
        transform={`translate(${n.x}, ${n.y})`}
        className="cursor-pointer select-none group"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedLayoutNode(n);
        }}
      >
        {/* Node Box */}
        <rect
          x="-70"
          y="-22"
          width="140"
          height="44"
          rx="8"
          fill={colors.fill}
          stroke={colors.border}
          strokeWidth={selectedLayoutNode?.id === n.id ? '2.5' : '1.5'}
          filter={selectedLayoutNode?.id === n.id ? "drop-shadow(0px 0px 8px rgba(255,255,255,0.2))" : ""}
          className="transition-all duration-200 group-hover:brightness-125"
        />

        {/* Indicator pin */}
        <circle cx="0" cy="0" r="3" fill={colors.border} className="opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Node Label Text */}
        <text
          x="0"
          y="-3"
          textAnchor="middle"
          fill={colors.text}
          fontSize="11px"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {n.label.length > 18 ? n.label.substring(0, 16) + '..' : n.label}
        </text>

        {/* Sublabel inside node */}
        {n.sublabel && (
          <text
            x="0"
            y="9"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="9px"
            fontFamily="monospace"
          >
            {n.sublabel.length > 22 ? n.sublabel.substring(0, 20) + '..' : n.sublabel}
          </text>
        )}

        {/* Inline Type tag */}
        <rect
          x="-65"
          y="-18"
          width="12"
          height="12"
          rx="3"
          fill={colors.border}
          opacity="0.25"
        />
        <text
          x="-59"
          y="-9"
          textAnchor="middle"
          fill={colors.text}
          fontSize="8px"
          fontWeight="extrabold"
          fontFamily="monospace"
        >
          {n.type[0].toUpperCase()}
        </text>

        {/* Node Hover Tooltip/Label */}
        <title>{`${n.type}${n.originalNode.line ? ` (Line ${n.originalNode.line})` : ''}`}</title>
      </g>
    );

    // Render connecting edges
    n.children.forEach((child) => {
      renderList.edges.push(
        <path
          key={`${n.id}-${child.id}`}
          d={drawVerticalCurve(n.x, n.y, child.x, child.y)}
          fill="none"
          stroke={colors.border}
          strokeWidth="1.5"
          strokeOpacity="0.45"
          className="transition-all duration-200 group-hover:stroke-opacity-80"
        />
      );
      traverseRender(child);
    });
  };

  if (layoutRoot) {
    traverseRender(layoutRoot);
  }

  return (
    <div id="syntax-viewer-panel" className="flex flex-col gap-4">
      {/* Visual Header Control */}
      <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Hierarchical Grammar Inspector</span>
            <h4 className="text-sm font-bold text-slate-205 text-slate-200">Abstract Syntax Tree (AST) Nodes</h4>
          </div>
        </div>

        {/* View mode buttons switcher */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-lg text-slate-200">
          <button
            onClick={() => setViewMode('diagram')}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold py-1.5 px-3 rounded-md transition-all cursor-pointer ${
              viewMode === 'diagram'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" /> Direct Diagram
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 text-xs font-mono font-bold py-1.5 px-3 rounded-md transition-all cursor-pointer ${
              viewMode === 'cards'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Code Cards
          </button>
        </div>
      </div>

      {ast && ast.consequent && ast.consequent.length > 0 ? (
        viewMode === 'diagram' ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            {/* Left/Middle: SVG Diagram container */}
            <div className="xl:col-span-3 border border-slate-800 bg-slate-950/80 p-4 rounded-xl flex flex-col gap-2 relative">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-2 text-xs font-mono text-slate-400">
                <span>Interactive Parse Canvas</span>
                <span className="text-[10px] text-slate-500">Horizontal & Vertical scroll enabled • Click node to inspect details</span>
              </div>

              {/* Scrollable area wrapping SVG canvas */}
              <div className="w-full h-112 overflow-auto scrollbar-thin scrollbar-track-slate-950 scrollbar-thumb-slate-800 rounded-lg">
                <div style={{ width: `${treeWidth}px`, minHeight: '100%' }} className="flex justify-center items-start py-4">
                  <svg
                    width={treeWidth}
                    height={maxDepthY + 80}
                    className="overflow-visible selection:bg-transparent"
                  >
                    {/* Background Grid Lines to make it look like a technical schematic blueprint */}
                    <defs>
                      <pattern id="ast-blueprint-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(16,185,129,0.03)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#ast-blueprint-grid)" />

                    {/* Rendered connection curves */}
                    <g>{renderList.edges}</g>
                    {/* Rendered individual tree node widgets */}
                    <g>{renderList.nodes}</g>
                  </svg>
                </div>
              </div>
            </div>

            {/* Right: Selected Node Details Sidebar panel */}
            <div className="xl:col-span-1 border border-slate-800 bg-slate-950/80 p-4 rounded-xl flex flex-col gap-3 h-112 overflow-y-auto">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-850 pb-2 flex items-center justify-between sticky top-0 bg-slate-950 py-1">
                <span>Node Inspector</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded border border-slate-800 text-slate-500">
                  {selectedLayoutNode ? 'SELECTED' : 'BLANK'}
                </span>
              </h4>

              {selectedLayoutNode ? (
                <div className="flex flex-col gap-3 font-mono text-xs">
                  {/* Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getNodeColorGroup(selectedLayoutNode.type, false).border }}
                    />
                    <span className="font-bold text-slate-200">
                      {selectedLayoutNode.originalNode.type}
                    </span>
                  </div>

                  {/* Properties table */}
                  <div className="bg-slate-900 border border-slate-850 p-3 rounded-lg flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] border-b border-slate-850/50 pb-1.5">
                      <span className="text-slate-500">Node ID:</span>
                      <span className="text-slate-300 font-bold truncate max-w-[120px]">
                        {selectedLayoutNode.id}
                      </span>
                    </div>

                    {selectedLayoutNode.originalNode.name && (
                      <div className="flex items-center justify-between text-[11px] border-b border-slate-850/50 pb-1.5">
                        <span className="text-slate-500">Identifier Name:</span>
                        <span className="text-teal-400 font-bold">
                          '{selectedLayoutNode.originalNode.name}'
                        </span>
                      </div>
                    )}

                    {selectedLayoutNode.originalNode.value !== undefined && (
                      <div className="flex items-center justify-between text-[11px] border-b border-slate-850/50 pb-1.5">
                        <span className="text-slate-500">Literal Value:</span>
                        <span className="text-emerald-400 font-bold">
                          {selectedLayoutNode.originalNode.value.toString()}
                        </span>
                      </div>
                    )}

                    {selectedLayoutNode.originalNode.operator && (
                      <div className="flex items-center justify-between text-[11px] border-b border-slate-850/50 pb-1.5">
                        <span className="text-slate-500">Operator:</span>
                        <span className="text-amber-400 font-bold">
                          {selectedLayoutNode.originalNode.operator}
                        </span>
                      </div>
                    )}

                    {selectedLayoutNode.originalNode.dataType && (
                      <div className="flex items-center justify-between text-[11px] border-b border-slate-850/50 pb-1.5">
                        <span className="text-slate-500">Data Type:</span>
                        <span className="text-cyan-400 font-bold">
                          {selectedLayoutNode.originalNode.dataType}
                        </span>
                      </div>
                    )}

                    {selectedLayoutNode.originalNode.line && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Source Line:</span>
                        <span className="text-slate-400 font-bold bg-slate-950 px-1 rounded">
                          Line {selectedLayoutNode.originalNode.line}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Node AST representation details JSON */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Subtree JSON Node Structure:</span>
                    <pre className="p-3 bg-slate-900 border border-slate-850 text-[10px] leading-relaxed rounded-lg overflow-x-auto selection:bg-slate-850 text-slate-400 max-h-48 overflow-y-auto">
                      {JSON.stringify(
                        {
                          type: selectedLayoutNode.originalNode.type,
                          name: selectedLayoutNode.originalNode.name,
                          value: selectedLayoutNode.originalNode.value,
                          operator: selectedLayoutNode.originalNode.operator,
                          dataType: selectedLayoutNode.originalNode.dataType,
                          line: selectedLayoutNode.originalNode.line,
                          errorMessage: selectedLayoutNode.originalNode.errorMessage,
                          childrenCount: selectedLayoutNode.children.length
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-4 border border-dashed border-slate-800 rounded-lg text-slate-500">
                  <GitBranch className="w-8 h-8 opacity-25 mb-2 text-slate-400 animate-pulse" />
                  <p className="text-[11px] leading-normal font-mono">
                    Click any element circle on the left parse tree canvas to inspect its parsed attributes and child connections directly!
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div id="ast-canvas" className="border border-slate-800 bg-slate-950/80 p-5 rounded-xl text-slate-200 h-112 overflow-y-auto selection:bg-slate-800">
            <div className="flex flex-col gap-4">
              {ast.consequent.map((node, i) => (
                <ASTNodeCard key={node.id || i} node={node} level={0} />
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-500 font-mono text-sm">
          Empty syntax stream or parsing error detected in root.
        </div>
      )}
    </div>
  );
}

// Recursive AST Node display card
interface ASTNodeCardProps {
  key?: React.Key;
  node: ASTNode;
  level: number;
}

function ASTNodeCard({ node, level }: ASTNodeCardProps) {
  if (!node) return null;

  const [expanded, setExpanded] = useState<boolean>(true);

  // Styling based on node types
  const getNodeConfig = (type: string) => {
    switch (type) {
      case 'VariableDeclaration':
        return {
          bg: 'bg-emerald-950/30 border-emerald-500/20 hover:border-emerald-500/40',
          pill: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/35',
          label: 'Var Declaration',
          icon: '📥'
        };
      case 'Assignment':
        return {
          bg: 'bg-cyan-950/30 border-cyan-500/20 hover:border-cyan-500/40',
          pill: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/35',
          label: 'Assignment',
          icon: '💾'
        };
      case 'BinaryExpression':
        return {
          bg: 'bg-amber-955/30 bg-amber-905/10 border-amber-500/20 hover:border-amber-500/40',
          pill: 'bg-amber-500/10 text-amber-400 border-amber-500/35',
          label: 'Binary Op',
          icon: '🧮'
        };
      case 'IfStatement':
        return {
          bg: 'bg-violet-950/30 border-violet-500/20 hover:border-violet-500/40',
          pill: 'bg-violet-500/10 text-violet-400 border-violet-500/35',
          label: 'Control Flow',
          icon: '🌿'
        };
      case 'Identifier':
        return {
          bg: 'bg-rose-955/20 bg-rose-950/10 border-rose-500/15 hover:border-rose-500/30',
          pill: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
          label: 'Identifier',
          icon: '🔑'
        };
      case 'Literal':
        return {
          bg: 'bg-slate-950/50 border-slate-800 hover:border-slate-705',
          pill: 'bg-slate-900 border-slate-800 text-slate-300',
          label: 'Literal',
          icon: '💎'
        };
      case 'ErrorNode':
        return {
          bg: 'bg-rose-950/40 border-rose-500/50 animate-shake',
          pill: 'bg-rose-550/20 bg-rose-500/20 text-rose-400 border-rose-500/50',
          label: 'Parser Error',
          icon: '⚠️'
        };
      default:
        return {
          bg: 'bg-slate-900/40 border-slate-800',
          pill: 'bg-slate-900 border-slate-800 text-slate-400',
          label: type,
          icon: '📦'
        };
    }
  };

  const config = getNodeConfig(node.type);

  // Indent offsets style helper
  const indentOffset = { paddingLeft: `${Math.min(level * 16, 64)}px` };

  return (
    <div style={indentOffset} className="flex flex-col gap-1 w-full text-xs font-mono">
      {/* Node Row Header Box */}
      <div className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${config.bg}`}>
        <div className="flex items-center gap-2">
          <span className="text-sm select-none">{config.icon}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${config.pill}`}>
            {config.label}
          </span>

          {/* Node attributes rendering inside header row */}
          {node.name && (
            <span className="text-slate-200 font-bold bg-slate-950 border border-slate-850 py-0.5 px-2 rounded">
              {node.name}
            </span>
          )}

          {node.operator && (
            <span className="text-amber-400 font-extrabold bg-slate-950 border border-slate-850 py-0.5 px-2 rounded text-sm">
              {node.operator}
            </span>
          )}

          {node.value !== undefined && (
            <span className="text-emerald-300 font-mono font-bold bg-slate-950 border border-slate-850 py-0.5 px-2 rounded">
              val: {node.value.toString()}
            </span>
          )}

          {node.dataType && (
            <span className="text-slate-500 text-[10px]">
              Type: <code className="text-teal-400">{node.dataType}</code>
            </span>
          )}

          {node.line && (
            <span className="text-slate-600 text-[9px]">
              [Line {node.line}]
            </span>
          )}
        </div>

        {/* Collapsible toggle buttons or error statements */}
        <div className="flex items-center gap-2">
          {node.errorMessage && (
            <span className="text-[11px] text-rose-400 font-bold bg-rose-950/20 py-0.5 px-2 border border-rose-500/20 rounded">
              {node.errorMessage}
            </span>
          )}

          {/* Children indicator */}
          {(node.left || node.right || node.test || node.consequent || node.alternate) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] select-none text-slate-400 hover:text-slate-200 px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-bold hover:bg-slate-900 cursor-pointer"
            >
              {expanded ? '▲ Collapse' : '▼ Expand'}
            </button>
          )}
        </div>
      </div>

      {/* Children elements drawer rendering */}
      {expanded && (
        <div className="flex flex-col gap-1 border-l border-slate-850/60 pb-1 mt-1">
          {node.test && (
            <div className="flex flex-col">
              <span className="text-[9px] text-violet-500 uppercase tracking-widest pl-4 select-none mb-1 font-bold">↳ CONTEXT TEST EXPRESSION:</span>
              <ASTNodeCard node={node.test} level={level + 1} />
            </div>
          )}

          {node.left && (
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 pl-4 select-none mb-1 font-bold">↳ OPERAND LEFT NODE:</span>
              <ASTNodeCard node={node.left} level={level + 1} />
            </div>
          )}

          {node.right && (
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 pl-4 select-none mb-1 font-bold">↳ OPERAND RIGHT NODE:</span>
              <ASTNodeCard node={node.right} level={level + 1} />
            </div>
          )}

          {node.consequent && node.consequent.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-emerald-500 uppercase tracking-widest pl-4 select-none mb-1 font-bold">↳ THEN STATEMENT BLOCK ({node.consequent.length}):</span>
              {node.consequent.map((child, idx) => (
                <ASTNodeCard key={child.id || idx} node={child} level={level + 1} />
              ))}
            </div>
          )}

          {node.alternate && node.alternate.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-amber-500 uppercase tracking-widest pl-4 select-none mb-1 font-bold">↳ ELSE STATEMENT BLOCK ({node.alternate.length}):</span>
              {node.alternate.map((child, idx) => (
                <ASTNodeCard key={child.id || idx} node={child} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================
// SEMANTIC ANALYZER (PHASE 3) SUB-VIEWER
// =========================================================

interface SemanticVisualizerProps {
  semantic: any; // Checked types
}

function SemanticVisualizer({ semantic }: SemanticVisualizerProps) {
  const { passed, errors, symbolTable } = semantic;

  return (
    <div id="semantic-analyser-view" className="flex flex-col gap-6">
      {/* 1. Validation Banner */}
      <div className={`p-4 border rounded-xl flex items-center justify-between shadow-xl ${
        passed 
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
          : 'bg-rose-950/20 border-rose-500/30 text-rose-400'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${passed ? 'bg-emerald-500/10 border-emerald-550/20' : 'bg-rose-500/10 border-rose-550/20'}`}>
            {passed ? <CheckCircle className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <h4 id="semantic-status-heading" className="text-base font-bold tracking-tight">
              {passed ? 'Context Verification Passed!' : 'Type / Scope Diagnostics Failed'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {passed 
                ? 'Compiled successfully. Symbols references resolved and static types match.' 
                : 'Compiler error blocks code synthesis. Please review the variable declaration list.'
              }</p>
          </div>
        </div>
        <span className={`text-xs font-mono px-3 py-1 pb-1 px-3 border rounded-xl uppercase font-bold leading-none ${
          passed 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
        }`}>
          {passed ? 'STABLE' : 'CRITICAL'}
        </span>
      </div>

      {/* 2. Error/Warning Logs list if any */}
      {errors.length > 0 && (
        <div className="border border-slate-800 bg-slate-950/60 p-4 rounded-xl">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Diagnostics Error Log Console
          </h3>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {errors.map((err: any, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-3 ${
                  err.severity === 'error'
                    ? 'bg-rose-950/20 border-rose-500/20 text-rose-300'
                    : 'bg-amber-950/20 border-amber-500/20 text-amber-300'
                }`}
              >
                <span className={`px-2 py-0.5 rounded text-[9px] border font-bold ${
                  err.severity === 'error' 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-450' 
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-450'
                }`}>
                  {err.severity.toUpperCase()}
                </span>
                <div className="flex-1">
                  <span className="text-slate-400 mr-2">[L:{err.line}]</span>
                  {err.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Symbol Table Display */}
      <div className="border border-slate-800 bg-slate-950/80 p-5 rounded-xl flex flex-col gap-3 shadow-inner">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Symbol Table ledger Scope
          </span>
          <span className="text-[10px] text-slate-500">
            Memory Allocation Map
          </span>
        </h3>

        <div className="overflow-x-auto rounded-lg border border-slate-850">
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-500 sticky top-0 uppercase text-[10px] border-b border-slate-850">
              <tr>
                <th className="py-2.5 px-3">Variable Name</th>
                <th className="py-2.5 px-3">Static Type</th>
                <th className="py-2.5 px-3">Declaration</th>
                <th className="py-2.5 px-3">Active Scope</th>
                <th className="py-2.5 px-3">Line Index</th>
                <th className="py-2.5 px-3 text-center">Mutated</th>
                <th className="py-2.5 px-3 text-right">Usage Reads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {symbolTable.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Symbol stream empty. Declare a variable in code.
                  </td>
                </tr>
              ) : (
                symbolTable.map((sym: any) => (
                  <tr key={sym.name} className="hover:bg-slate-950/40 border-l border-l-transparent hover:border-l-emerald-500">
                    <td className="py-2.5 px-3 font-bold text-slate-205 text-slate-200">{sym.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-teal-400 font-bold bg-slate-950/80 py-0.5 px-2 rounded border border-slate-800">
                        {sym.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-xs text-slate-400 font-bold">{sym.declarationType}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850 text-[10.5px]">
                        {sym.scope}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{sym.line}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sym.isMutated 
                          ? 'bg-amber-950/30 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {sym.isMutated ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 font-bold pr-5">{sym.references}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// INTERMEDIATE CODE GENERATOR (PHASE 4) SUB-VIEWER
// =========================================================

interface IntermediateCodeVisualizerProps {
  tac: any[];
  code: string;
}

function IntermediateCodeVisualizer({ tac, code }: IntermediateCodeVisualizerProps) {
  return (
    <div id="tac-viewer-view" className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Source code on Left */}
        <div className="border border-slate-800 bg-slate-950/80 p-4 rounded-xl flex flex-col h-112 overflow-hidden shadow-inner">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" /> Source Input
          </h3>
          <div className="flex-1 overflow-y-auto">
            <pre className="font-mono text-xs leading-relaxed text-slate-400">
              <code>
                {code.split('\n').map((lineText, idx) => (
                  <div key={idx} className="flex gap-4 hover:bg-slate-950/40 px-2 rounded -mx-2 h-[1.5rem]">
                    <span className="text-slate-650 text-slate-600 select-none w-5 text-right font-medium">{idx + 1}</span>
                    <span className="whitespace-pre overflow-x-auto text-slate-300">{lineText}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>

        {/* Generated TAC on Right */}
        <div className="border border-slate-855 border-slate-800 bg-slate-955 bg-slate-950/60 p-4 rounded-xl flex flex-col h-112 overflow-hidden relative">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4 flex items-center gap-1.5 justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Synthesized Three-Address Code
            </span>
            <span className="text-[10px] font-mono select-none px-2 py-0.5 rounded bg-slate-900 text-slate-400">
              Regs: t0 - tXX
            </span>
          </h3>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 rounded-lg pr-1">
            {tac.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-mono text-sm">
                No TAC instructions generated.
              </div>
            ) : (
              tac.map((inst, index) => {
                const isLabel = inst.op === 'label';
                const isBranch = inst.op === 'iffalse';

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border font-mono text-xs flex flex-col gap-1.5 transition-all ${
                      isLabel
                        ? 'bg-violet-950/25 border-violet-500/20 text-violet-350'
                        : isBranch
                        ? 'bg-amber-955/20 border-amber-550/20 border-amber-500/20 text-amber-300'
                        : 'bg-slate-950 border-slate-850 hover:border-slate-800 hover:bg-slate-950/80 text-emerald-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-550 text-slate-500 select-none text-[10px] font-medium bg-slate-900 border border-slate-800 px-1 rounded">
                          S{index + 1}
                        </span>
                        <span>
                          {isLabel && (
                            <span className="text-violet-400">{inst.result}:</span>
                          )}
                          {inst.op === '=' && (
                            <span>
                              {inst.result} <span className="text-teal-400">=</span> {inst.arg1}
                            </span>
                          )}
                          {['+', '-', '*', '/'].includes(inst.op || '') && (
                            <span>
                              {inst.result} <span className="text-teal-400">=</span> {inst.arg1} <span className="text-amber-400 font-extrabold">{inst.op}</span> {inst.arg2}
                            </span>
                          )}
                          {['>', '<', '==', '!=', '<=', '>='].includes(inst.op || '') && (
                            <span>
                              {inst.result} <span className="text-teal-400">=</span> {inst.arg1} <span className="text-amber-400 font-extrabold">{inst.op}</span> {inst.arg2}
                            </span>
                          )}
                          {isBranch && (
                            <span>
                              <span className="text-rose-400 uppercase font-bold">ifFalse</span> {inst.arg1} <span className="text-rose-450 text-rose-400 uppercase font-bold">goto</span> {inst.result}
                            </span>
                          )}
                          {inst.op === 'declare' && (
                            <span>
                              <span className="text-blue-400">declare</span> {inst.result} <span className="text-slate-400 font-bold">[{inst.arg1}]</span>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {inst.annotation && (
                      <p className="text-[10.5px] text-slate-450 text-slate-400 leading-normal italic pl-6 border-l border-slate-800 select-none">
                        ↳ {inst.annotation}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// CODE OPTIMIZATION (PHASE 5) SUB-VIEWER
// =========================================================

interface OptimizationVisualizerProps {
  optimizations: any[];
  original: any[];
  optimized: any[];
}

function OptimizationVisualizer({ optimizations, original, optimized }: OptimizationVisualizerProps) {
  const getTacAsmStyleText = (tacList: any[]): string => {
    return tacList.map((inst, index) => {
      if (inst.op === 'label') return `${inst.result}:`;
      if (inst.op === '=') return `${inst.result} = ${inst.arg1}`;
      if (['+', '-', '*', '/'].includes(inst.op || '')) return `${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`;
      if (['>', '<', '==', '!='].includes(inst.op || '')) return `${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`;
      if (inst.op === 'iffalse') return `ifFalse ${inst.arg1} goto ${inst.result}`;
      if (inst.op === 'declare') return `declare ${inst.result} [${inst.arg1}]`;
      return '';
    }).filter(v => v !== '').join('\n');
  };

  return (
    <div id="optimization-viewer-panel" className="flex flex-col gap-6">
      {/* Dynamic reduction stats card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-1 items-center justify-center text-center">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Raw Instruction Volume</span>
          <span className="text-2xl font-mono font-bold text-slate-300">{original.length} TAC</span>
        </div>
        <div className="bg-emerald-950/10 border border-emerald-500/25 rounded-xl p-4 flex flex-col gap-1 items-center justify-center text-center relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/5 rounded-full blur-xl" />
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Optimized Output</span>
          <span className="text-2xl font-mono font-bold text-emerald-400">{optimized.length} TAC</span>
        </div>
        <div className="bg-teal-950/15 border border-teal-500/25 rounded-xl p-4 flex flex-col gap-1 items-center justify-center text-center">
          <span className="text-[10px] font-mono text-teal-400 uppercase font-bold">Code Reduction Ratio</span>
          <span className="text-2xl font-mono font-bold text-teal-300">
            {original.length > 0
              ? `${Math.round(((original.length - optimized.length) / original.length) * 100)}%`
              : '0%'
            }
          </span>
        </div>
      </div>

      {/* Side-by-Side scrolling text blocks comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="border border-slate-800 bg-slate-955 bg-slate-950/65 p-4 rounded-xl flex flex-col">
          <h4 className="text-xs font-mono font-bold text-slate-400 border-b border-slate-800 pb-2 mb-3">Pre-Optimization TAC Block</h4>
          <pre className="font-mono text-xs leading-relaxed text-slate-500 overflow-x-auto min-h-32 whitespace-pre">
            <code>{getTacAsmStyleText(original)}</code>
          </pre>
        </div>
        <div className="border border-slate-500/30 bg-emerald-950/5 p-4 rounded-xl flex flex-col relative group">
          <div className="absolute top-2 right-2 text-emerald-400 opacity-60">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-mono font-bold text-emerald-400 border-b border-slate-850 pb-2 mb-3">Optimized Compiled TAC Block</h4>
          <pre className="font-mono text-xs leading-relaxed text-emerald-300 overflow-x-auto min-h-32 whitespace-pre">
            <code>{getTacAsmStyleText(optimized) || '// Pruned fully into static declarations'}</code>
          </pre>
        </div>
      </div>

      {/* List of Applied Optimization Passes */}
      <div className="border border-slate-805 border-slate-800 bg-slate-950/60 p-5 rounded-xl">
        <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2.5 mb-3.5 flex items-center gap-1.5 font-bold">
          <Zap className="w-4 h-4 text-emerald-400 animate-bounce" /> Optimization Transformation Log ({optimizations.length})
        </h3>

        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
          {optimizations.length === 0 ? (
            <div className="text-center py-12 text-slate-505 font-mono text-slate-500 text-xs">
              Adherent checklist: No expressions were eligible for mathematical folding or dead code pruning in this source iteration.
            </div>
          ) : (
            optimizations.map((step, idx) => (
              <div key={idx} className="bg-slate-950/80 hover:bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono transition-colors">
                <div className="flex-1 flex flex-col gap-1">
                  <span className="font-bold text-emerald-400 text-[10.5px] uppercase bg-emerald-500/5 border border-emerald-500/10 py-0.5 px-2 rounded w-fit select-none">
                    {step.type}
                  </span>
                  <p className="text-slate-300 font-medium text-[11px] leading-relaxed mt-1">
                    {step.explanation}
                  </p>
                </div>

                {/* Before and after panel transformation pills */}
                <div className="flex items-center gap-3 shrink-0 select-none">
                  <div className="bg-slate-900 border border-slate-800 py-1.5 px-2.5 rounded text-slate-450 text-slate-500">
                    {step.before}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />
                  <div className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 py-1.5 px-2.5 rounded font-bold">
                    {step.after}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// TARGET CODE GENERATOR (PHASE 6) SUB-VIEWER
// =========================================================

interface AssemblyVisualizerProps {
  assembly: any[];
}

function AssemblyVisualizer({ assembly }: AssemblyVisualizerProps) {
  return (
    <div id="assembly-view-panel" className="flex flex-col gap-5">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Assembly Code Panel - 8 columns */}
        <div className="xl:col-span-8 border border-slate-800 bg-slate-950/80 rounded-xl p-4 flex flex-col shadow-inner">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" /> High-Level x86-64 Machine Instructions
          </h3>

          <div className="max-h-128 overflow-y-auto pr-1">
            <code id="assembly-code-editor" className="block text-left font-mono text-xs leading-relaxed selection:bg-slate-800 text-slate-300">
              {assembly.map((line: any, idx: number) => {
                const isCommentOnly = !line.label && !line.instruction && line.comment;
                
                return (
                  <div key={idx} className="flex gap-4 hover:bg-slate-950/50 py-1 px-2 rounded -mx-2">
                    <span className="text-slate-650 text-slate-600 select-none w-6 text-right font-medium">{idx + 1}</span>
                    
                    {isCommentOnly ? (
                      <span className="text-slate-550 text-slate-550 text-emerald-600 font-semibold italic whitespace-pre">
                        {line.comment}
                      </span>
                    ) : (
                      <div className="flex-1 flex flex-col md:flex-row md:items-start justify-between gap-1">
                        {/* Instruction mnemonic and targets label */}
                        <div className="whitespace-pre flex-1">
                          {line.label && (
                            <span className="text-violet-400 font-bold block md:inline md:mr-2">
                              {line.label}:
                            </span>
                          )}
                          {line.instruction && (
                            <span className="text-teal-400 font-bold mr-3 inline-block w-20">
                              {line.instruction}
                            </span>
                          )}
                          {line.operands && (
                            <span className="text-slate-205 text-slate-100 font-semibold">
                              {line.operands}
                            </span>
                          )}
                        </div>

                        {/* Right inline comments */}
                        {line.comment && (
                          <span className="text-slate-550 text-slate-500 italic max-w-sm text-[11px] select-none text-left md:text-right border-t md:border-t-0 border-slate-850 pt-0.5 md:pt-0">
                            # {line.comment}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </code>
          </div>
        </div>

        {/* Educator Register/Instruction Dictionary panel - 4 columns */}
        <div className="xl:col-span-4 border border-slate-800 bg-slate-950/50 rounded-xl p-4 flex flex-col gap-4">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 font-bold flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Computer Architecture Dictionary
          </h4>

          {/* Mnemonic definitions */}
          <div className="flex flex-col gap-3">
            <h5 className="text-[11px] font-mono text-emerald-400 uppercase font-bold tracking-wider">Instruction Set Mnemonics:</h5>
            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-teal-400 font-bold">mov dst, src</span>
                  <span className="text-[10px] text-slate-500">Data Transfer</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Copies a value or memory address reference from <code className="text-teal-400">src</code> location to <code className="text-teal-400">dst</code> register/RAM slot. x86-64 parameters cannot move memory-to-memory directly.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-teal-400 font-bold">cmp op1, op2</span>
                  <span className="text-[10px] text-slate-500">Logical comparison</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Evaluates subtraction flags of <code className="text-teal-400">op1 - op2</code> without changing register counts to populate branch conditions.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-850 p-2.5 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-teal-400 font-bold">add / sub / imul</span>
                  <span className="text-[10px] text-slate-500">Arithmetic</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Triggers core CPU ALU logical nodes containing adder switches to recalculate register metrics statically.
                </p>
              </div>
            </div>
          </div>

          {/* Active register reference definition */}
          <div className="flex flex-col gap-3 mt-1.5">
            <h5 className="text-[11px] font-mono text-emerald-400 uppercase font-bold tracking-wider">Common CPU Registers:</h5>
            <div className="flex flex-col gap-1.5 font-mono text-xs text-slate-400">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-205 text-slate-200 font-bold bg-slate-900 border border-slate-850 px-1.5 font-mono rounded">eax</span>
                <span className="text-[11px] text-left flex-1 text-slate-400">Primary accumulator register. Often stores function return codes.</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-205 text-slate-200 font-bold bg-slate-900 border border-slate-850 px-1.5 font-mono rounded">rbp</span>
                <span className="text-[11px] text-left flex-1 text-slate-400">Base register. Anchors the call frame pointer to trace offset references.</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-205 text-slate-200 font-bold bg-slate-900 border border-slate-850 px-1.5 font-mono rounded">rsp</span>
                <span className="text-[11px] text-left flex-1 text-slate-400">Stack pointer. References top index array of current program loop execution parameters.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper descriptions for each compiler stage
function getPhaseDescription(pId: number): string {
  switch (pId) {
    case 1:
      return 'The Scanner scans high-level characters into a sequence of atomic token structures categorized using regular expressions (regex).';
    case 2:
      return 'The Parser validates tokens against programmatic context-free grammars (CFG) and builds an Abstract Syntax Tree (AST).';
    case 3:
      return 'The context semantic checker maps symbols into scopes, ensuring safety against undeclared variables or constant reassignments.';
    case 4:
      return 'Generates Three-Address Code (TAC), a simplified machine-independent intermediate language optimizing expression execution.';
    case 5:
      return 'Applies constant folding, propagation, and dead code pruning strategies directly in the machine-independent IR flow.';
    case 6:
      return 'Translates fully optimized Three-Address Code into hardware and register instructions aligned with physical x86 standard specifications.';
    default:
      return '';
  }
}
