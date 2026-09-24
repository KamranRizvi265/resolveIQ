import React from 'react';
import { Clock, ArrowRight, Sparkles, AlertCircle, ShieldAlert } from 'lucide-react';
import { SAMPLE_INCIDENTS } from '../data/sampleData';
import { sound } from '../utils/audio';

export default function IncidentStream({ onSelectIncident, activeIncidentId }) {
  return (
    <div className="w-full">
      
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-xl bg-blue-100 text-blue-700 shadow-xs">
            <span className="absolute inset-0 rounded-xl bg-blue-400/40 animate-radar-ring pointer-events-none"></span>
            <Sparkles className="w-4 h-4 relative z-10" />
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-slate-900 font-sans tracking-tight">
              Live Incident Stream
            </h2>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              REAL-TIME FEED
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden md:inline">
            — Select any scenario to trigger autonomous RCA pipeline
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full border border-blue-200/60 shadow-xs">
            5 Scenarios Ready
          </span>
        </div>
      </div>

      {/* Incident Queue Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {SAMPLE_INCIDENTS.map((inc) => {
          const isSelected = activeIncidentId === inc.id;
          const isP1 = inc.severity.includes('P1');
          const isP2 = inc.severity.includes('P2');

          return (
            <div
              key={inc.id}
              onClick={() => {
                sound.playDiagnosticPulse();
                onSelectIncident(inc);
              }}
              className={`card-interactive group relative rounded-2xl p-4 cursor-pointer text-left flex flex-col justify-between border backdrop-blur-md transition-all duration-300 ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-500 shadow-[0_12px_28px_-6px_rgba(59,130,246,0.28)] ring-2 ring-blue-500/30 scale-[1.02] z-10'
                  : isP1
                  ? 'bg-white/90 hover:bg-rose-50/30 border-rose-200/90 hover:border-rose-400/80 shadow-xs animate-pulse-danger'
                  : isP2
                  ? 'bg-white/90 hover:bg-amber-50/30 border-amber-200/80 hover:border-amber-400/80 shadow-xs'
                  : 'bg-white/90 hover:bg-slate-50/90 border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                {/* Severity & SLA Header */}
                <div className="flex items-center justify-between gap-1 mb-2.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isP1 
                      ? 'bg-rose-100 text-rose-700 border border-rose-200 shadow-xs' 
                      : isP2
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  }`}>
                    {isP1 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>}
                    {inc.severity}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>SLA: <strong className={isP1 ? "text-rose-600 font-bold" : "text-slate-700"}>{inc.slaRemaining}</strong></span>
                  </div>
                </div>

                {/* ID & Title */}
                <div className="text-xs font-mono font-bold text-blue-600 mb-1 flex items-center gap-1.5">
                  <span>{inc.id}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>}
                </div>
                
                <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors duration-200">
                  {inc.title}
                </h3>
                
                <div className="text-xs text-slate-500 mt-1.5 truncate font-medium">
                  {inc.system}
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">{inc.timestamp}</span>
                <span className={`inline-flex items-center gap-1 font-bold text-xs transition duration-200 ${
                  isSelected ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'
                }`}>
                  Resolve <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
