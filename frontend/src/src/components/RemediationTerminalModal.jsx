import React, { useState, useEffect } from 'react';
import { Terminal, X, CheckCircle2, Play, Copy, Check, ShieldCheck } from 'lucide-react';
import { sound } from '../utils/audio';

export default function RemediationTerminalModal({
  isOpen,
  onClose,
  command,
  title,
  incidentId
}) {
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLogs([
        { text: `[SYSTEM] Authenticated as finops-operator-bot (Service Principal)`, type: 'sys' },
        { text: `[TARGET] Cluster: prod-us-east-finance-01 | Namespace: finance-prod`, type: 'sys' },
        { text: `$ ${command || 'echo "Ready to execute"' }`, type: 'cmd' },
      ]);
      setIsRunning(true);
      setIsCompleted(false);

      const runTerminalSequence = async () => {
        await new Promise(r => setTimeout(r, 450));
        setLogs(prev => [...prev, { text: `-> Initializing TLS mutual handshake reset on finops-gateway.internal...`, type: 'info' }]);
        sound.playDiagnosticPulse();

        await new Promise(r => setTimeout(r, 650));
        setLogs(prev => [...prev, { text: `-> HTTP/2 200 OK: Session cache invalidated (4,192 sockets purged)`, type: 'info' }]);

        await new Promise(r => setTimeout(r, 550));
        setLogs(prev => [...prev, { text: `-> Rolling restart of payment-relay worker pods (3/3 replicas)...`, type: 'info' }]);

        await new Promise(r => setTimeout(r, 750));
        setLogs(prev => [...prev, { text: `-> pod/payment-relay-79a4e81a3d-v94k2 : Running & Ready [1/1] (34ms probe latency)`, type: 'success' }]);

        await new Promise(r => setTimeout(r, 550));
        setLogs(prev => [
          ...prev, 
          { text: `[SUCCESS] Transaction settlement throughput restored. Zero packet loss.`, type: 'success' },
          { text: `[ITIL BOT] Incident ${incidentId || 'INC-4521'} transitioned to: RESOLVED.`, type: 'success' }
        ]);
        setIsRunning(false);
        setIsCompleted(true);
        sound.playSuccess();
      };

      runTerminalSequence();
    }
  }, [isOpen, command, incidentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 rounded-3xl border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col font-mono text-xs animate-in zoom-in-95 duration-200">
        
        {/* Terminal Header with Glowing Dots */}
        <div className="bg-slate-900/90 px-5 py-3.5 border-b border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.6)]"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"></span>
            </div>
            <div className="ml-2 flex items-center gap-2 text-slate-200 font-sans font-extrabold text-sm">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Remediation Runner: {title || 'Live Action Terminal'}</span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal Screen */}
        <div className="p-5 h-84 overflow-y-auto space-y-2.5 bg-slate-950 font-mono text-xs text-slate-200 border-b border-slate-900">
          {logs.map((log, i) => (
            <div
              key={i}
              className={`leading-relaxed ${
                log.type === 'cmd'
                  ? 'text-cyan-300 font-bold bg-slate-900/90 p-2 rounded-xl border border-slate-800 shadow-xs'
                  : log.type === 'success'
                  ? 'text-emerald-400 font-bold drop-shadow-[0_0_6px_rgba(52,211,153,0.3)]'
                  : log.type === 'info'
                  ? 'text-slate-300'
                  : 'text-slate-500'
              }`}
            >
              {log.text}
            </div>
          ))}

          {isRunning && (
            <div className="flex items-center gap-2 text-cyan-400 pt-2 animate-pulse">
              <span className="inline-block w-2 h-4 bg-cyan-400 animate-ping"></span>
              <span>Running automated recovery sequence...</span>
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between font-sans">
          <div className="flex items-center gap-2.5 text-xs">
            <span className={`relative flex h-2.5 w-2.5`}>
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isRunning ? 'bg-amber-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isRunning ? 'bg-amber-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <span className={isRunning ? 'text-amber-400 font-medium' : 'text-emerald-400 font-bold'}>
              {isRunning ? 'Execution in progress...' : 'Execution Completed (Exit Code 0)'}
            </span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer border border-slate-700 shadow-xs"
          >
            Close Terminal
          </button>
        </div>

      </div>
    </div>
  );
}
