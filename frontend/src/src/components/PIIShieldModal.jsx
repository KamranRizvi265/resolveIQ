import React, { useState, useId } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Cpu,
  Key,
  X,
  FileText,
  AlertTriangle,
  Layers,
  Database
} from 'lucide-react';
import { sound } from '../utils/audio';
import {
  analyzePII,
  sanitizeText,
  getPiiToken,
  PII_DEMO_PRESETS,
  PII_DEFAULT_KEY
} from '../utils/piiHasher';

export default function PIIShieldModal({
  isOpen,
  onClose,
  onApplyToSearch
}) {
  const [activePresetId, setActivePresetId] = useState(PII_DEMO_PRESETS[0].id);
  const [inputText, setInputText] = useState(PII_DEMO_PRESETS[0].text);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedSanitized, setCopiedSanitized] = useState(false);
  const [testConsistencyValue, setTestConsistencyValue] = useState("alex.example@example.test");
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'compliance'

  const titleId = useId();

  if (!isOpen) return null;

  const analysis = analyzePII(inputText);

  const handleSelectPreset = (preset) => {
    sound.playClick();
    setActivePresetId(preset.id);
    setInputText(preset.text);
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(inputText);
    sound.playSuccess();
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const handleCopySanitized = () => {
    navigator.clipboard.writeText(analysis.sanitizedText);
    sound.playSuccess();
    setCopiedSanitized(true);
    setTimeout(() => setCopiedSanitized(false), 2000);
  };

  const handleApplyToSearch = () => {
    sound.playSuccess();
    if (onApplyToSearch) {
      onApplyToSearch(analysis.sanitizedText);
    }
    onClose();
  };

  const testToken = getPiiToken("EMAIL", testConsistencyValue);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dark blur backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      ></div>

      {/* Modal Dialog Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-5xl bg-white/95 rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-950/20 overflow-hidden z-10 flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
      >
        {/* Top Glowing Header Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-blue-600 via-emerald-500 to-indigo-600"></div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 id={titleId} className="text-lg sm:text-xl font-black text-slate-900 font-sans tracking-tight">
                  Cryptographic PII Hashing & Privacy Vault
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100/90 text-emerald-800 border border-emerald-300 shadow-2xs">
                  HMAC-SHA256 ACTIVE
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 hidden sm:inline">
                  Zero Plaintext LLM Exposure
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Deterministic pseudonymization for finance operations. In-flight tokenization ensures compliance with GDPR Art. 32, SOC 2, and PCI-DSS.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('pipeline');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pipeline'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Interactive Hashing Playground</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('compliance');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'compliance'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Cryptographic Architecture & Compliance</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          {activeTab === 'pipeline' ? (
            <>
              {/* Presets Row */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Load Production Incident Scenario:
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Click any preset to simulate sensitive log ingestion
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {PII_DEMO_PRESETS.map((preset) => {
                    const isSelected = activePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer shadow-2xs ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-500 shadow-md shadow-blue-500/10 ring-2 ring-blue-500/20'
                            : 'bg-white hover:bg-slate-50 border-slate-200/90 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {preset.badge}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {preset.severity}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {preset.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                          {preset.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Entity Counter Pill Bar */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${analysis.hasPII ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {analysis.hasPII ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    Detection Status:
                  </span>
                  <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                    analysis.hasPII ? 'bg-amber-50 text-amber-800 border border-amber-300' : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  }`}>
                    {analysis.entityCount} Sensitive {analysis.entityCount === 1 ? 'Entity' : 'Entities'} Detected
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    Emails: <strong className="text-blue-700 font-mono">{analysis.entityCounts.EMAIL}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    Phones: <strong className="text-indigo-700 font-mono">{analysis.entityCounts.PHONE}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    SSN / Cards: <strong className="text-rose-700 font-mono">{analysis.entityCounts.SSN + analysis.entityCounts.CARD}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                    Entity IDs: <strong className="text-purple-700 font-mono">{analysis.entityCounts.ID}</strong>
                  </span>
                </div>
              </div>

              {/* Dual Side-by-Side Comparison Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Left: Raw Plaintext Stream */}
                <div className="flex flex-col bg-white rounded-2xl border border-rose-200/80 shadow-xs overflow-hidden">
                  <div className="p-3 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-rose-900">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        1. Ingress Stream (Raw Plaintext)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyRaw}
                      className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedRaw ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRaw ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col">
                    <textarea
                      value={inputText}
                      onChange={(e) => {
                        setInputText(e.target.value);
                        setActivePresetId(null);
                      }}
                      rows={5}
                      className="w-full text-xs font-mono text-slate-800 bg-rose-50/20 rounded-xl p-3 border border-rose-200/60 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 resize-none leading-relaxed"
                      placeholder="Type or paste incident text with emails, phone numbers, SSNs, credit cards, or customer IDs..."
                    />

                    {/* Detected entities chip strip */}
                    {analysis.entities.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                          Identified Direct Identifiers:
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {analysis.entities.map((ent, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-mono text-[11px]"
                            >
                              <span className="font-bold text-rose-600 font-sans">[{ent.label || ent.kind}]:</span>
                              <span className="font-semibold">{ent.rawValue}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Sanitized Pseudonymized Stream */}
                <div className="flex flex-col bg-white rounded-2xl border border-emerald-300 shadow-xs overflow-hidden">
                  <div className="p-3 bg-emerald-50/80 border-b border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        2. Snowflake Cortex & FAISS Ingestion Stream
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySanitized}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSanitized ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSanitized ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div className="w-full text-xs font-mono text-slate-800 bg-emerald-50/20 rounded-xl p-3 border border-emerald-200/60 min-h-28 leading-relaxed whitespace-pre-wrap select-all">
                      {analysis.sanitizedText.split(/(\[(?:EMAIL|PHONE|SSN|CARD|ID)_[a-f0-9]{12}\])/g).map((chunk, i) => {
                        const isToken = /^\[(EMAIL|PHONE|SSN|CARD|ID)_[a-f0-9]{12}\]$/.test(chunk);
                        if (isToken) {
                          return (
                            <span
                              key={i}
                              className="inline-block px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300 font-bold mx-0.5 shadow-2xs"
                              title="Deterministic HMAC-SHA256 Token"
                            >
                              {chunk}
                            </span>
                          );
                        }
                        return <span key={i}>{chunk}</span>;
                      })}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500 font-medium">
                        🛡️ Non-reversible without production vault key
                      </span>
                      <button
                        type="button"
                        onClick={handleApplyToSearch}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Send to ResolveIQ Search</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Interactive Determinism Consistency Lab */}
              <div className="p-4.5 rounded-2xl bg-slate-900 text-white shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-sans">
                      Deterministic Vector Consistency Proof
                    </h4>
                  </div>
                  <span className="text-[11px] text-cyan-300 font-mono">
                    HMAC(Key, Value) ➔ Stable Across All Tickets & Runbooks
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Why deterministic hashing? If customer <code className="text-cyan-300 font-mono font-bold">alex.example@example.test</code> reports an issue in ServiceNow and SAP simultaneously, both will vectorize to the exact same token <code className="text-purple-300 font-mono font-bold">{testToken}</code>. This allows FAISS nearest-neighbor correlation without either database ever learning the customer's real name.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <span className="text-xs font-semibold text-slate-400">Test Consistency:</span>
                  <input
                    type="text"
                    value={testConsistencyValue}
                    onChange={(e) => setTestConsistencyValue(e.target.value)}
                    className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs w-64 focus:outline-none focus:border-cyan-400"
                    placeholder="Type any test value..."
                  />
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <span className="px-3 py-1 rounded-lg bg-purple-950/80 border border-purple-500/60 text-purple-300 font-mono text-xs font-bold shadow-inner">
                    {testToken}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Compliance & Cryptography Breakdown Tab */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-blue-700">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-bold text-slate-900 font-sans">
                      GDPR Article 32: Pseudonymization
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Under GDPR Art. 4(5) & Art. 32, personal data is rendered non-attributable to a specific data subject without the use of additional information. In ResolveIQ, the secret HMAC key is stored in AWS/GCP Key Management Service (KMS), meaning third-party model providers (e.g. Snowflake Cortex LLM) cannot reverse the identifier.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Database className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-900 font-sans">
                      Zero-Knowledge FAISS Indexing
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    During runbook PDF and incident ticket ingestion, raw texts are scrubbed through <code className="text-blue-700 font-mono bg-blue-50 px-1 py-0.5 rounded">sanitize_text()</code> before embeddings are generated with <code className="text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded">all-MiniLM-L6-v2</code>. Vector embeddings index only sanitized representations.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Lock className="w-5 h-5 text-purple-600" />
                    <h4 className="text-sm font-bold text-slate-900 font-sans">
                      PCI-DSS & Financial Data Masking
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Payment Card Account Numbers (PANs 13–19 digits) and federal Tax Identification Numbers (EINs) are intercepted in memory and converted to keyed digests, preventing PCI cardholder data leakage in customer service logs.
                  </p>
                </div>

                <div className="p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Key className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-sm font-bold text-slate-900 font-sans">
                      Collision-Resistant 48-Bit Truncation
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    HMAC-SHA256 generates a 256-bit hash, truncated to 12 hexadecimal characters (48 bits of cryptographic entropy). This delivers over 281 trillion unique states, preventing accidental cross-customer collisions while maintaining concise prompt token length.
                  </p>
                </div>

              </div>

              {/* Architecture flow box */}
              <div className="p-4.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Pipeline Ingestion Architecture:
                </span>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-center w-full sm:w-1/4">
                    Inbound Ticket / Query
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 hidden sm:block" />
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-2xs text-center w-full sm:w-1/3">
                    HMAC-SHA256 In-Flight Scrubbing
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-600 shrink-0 hidden sm:block" />
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-300 text-blue-800 shadow-2xs text-center w-full sm:w-1/3">
                    Snowflake Cortex LLM + FAISS Store
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enterprise PII Protection Guardrails Certified</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleApplyToSearch}
              className="px-4.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Use Sanitized In Search</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
