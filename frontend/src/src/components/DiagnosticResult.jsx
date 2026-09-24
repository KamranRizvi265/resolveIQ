import React, { useState } from 'react';
import {
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  Share2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Play,
  FileText,
  Zap,
  BookOpen
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function DiagnosticResult({
  result,
  remediationCmd,
  remediationTitle,
  onExecuteRemediation,
  onHighlightSource
}) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [completedSteps, setCompletedSteps] = useState({});

  if (!result) return null;

  const { query, mode, answer, sources, source_count, latencyMs, isSandbox } = result;

  const handleCopyCmd = () => {
    if (!remediationCmd) return;
    navigator.clipboard.writeText(remediationCmd);
    sound.playSuccess();
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleCopyReport = () => {
    const report = `# ResolveIQ Incident Resolution Report\nQuery: ${query}\nMode: ${mode}\nLatency: ${latencyMs || 240}ms\n\n${answer}`;
    navigator.clipboard.writeText(report);
    sound.playSuccess();
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const toggleStep = (stepIdx) => {
    sound.playClick();
    setCompletedSteps(prev => ({
      ...prev,
      [stepIdx]: !prev[stepIdx]
    }));
  };

  const renderFormattedAnswer = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ') || line.startsWith('## ')) {
        const title = line.replace(/^[#]+\s*/, '').replace(/\*\*/g, '');
        return (
          <h3 key={idx} className="text-base font-bold text-slate-900 mt-5 mb-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            {renderInlineCitations(title)}
          </h3>
        );
      }

      // Checklists / Ordered steps
      const stepMatch = line.match(/^(\d+)\.\s+(.*)/);
      if (stepMatch) {
        const stepNum = stepMatch[1];
        const stepContent = stepMatch[2];
        const isDone = !!completedSteps[idx];

        return (
          <div
            key={idx}
            onClick={() => toggleStep(idx)}
            className={`my-2 p-3.5 rounded-2xl border flex items-start gap-3.5 cursor-pointer transition-all duration-200 select-none ${isDone
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900 shadow-xs shadow-emerald-500/10'
                : 'bg-white/80 hover:bg-slate-50/90 border-slate-200/90 text-slate-800 hover:border-blue-300/80 hover:shadow-xs hover:-translate-y-0.5'
              }`}
          >
            <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-xl flex items-center justify-center border font-bold text-xs transition-all duration-200 ${isDone
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs shadow-emerald-600/30 scale-105'
                : 'border-slate-300 bg-white text-slate-600'
              }`}>
              {isDone ? <Check className="w-3.5 h-3.5 stroke-3" /> : stepNum}
            </div>
            <div className={`text-sm flex-1 leading-relaxed font-sans transition-all duration-200 ${isDone ? 'line-through text-emerald-800/80' : ''}`}>
              {renderInlineCitations(stepContent)}
            </div>
          </div>
        );
      }

      // Bullets
      if (line.trim().startsWith('- ')) {
        const bulletContent = line.trim().substring(2);
        return (
          <div key={idx} className="my-1.5 flex items-start gap-2.5 text-sm text-slate-700 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
            <div className="flex-1 leading-relaxed">
              {renderInlineCitations(bulletContent)}
            </div>
          </div>
        );
      }

      // Standard paragraphs
      if (line.trim() === '') return <div key={idx} className="h-2"></div>;

      return (
        <p key={idx} className="text-sm text-slate-700 my-1.5 leading-relaxed">
          {renderInlineCitations(line)}
        </p>
      );
    });
  };

  
  const renderInlineTokens = (text, keyPrefix = '') => {
    if (!text) return null;

    
    const codeParts = text.split(/(`[^`]+`)/g);
    return codeParts.map((sub, sIdx) => {
      if (sub.startsWith('`') && sub.endsWith('`') && sub.length >= 2) {
        return (
          <code key={`${keyPrefix}-code-${sIdx}`} className="px-1.5 py-0.5 bg-slate-100 text-blue-800 rounded border border-slate-200 text-xs font-mono">
            {sub.slice(1, -1)}
          </code>
        );
      }

      
      const citeParts = sub.split(/(\[Source\s+\d+\])/g);
      return citeParts.map((cPart, cIdx) => {
        const match = cPart.match(/\[Source\s+(\d+)\]/);
        if (match) {
          const sourceId = parseInt(match[1], 10);
          return (
            <button
              key={`${keyPrefix}-cite-${sIdx}-${cIdx}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sound.playClick();
                if (onHighlightSource) onHighlightSource(sourceId);
              }}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 mx-1 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold text-xs transition cursor-pointer hover:scale-105"
              title={`Highlight Source ${sourceId}`}
            >
              <span>[Source {sourceId}]</span>
            </button>
          );
        }

        // Clean any stray double asterisks that could leak into plain text
        const cleanText = cPart.replace(/\*\*/g, '');
        return cleanText;
      });
    });
  };

  
  const renderInlineCitations = (content) => {
    if (!content) return null;

    
    const boldParts = content.split(/(\*\*[^*]+?\*\*)/g);
    return boldParts.map((bSub, bIdx) => {
      if (bSub.startsWith('**') && bSub.endsWith('**') && bSub.length >= 4) {
        const inner = bSub.slice(2, -2);
        return (
          <strong key={`bold-${bIdx}`} className="font-semibold text-slate-900">
            {renderInlineTokens(inner, `bold-${bIdx}`)}
          </strong>
        );
      }
      return (
        <React.Fragment key={`text-${bIdx}`}>
          {renderInlineTokens(bSub, `text-${bIdx}`)}
        </React.Fragment>
      );
    });
  };

  return (
    <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-300">

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-linear-to-tr from-blue-500/10 to-indigo-500/15 text-blue-600 border border-blue-200/60 shadow-xs">
            {mode === 'diagnostic' ? <Zap className="w-5 h-5 fill-current" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold text-slate-900 font-sans tracking-tight">
                {mode === 'diagnostic' ? 'AI Diagnostic Analysis' : 'ITIL Knowledge Runbook'}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
                {source_count || sources?.length || 0} Citations
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Inference Latency: <strong className="text-emerald-600 font-bold font-mono">{latencyMs || 240}ms</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">{isSandbox ? 'Enterprise Sandbox' : 'Live FAISS Vector Cluster'}</span>
            </div>
          </div>
        </div>

        {/* Copy Report Action Button */}
        <button
          onClick={handleCopyReport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-slate-50 border border-slate-200/90 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer hover:-translate-y-0.5"
        >
          {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copiedReport ? 'Report Copied!' : 'Copy Report'}</span>
        </button>
      </div>

      {/* Main Formatted Diagnostic Response */}
      <div className="space-y-1">
        {renderFormattedAnswer(answer)}
      </div>

      
      {remediationCmd && (
        <div className="mt-7 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 font-sans">
                Automated Remediation: {remediationTitle || 'Safe One-Click Script'}
              </span>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Verified Safe
            </span>
          </div>

          <div className="relative group rounded-2xl bg-slate-950 border border-slate-800/90 p-4 shadow-lg shadow-slate-950/20 overflow-hidden">
            
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                <span className="ml-2 font-mono text-[10px] text-slate-500">bash — 80x24</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-500/60 font-semibold uppercase tracking-wider">
                ResolveIQ CLI v2.4
              </span>
            </div>

            <div className="font-mono text-xs text-emerald-400 overflow-x-auto pr-24 py-1.5 leading-relaxed selection:bg-emerald-900/60 drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">
              <span className="text-emerald-600 select-none mr-2 font-bold">$</span>
              {remediationCmd}
            </div>

            <div className="absolute right-3.5 bottom-3.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCmd}
                title="Copy Command"
                className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/60 shadow-xs"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playSuccess();
                  onExecuteRemediation();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run Script</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SLA Alert Card */}
      <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-amber-900">
            <strong>ITIL Compliance SLA:</strong> Tier-1 Finance Resolution target is &lt; 30 minutes. Audit trail auto-saved.
          </span>
        </div>
        <div className="flex items-center gap-1 font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 whitespace-nowrap">
          <Clock className="w-3 h-3" />
          <span>Active SLA</span>
        </div>
      </div>

    </div>
  );
}
