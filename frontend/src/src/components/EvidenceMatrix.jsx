import React, { useState } from 'react';
import {
  Database,
  Layers,
  CheckCircle2,
  Sparkles,
  Filter,
  FileText
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function EvidenceMatrix({ sources, highlightedSourceId }) {
  const [filter, setFilter] = useState('ALL');

  if (!sources || sources.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-8 border border-slate-200/80 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-3 border border-blue-100/80 shadow-xs">
          <Database className="w-6 h-6 text-blue-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 font-sans">No Vector Sources Retrieved</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Submit an incident query or pick a scenario above to search the FAISS vector repository.
        </p>
      </div>
    );
  }

  const filteredSources = sources.filter((s) => {
    if (filter === 'RUNBOOK') return s.text.toLowerCase().includes('runbook') || (s.type && s.type.toLowerCase().includes('runbook'));
    if (filter === 'TICKET') return s.text.toLowerCase().includes('ticket') || s.text.toLowerCase().includes('snow') || (s.type && s.type.toLowerCase().includes('ticket'));
    return true;
  });

  return (
    <div className="w-full space-y-3.5">
      {/* Evidence Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-blue-100 text-blue-700 shadow-2xs">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 font-sans tracking-tight">
                Semantic Vector Evidence
              </h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs">
                {sources.length} Docs
              </span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs bg-white/70 backdrop-blur-sm p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          {['ALL', 'RUNBOOK', 'TICKET'].map((f) => (
            <button
              key={f}
              onClick={() => {
                sound.playClick();
                setFilter(f);
              }}
              className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer font-bold text-[11px] ${filter === f
                  ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Sources List */}
      <div className="space-y-3">
        {filteredSources.map((source) => {
          const isHighlighted = highlightedSourceId === source.id;
          const relevance = source.relevance_pct || 90;
          const isHighRelevance = relevance >= 95;

          return (
            <div
              key={source.id}
              id={`source-card-${source.id}`}
              className={`card-interactive rounded-2xl p-4.5 border backdrop-blur-md transition-all duration-300 relative ${isHighlighted
                  ? 'bg-blue-50/95 border-blue-500 shadow-[0_0_28px_rgba(59,130,246,0.35)] ring-2 ring-blue-500/40 scale-[1.02] z-20 animate-electric-pulse'
                  : 'bg-white/90 hover:bg-slate-50/90 border-slate-200/80 hover:border-slate-300/90 shadow-xs'
                }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2.5">

                {/* Source Badge & Title */}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-xs shadow-2xs">
                    Source {source.id}
                  </span>

                  <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 rounded-md bg-slate-100/90 border border-slate-200/80">
                    {source.type || (source.text.toLowerCase().includes('runbook') ? 'Runbook PDF' : 'Incident Ticket')}
                  </span>
                </div>

                {/* Relevance Score with Glow */}
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${isHighRelevance
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300/80 shadow-[0_0_8px_rgba(16,185,129,0.2)]'
                      : 'bg-blue-50 text-blue-800 border-blue-300/80'
                    }`}>
                    {relevance.toFixed(1)}% match
                  </span>
                </div>

              </div>

              {/* Source Text Snippet */}
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/60 font-sans">
                {source.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
