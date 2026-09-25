import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Sparkles, RefreshCw, Globe, Building2, ChevronDown } from 'lucide-react';
import { Business } from '../../types';
import { useLanguage, Language } from '../../context/LanguageContext';
import { api } from '../../api/client';

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
  const { language, setLanguage, t } = useLanguage();
  const [businessList, setBusinessList] = useState<any[]>([]);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);

  useEffect(() => {
    api.listBusinesses().then(setBusinessList).catch(() => {});
  }, [business]);

  const handleSwitchBusiness = async (bId: string) => {
    try {
      const res = await api.switchBusiness(bId);
      if (res && res.token) {
        localStorage.setItem('vyapar_token', res.token);
        window.location.reload();
      }
    } catch (err: any) {
      alert(`Error switching enterprise: ${err.message}`);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-inner font-black text-xl">
          📦
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-white">{t.appName}</h1>
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {t.tagline}
            </span>
          </div>
          <div className="flex items-center space-x-2 mt-0.5 relative">
            <div className="relative">
              <button
                onClick={() => setShowBusinessMenu(!showBusinessMenu)}
                className="flex items-center space-x-1.5 hover:text-white transition group cursor-pointer text-xs bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/80"
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200 group-hover:text-emerald-400">
                  {business?.name || 'Shree General Store'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white" />
              </button>

              {showBusinessMenu && (
                <div className="absolute left-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Enterprise (Tenant Isolation)
                  </div>
                  {businessList.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setShowBusinessMenu(false);
                        handleSwitchBusiness(b.id);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg flex flex-col transition mb-1 ${
                        business?._id === b.id || business?.name === b.name
                          ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300'
                          : 'hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <span className="font-bold">{b.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {b.businessType} • {b.city}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-emerald-400 font-medium text-xs">AI Back Office Active</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Language Selector */}
        <div className="flex items-center space-x-1 bg-slate-800/90 border border-slate-700 rounded-lg p-0.5 text-xs">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              language === 'en' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              language === 'hi' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setLanguage('mr')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
              language === 'mr' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            मराठी
          </button>
        </div>
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
