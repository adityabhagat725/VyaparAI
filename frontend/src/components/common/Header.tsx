import React from 'react';
import { Bell, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { Business } from '../../types';

interface HeaderProps {
  business?: Business | null;
  pendingApprovalsCount: number;
  onResetDemo: () => void;
  resetting: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  pendingApprovalsCount,
  onResetDemo,
  resetting,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-inner font-black text-xl">
          📦
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-white">VyaparAI</h1>
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Agentic Core
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center space-x-1">
            <span>{business?.name || 'Shree General Store'}</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">AI Back Office Active</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Reset Demo Data button */}
        <button
          onClick={onResetDemo}
          disabled={resetting}
          title="Reset Demo Data to default state"
          className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Demo Mode Badge */}
        <div className="flex items-center space-x-2 text-xs bg-emerald-950/80 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-800/60 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium hidden md:inline">DEMO MODE — Active Surveillance</span>
        </div>

        {/* Pending Approvals Pill */}
        {pendingApprovalsCount > 0 && (
          <div className="flex items-center space-x-1.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-lg font-medium animate-pulse">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>{pendingApprovalsCount} Action{pendingApprovalsCount > 1 ? 's' : ''} Awaiting Review</span>
          </div>
        )}
      </div>
    </header>
  );
};
