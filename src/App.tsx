/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { compileCodePipeline } from "./compilerEngine";
import { CompilerResult, LANGUAGE_EXAMPLES } from "./types";
import CodeInputArea from "./components/CodeInputArea";
import PhaseDisplay from "./components/PhaseDisplay";
import AdPlaceholder from "./components/AdPlaceholder";
import {
  GraduationCap,
  BookOpen,
  Layers,
  HelpCircle,
  ChevronRight,
  CheckCircle,
  BrainCircuit,
} from "lucide-react";

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<string>("javascript");
  const [currentCode, setCurrentCode] = useState<string>(
    LANGUAGE_EXAMPLES.javascript,
  );
  const [compilerResult, setCompilerResult] = useState<CompilerResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showHelperExplanation, setShowHelperExplanation] =
    useState<boolean>(true);

  // Trigger compilation pipeline
  const handleCompile = (code: string, language: string) => {
    setIsLoading(true);
    setCurrentCode(code);
    setCurrentLanguage(language);

    // Simulate instant compilation parsing with a tiny educational spinner timeout
    setTimeout(() => {
      try {
        const result = compileCodePipeline(code, language);
        setCompilerResult(result);
      } catch (err) {
        console.error("Core compilation crash:", err);
      } finally {
        setIsLoading(false);
      }
    }, 450);
  };

  // Compile default sample code on mounting to populate initial results
  useEffect(() => {
    handleCompile(LANGUAGE_EXAMPLES.javascript, "javascript");
  }, []);

  return (
    <div
      id="app-root-container"
      className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-16 selection:bg-emerald-500/30 selection:text-emerald-300"
    >
      {/* 1. Global Navigation/Header */}
      <header
        id="app-navbar"
        className="bg-slate-900/80 backdrop-blur-md border-b border-slate-850/60 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-950/20">
              <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-100">
                  Compiler Desin implemetation Visualiser
                </h1>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded-full font-bold">
                  V1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Compiler Phase & Assembly Visualizer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950 border border-slate-850 py-1.5 px-3 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 inline-block" />
              Runtime: Client-Side Simulator
            </div>

            <button
              onClick={() => setShowHelperExplanation(!showHelperExplanation)}
              className="text-xs bg-slate-800 hover:bg-slate-705 text-slate-300 border border-slate-700 py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showHelperExplanation ? "Hide Guide" : "Learn Compilers"}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col gap-8">
        {/* Short educational introduction overlay */}
        {showHelperExplanation && (
          <div
            id="guide-banner"
            className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-gradient-to-r from-slate-900 to-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden shadow-2xl"
          >
            {/* Ambient decorative glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="md:col-span-8 flex flex-col justify-center gap-2 z-10">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" /> Computer Science Pedagogy
                Primer
              </span>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                How does a Compiler process source code?
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Compilers don't just translate code in one big step. They
                execute an elegant, sequential engineering pipeline dividing
                translation into multiple{" "}
                <strong>Frontend and Backend Phases</strong>. Start with
                high-level code, map its grammatical representation into
                Intermediate structures, optimize variable usage, and synthesize
                native machine language instructions!
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 text-xs font-mono text-slate-450 text-slate-400 z-10">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-400 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">
                  1
                </span>
                <span>
                  <strong>Frontend:</strong> Lexical & Syntax logic matches
                  Grammar.
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-emerald-500/10 text-emerald-400 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]">
                  2
                </span>
                <span>
                  <strong>Analysis:</strong> Scope bounds & symbols are
                  validated.
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-emerald-500/10 text-emerald-400 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px]/10">
                  3
                </span>
                <span>
                  <strong>Backend:</strong> Assembly code is synthesized &
                  optimized.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Leaderboard Ad Slot */}
        <AdPlaceholder type="leaderboard" id="header-leaderboard" />

        {/* Form and Workspace */}
        <div className="grid grid-cols-1 gap-8">
          {/* Top Panel Code Input Text Area */}
          <CodeInputArea onCompile={handleCompile} isLoading={isLoading} />

          {/* Bottom Panel Interactive Phases Display */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mt-4">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h3 className="text-md font-bold text-slate-201 text-slate-200 tracking-tight">
                Pipeline Visualization Stage Panel
              </h3>
            </div>

            <PhaseDisplay compilerResult={compilerResult} code={currentCode} />
          </div>
        </div>

        {/* 3. Detailed Computer Science Reference Block */}
        <div
          id="cs-primer-deck"
          className="mt-8 border border-slate-850 bg-slate-900/40 p-6 rounded-2xl flex flex-col gap-6"
        >
          <div className="border-b border-slate-800 pb-3 flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Study Guide: Understanding Compiler Phases
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quick references to core lexical architectures and logic
                representations
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  Automated Scanning
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Regex Logic
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-205 text-slate-200">
                Regular Expressions vs. Context-Free Grammars
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                <strong>Lexical analyzers</strong> represent token patterns
                (numbers, keywords, variables) using regular expressions
                (Regex), which are processed as Deterministic Finite Automata
                (DFA). <strong>Syntax analyzers</strong> require recursive,
                nested tree shapes representable only through richer
                Context-Free Grammars (CFG) using pushdown automata models.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  Intermediate Code
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Optimizers
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-205 text-slate-200">
                The Power of Three-Address Code (TAC)
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                Three-Address Code (TAC) divides complicated mathematical
                equations down to operations with a maximum of three addresses
                (two operands and a target result, e.g.,{" "}
                <code className="text-emerald-400 font-mono text-[11px] bg-slate-900 border border-slate-800 py-0.2 px-1 rounded">
                  t1 = a * b
                </code>
                ). This standard linearized structure makes it extremely simple
                for software optimization compilers to apply math reductions,
                fold constants, or delete dead code loops before mapping code to
                hardware registers.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl flex flex-col gap-2 md:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  CPU Alignment
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Hardware Allocation
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-205 text-slate-200">
                Assembler stack frames & registries mapping
              </h4>
              <p className="text-xs text-slate-400 leading-normal">
                When compiling optimized intermediate code to final assembly
                code, compilers map virtual variable coordinates into physical
                RAM locations (stack frames mapped to{" "}
                <code className="text-emerald-300 font-mono text-[11.5px]">
                  rbp
                </code>
                ) or load values directly into high-speed CPU caches called
                registers (e.g.,{" "}
                <code className="text-emerald-300 font-mono text-[11px]">
                  eax
                </code>
                ). Register allocation utilizes graphs to track lifetime
                intersects, fitting countless expressions inside physical
                hardware limits.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Mini Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-850 text-center text-xs text-slate-500 select-none">
        <p>
          LexiParse Interactive Computer Science Visualizer. Created for
          students and educators interested in lexical engines and grammar
          parsing.
        </p>
      </footer>
    </div>
  );
}
