/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, HelpCircle, Code, Cpu, BookOpen } from 'lucide-react';
import { LANGUAGE_EXAMPLES } from '../types';

interface CodeInputAreaProps {
  onCompile: (code: string, language: string) => void;
  isLoading: boolean;
}

export default function CodeInputArea({ onCompile, isLoading }: CodeInputAreaProps) {
  const [selectedLang, setSelectedLang] = useState<string>('javascript');
  const [code, setCode] = useState<string>(LANGUAGE_EXAMPLES.javascript);
  const [showTips, setShowTips] = useState<boolean>(true);

  // Load sample code whenever selection switches
  useEffect(() => {
    setCode(LANGUAGE_EXAMPLES[selectedLang]);
  }, [selectedLang]);

  const handleCompile = () => {
    onCompile(code, selectedLang);
  };

  const handleReset = () => {
    setCode(LANGUAGE_EXAMPLES[selectedLang]);
  };

  const linesCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(linesCount, 1) }, (_, i) => i + 1);

  return (
    <div id="code-input-area" className="flex flex-col gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden group">
      {/* Decorative backing glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
            <Code id="header-code-icon" className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 id="header-title" className="text-lg font-bold text-slate-100 tracking-tight">Source Code Workspace</h2>
            <p id="header-subtitle" className="text-xs text-slate-400">Edit or paste control structures to trigger compilation</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language selection dropdown menu */}
          <div className="flex items-center gap-1.5">
            <label id="lang-label" htmlFor="lang-select" className="text-xs font-mono text-slate-400 uppercase tracking-widest">Dialect:</label>
            <select
              id="lang-select"
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-slate-950/80 border border-slate-700/80 text-emerald-400 text-sm font-mono py-1 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/50 hover:border-slate-600 transition-colors"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python 3</option>
              <option value="c">C-Language</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            id="reset-code-btn"
            onClick={handleReset}
            title="Reset code to default example"
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition-all flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Space */}
      <div className="relative flex border border-slate-800 rounded-lg overflow-hidden bg-slate-950 font-mono text-sm leading-relaxed shadow-inner">
        {/* Editor Line Numbers gutter */}
        <div id="editor-gutter" className="select-none py-4 text-slate-600 text-right pr-3 pl-3 bg-slate-950 border-r border-slate-800/60 flex flex-col items-end min-w-[3rem]">
          {lineNumbers.map((num) => (
            <div key={num} className="h-[1.5rem] text-xs font-medium">
              {num}
            </div>
          ))}
        </div>

        {/* Text Area Code Entry */}
        <textarea
          id="editor-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full flex-1 bg-transparent py-4 px-4 text-emerald-300 focus:outline-none font-mono resize-none h-64 overflow-y-auto leading-[1.5rem] selection:bg-emerald-500/20 selection:text-emerald-300"
          placeholder="// Paste high-level code structure here..."
        />
      </div>

      {/* Quick Tips Box */}
      {showTips && (
        <div id="quick-tips-panel" className="bg-slate-950/60 border border-slate-850 p-3 rounded-lg flex gap-2.5 items-start text-xs text-slate-300">
          <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-slate-100">Pedagogical Tips:</span> Try introducing semantic errors to see how the compiler complains! For instance:
            <ul className="list-disc list-inside mt-0.5 text-slate-400 space-y-0.5">
              <li>Re-assign <code className="bg-slate-900 border border-slate-800 text-emerald-400 px-1 py-0.2 rounded font-mono">count = 10;</code> (which is declared as a constant in JavaScript & C)</li>
              <li>Reference undefined variables like <code className="bg-slate-900 border border-slate-800 text-emerald-400 px-1 py-0.2 rounded font-mono">y = rate + x;</code> without declaring it first</li>
              <li>Re-declare a duplicate variable inside the same global scope to trigger symbol table blocks.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Action Compiler Button */}
      <button
        id="trigger-compile-btn"
        onClick={handleCompile}
        disabled={isLoading}
        className="w-full text-center py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-950/30 transition-all font-mono tracking-wider"
      >
        <Play className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'ANALYZING CODE CHANNELS...' : 'VISUALIZE COMPILER PHASES 🚀'}
      </button>
    </div>
  );
}
