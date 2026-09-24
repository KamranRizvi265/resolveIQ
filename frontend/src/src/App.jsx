import { useState } from 'react';
import Navbar from './components/Navbar';
import IncidentStream from './components/IncidentStream';
import SearchConsole from './components/SearchConsole';
import DiagnosticResult from './components/DiagnosticResult';
import EvidenceMatrix from './components/EvidenceMatrix';
import RemediationTerminalModal from './components/RemediationTerminalModal';
import PIIShieldModal from './components/PIIShieldModal';
import { performSearch } from './services/api';
import { SAMPLE_INCIDENTS, DEMO_RESPONSES } from './data/sampleData';
import { sound } from './utils/audio';

export default function App() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState('diagnostic');
  const [topK, setTopK] = useState(5);

  const [activeIncident, setActiveIncident] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticStep, setDiagnosticStep] = useState(1);
  const [searchResult, setSearchResult] = useState(null);
  const [highlightedSourceId, setHighlightedSourceId] = useState(null);

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [piiModalOpen, setPiiModalOpen] = useState(false);

  const handleSearch = async (overrideIncident = null, overrideMode = null, overrideQuery = null) => {
    const targetQuery = overrideQuery !== null ? overrideQuery : query;
    if (!targetQuery.trim()) return;
    setIsLoading(true);
    setDiagnosticStep(1);

    const timer1 = setTimeout(() => setDiagnosticStep(2), 300);
    const timer2 = setTimeout(() => setDiagnosticStep(3), 600);
    const timer3 = setTimeout(() => setDiagnosticStep(4), 900);

    const targetMode = overrideMode || mode;
    const targetIncident = overrideIncident !== null ? overrideIncident : activeIncident;

    try {
      const response = await performSearch({
        query: targetQuery,
        top_k: topK,
        mode: targetMode,
        incidentId: targetIncident ? targetIncident.id : null,
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setDiagnosticStep(4);

      setSearchResult(response);
      sound.playSuccess();
    } catch (err) {
      console.error("Search failed:", err);
      sound.playAlert();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectIncident = (inc) => {
    setActiveIncident(inc);
    setQuery(inc.query);
    setTopK(inc.topK || 5);

    setIsLoading(true);
    setDiagnosticStep(1);

    setTimeout(() => setDiagnosticStep(2), 250);
    setTimeout(() => setDiagnosticStep(3), 500);
    setTimeout(() => {
      setDiagnosticStep(4);
      const demoRes = DEMO_RESPONSES[inc.id] && DEMO_RESPONSES[inc.id][mode]
        ? DEMO_RESPONSES[inc.id][mode]
        : {
          query: inc.query,
          mode,
          source_count: 2,
          answer: `### 1. Probable Root Cause\n- Identified failure in ${inc.system} corresponding to ${inc.title}.\n- Error signature: Transient timeout under transaction load.\n\n### 2. Suggested Resolution\n1. Review active telemetry alerts.\n2. Run automated remediation script: \`${inc.remediationCmd}\`.\n3. Verify operational heartbeat.`,
          sources: [
            {
              id: 1,
              text: `Runbook: Operational procedures for ${inc.system}. Execute remediation commands when SLA exceeds ${inc.slaRemaining}.`,
              distance: 0.25,
              relevance_pct: 97.5,
              type: "Runbook PDF",
              ref: `runbooks/${inc.id.toLowerCase()}.pdf`
            }
          ]
        };

      setSearchResult({ ...demoRes, latencyMs: 240, isSandbox: true });
      setIsLoading(false);
      sound.playSuccess();
    }, 750);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (!searchResult) return;
    if (activeIncident && DEMO_RESPONSES[activeIncident.id] && DEMO_RESPONSES[activeIncident.id][newMode]) {
      setSearchResult(DEMO_RESPONSES[activeIncident.id][newMode]);
    } else if (query.trim()) {
      handleSearch(activeIncident, newMode);
    }
  };

  const handleHighlightSource = (sourceId) => {
    setHighlightedSourceId(sourceId);
    const element = document.getElementById(`source-card-${sourceId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    setTimeout(() => {
      setHighlightedSourceId(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden flex flex-col font-sans">

      {/* Cyber Grid Mask Overlay */}
      <div className="fixed inset-0 cyber-grid opacity-75 pointer-events-none z-0"></div>

      {/* Floating Animated Ambient Aurora Lights */}
      <div className="fixed -top-40 -left-40 w-125 h-125 bg-linear-to-tr from-blue-400/25 to-cyan-300/20 rounded-full blur-[110px] pointer-events-none animate-aurora-1 z-0"></div>
      <div className="fixed top-1/4 -right-40 w-137.5 h-137.5 bg-linear-to-bl from-indigo-400/25 to-purple-300/20 rounded-full blur-[120px] pointer-events-none animate-aurora-2 z-0"></div>
      <div className="fixed -bottom-40 left-1/3 w-125 h-125 bg-linear-to-tr from-sky-400/20 to-blue-500/15 rounded-full blur-[110px] pointer-events-none animate-aurora-3 z-0"></div>

      {/* Top Navbar */}
      <Navbar onOpenPiiModal={() => setPiiModalOpen(true)} />

      {/* Main Command Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">

        {/* Incident Stream Ticker */}
        <section>
          <IncidentStream
            onSelectIncident={handleSelectIncident}
            activeIncidentId={activeIncident?.id}
          />
        </section>

        {/* Search Console */}
        <section>
          <SearchConsole
            query={query}
            setQuery={setQuery}
            mode={mode}
            setMode={handleModeChange}
            topK={topK}
            setTopK={setTopK}
            onSearch={() => handleSearch()}
            isLoading={isLoading}
            diagnosticStep={diagnosticStep}
            onOpenPiiModal={() => setPiiModalOpen(true)}
          />
        </section>

        {/* Dual-Column Layout: Left (Diagnostic) & Right (Evidence) */}
        {searchResult && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-300">

            <div className="lg:col-span-7 space-y-4">
              <DiagnosticResult
                result={searchResult}
                remediationCmd={activeIncident?.remediationCmd}
                remediationTitle={activeIncident?.remediationScriptTitle}
                onExecuteRemediation={() => setTerminalOpen(true)}
                onHighlightSource={handleHighlightSource}
                onOpenPiiModal={() => setPiiModalOpen(true)}
              />
            </div>

            <div className="lg:col-span-5 space-y-4">
              <EvidenceMatrix
                sources={searchResult?.sources || []}
                highlightedSourceId={highlightedSourceId}
                onOpenPiiModal={() => setPiiModalOpen(true)}
              />
            </div>

          </section>
        )}

      </main>

      {/* Glassmorphic Cyber Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-xl py-4 text-xs text-slate-500 font-sans mt-12 relative z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-800">ResolveIQ Copilot Engine</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Enterprise ITIL L2 Incident Support</span>
          </div>
        </div>
      </footer>

      {/* Remediation Modal */}
      <RemediationTerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        command={activeIncident?.remediationCmd}
        title={activeIncident?.remediationScriptTitle}
        incidentId={activeIncident?.id}
      />

      {/* PII Cryptographic Privacy Vault & Sanitization Modal */}
      <PIIShieldModal
        isOpen={piiModalOpen}
        onClose={() => setPiiModalOpen(false)}
        onApplyToSearch={(sanitizedQuery) => {
          setQuery(sanitizedQuery);
          handleSearch(null, null, sanitizedQuery);
        }}
      />

    </div>
  );
}
