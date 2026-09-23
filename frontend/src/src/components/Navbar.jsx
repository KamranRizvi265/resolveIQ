import React from 'react';
import { Zap } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-xs transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Brand / Logo with Electric Glow */}
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

      </div>
    </header>
  );
}
