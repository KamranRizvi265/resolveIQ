import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  BookOpen,
  Sliders,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Command
} from 'lucide-react';
import { sound } from '../utils/audio';

const DIAGNOSTIC_EXAMPLES = [
  "Find similar incidents for error code OMS-4402",
  "What patterns exist for FI-GL-007 GL reconciliation breaks?",
  "Root cause analysis for ServiceNow Jira bridge sync failures",
];

const KNOWLEDGE_EXAMPLES = [
  "How do I fix ERP payment interface timeout error PI-1234?",
  "What is the runbook for OMS order stuck in Pending Payment?",
  "Steps to resolve CRM customer master sync failure CRM-SYNC-901",
];

export default function SearchConsole({
  query,
  setQuery,
  mode,
  setMode,
  topK,
  setTopK,
  onSearch,
  isLoading,
  diagnosticStep
}) {
  const [showConfig, setShowConfig] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        sound.playClick();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    sound.playDiagnosticPulse();
    onSearch();
  };

  const PIPELINE_STEPS = [
    { id: 1, label: "1. Vectorizing Query" },
    { id: 2, label: "2. Searching FAISS Index" },
    { id: 3, label: "3. Correlating Context" },
    { id: 4, label: "4. Synthesizing Action Plan" },
  ];

  return (
    <div className="w-full relative">
      <div className="glass-panel-elevated rounded-3xl p-5 sm:p-7 relative overflow-hidden transition-all duration-300">


        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.75 overflow-hidden rounded-t-3xl pointer-events-none">
            <div className="w-1/2 h-full bg-linear-to-r from-transparent via-cyan-400 to-blue-600 blur-[1px] animate-laser-scan shadow-[0_0_12px_#38bdf8]"></div>
          </div>
        )}


        <div className="flex flex-wrap items-center justify-between gap-3 mb-4.5">

          {/* Dual Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode('diagnostic');
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${mode === 'diagnostic'
                ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Diagnostic Mode (RCA)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setMode('knowledge');
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer ${mode === 'knowledge'
                ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Knowledge Mode (Runbook SOP)</span>
            </button>
          </div>

          {/* Top-K Config Trigger */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setShowConfig(!showConfig);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${showConfig
                ? 'bg-blue-50/90 border-blue-300 text-blue-700 shadow-xs'
                : 'bg-white/80 hover:bg-slate-50 border-slate-200/90 text-slate-700 hover:text-slate-900 shadow-xs'
                }`}
            >
              <Sliders className="w-3.5 h-3.5 text-blue-600" />
              <span>Vector Depth: <strong className="text-blue-700 font-bold">{topK} Sources</strong></span>
            </button>
          </div>
        </div>

        {/* Collapsible Config Slider */}
        {showConfig && (
          <div className="mb-4.5 p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 flex flex-wrap items-center justify-between gap-4 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-center gap-3.5">
              <span className="text-xs font-bold text-slate-700">FAISS Top-K Sources:</span>
              <input
                type="range"
                min="1"
                max="10"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-40 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs font-extrabold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                {topK} sources
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Controls semantic nearest neighbor retrieval depth
            </span>
          </div>
        )}

        {/* Search Input Form */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex items-center">

            <div className="absolute left-4.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5 text-blue-600" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask ResolveIQ or describe an incident (e.g. Payment gateway handshake timeout, GL balance mismatch)..."
              disabled={isLoading}
              className="w-full pl-12 pr-44 py-4 bg-slate-50/80 hover:bg-white focus:bg-white text-slate-900 placeholder-slate-400 text-sm sm:text-base rounded-2xl border border-slate-200/90 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all duration-200 shadow-inner font-sans"
            />

            {/* Right inside actions: Keyboard shortcut + Resolve button */}
            <div className="absolute right-2.5 flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-200/60 border border-slate-300/60 text-[10px] font-mono font-semibold text-slate-500 pointer-events-none">
                <span>Ctrl</span>
                <span>+</span>
                <span>K</span>
              </div>

              <button
                type="submit"
                disabled={!query.trim() || isLoading}
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Resolving...</span>
                  </>
                ) : (
                  <>
                    <span>Resolve</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Example Queries */}
        <div className="mt-4">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mb-2.5">
            <Sparkles className={`w-3.5 h-3.5 ${mode === 'diagnostic' ? 'text-blue-500' : 'text-indigo-500'}`} />
            Example queries
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {(mode === 'diagnostic' ? DIAGNOSTIC_EXAMPLES : KNOWLEDGE_EXAMPLES).map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setQuery(prompt);
                }}
                className={`px-4 py-3 rounded-xl bg-white/90 border border-slate-200/80 text-slate-600 text-sm font-medium text-center transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs hover:-translate-y-0.5 ${mode === 'diagnostic'
                    ? 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300'
                    : 'hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300'
                  }`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline Progress (Displays when loading) */}
        {isLoading && (
          <div className="mt-5 pt-4.5 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700 mb-2.5">
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Analyzing Incident with AI & FAISS Vector Store...
              </span>
              <span className="text-slate-500 font-mono">Step {diagnosticStep} of 4</span>
            </div>

            {/* Glowing Gradient Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3.5 p-0.5 border border-slate-200/60">
              <div
                className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-400 transition-all duration-300 ease-out rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                style={{ width: `${(diagnosticStep / 4) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PIPELINE_STEPS.map((step) => {
                const isDone = diagnosticStep > step.id;
                const isCurrent = diagnosticStep === step.id;
                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${isDone
                      ? 'bg-emerald-50/90 border-emerald-300/80 text-emerald-800 shadow-xs'
                      : isCurrent
                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-md shadow-blue-500/15 animate-pulse'
                        : 'bg-slate-50 border-slate-200/80 text-slate-400'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-blue-600 animate-ping' : 'bg-slate-300'}`}></span>
                      )}
                      <span className="truncate">{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
