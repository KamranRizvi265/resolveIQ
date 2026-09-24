import { Zap, ShieldCheck, Lock } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Navbar({ onOpenPiiModal }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl blur-md opacity-40 group-hover:opacity-80 transition duration-300"></div>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-5 h-5 fill-current" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                Resolve<span className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent animate-gradient-text">IQ</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block font-medium">
              Intelligent ITIL Incident Resolution for Enterprise Finance
            </p>
          </div>
        </div>

        {/* Right Actions: PII Protection Vault Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playDiagnosticPulse();
              if (onOpenPiiModal) onOpenPiiModal();
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white hover:bg-emerald-50/80 border border-emerald-300/80 hover:border-emerald-400 text-emerald-800 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer group hover:scale-[1.02]"
            title="Inspect Cryptographic PII Pseudonymization Vault"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:rotate-6 transition-transform" />
            <div className="flex items-center gap-1.5 text-xs font-bold font-sans">
              <span>PII Shield:</span>
              <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md font-mono text-[11px]">
                HMAC-SHA256
              </span>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
}

