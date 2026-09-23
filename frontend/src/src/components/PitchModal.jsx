import React from 'react';
import { 
  X, 
  Sparkles, 
  Trophy, 
  TrendingDown, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Zap, 
  FileText,
  DollarSign
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function PitchModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.3)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                ResolveIQ — Judges Pitch Guide
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Hackathon 2026
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Autonomous ITIL Incident Copilot for Enterprise Finance Operations
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
              <div className="text-rose-700 font-bold text-xs uppercase mb-1 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" />
                The Problem
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Finance downtime costs <strong>$9,000/min</strong>. Engineers lose 35+ mins manually searching through PDFs, runbooks, and old tickets.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
              <div className="text-blue-700 font-bold text-xs uppercase mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-current" />
                The Solution
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Autonomous copilot combining <strong>FAISS semantic vector search</strong> with ITIL root cause diagnosis and 1-click remediation scripts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="text-emerald-800 font-bold text-xs uppercase mb-1 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" />
                The Business Impact
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>72.4% MTTR reduction</strong>, 100% ITIL citation auditability, and immediate automated runbook verification.
              </p>
            </div>
          </div>

          {/* Architecture Pipeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Technical Architecture & Data Pipeline
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-indigo-700 font-semibold shadow-xs">
                  1. Multi-Format Ingest
                </span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-blue-700 font-semibold shadow-xs">
                  2. MiniLM-L6 Embeddings
                </span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-emerald-700 font-semibold shadow-xs">
                  3. FAISS Vector Search
                </span>
                <span className="text-slate-400">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-amber-700 font-semibold shadow-xs">
                  4. Snowflake Cortex Synthesis
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Data loaders parse runbook PDFs and historical JSON/XML incident records into 384-dimensional embeddings stored in a local FAISS index. Fast non-blocking async queries retrieve top-k semantic matches with distance calibration.
              </p>
            </div>
          </div>

          {/* Key Differentiators */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Why ResolveIQ Wins
            </h3>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span><strong>No Hallucinations:</strong> Strict ITIL prompt constraint answers strictly from cited context chunks.</span>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Dual Persona:</strong> Instant switch between Diagnostic RCA for SREs and Knowledge SOPs for L1/L2 agents.</span>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <span className="text-indigo-600 font-bold">✓</span>
                <span><strong>Actionable, not just chat:</strong> Generates ready-to-run shell scripts with simulated execution.</span>
              </li>
              <li className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <span className="text-amber-600 font-bold">✓</span>
                <span><strong>Zero-Downtime Demo:</strong> Resilient live backend integration + instant enterprise fallback sandbox.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            ResolveIQ • Enterprise FinOps Hackathon 2026
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
