import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Sparkles,
  RefreshCw,
  Building2,
  ChevronDown,
  HelpCircle,
  CheckCircle2,
  Layers,
  ShieldCheck,
  ChevronRight,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';
import { Business } from '../../types';
import { useLanguage, Language } from '../../context/LanguageContext';
import { api } from '../../api/client';
import { NavTab } from './Sidebar';

interface HeaderProps {
  business?: Business | null;
  activeTab: NavTab;
  pendingApprovalsCount: number;
  urgentLowStockCount: number;
  onResetDemo: () => void;
  resetting: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  business,
  activeTab,
  pendingApprovalsCount,
  urgentLowStockCount,
  onResetDemo,
  resetting,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [businessList, setBusinessList] = useState<any[]>([]);
  const [showBusinessMenu, setShowBusinessMenu] = useState(false);
  const [showAiStatusMenu, setShowAiStatusMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const businessMenuRef = useRef<HTMLDivElement>(null);
  const aiStatusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.listBusinesses().then(setBusinessList).catch(() => {});
  }, [business]);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (businessMenuRef.current && !businessMenuRef.current.contains(e.target as Node)) {
        setShowBusinessMenu(false);
      }
      if (aiStatusRef.current && !aiStatusRef.current.contains(e.target as Node)) {
        setShowAiStatusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getPageTitle = (tab: NavTab) => {
    const titles: Record<NavTab, { title: string; category: string }> = {
      dashboard: { title: 'Executive Overview', category: 'Business' },
      assistant: { title: 'AI Assistant & Copilot', category: 'Business' },
      whatsapp: { title: 'WhatsApp Simulator', category: 'Business' },
      inventory: { title: 'Inventory & Procurement', category: 'Business' },
      suppliers: { title: 'Suppliers Directory', category: 'Business' },
      payments: { title: 'Vendor Payments & Invoices', category: 'Business' },
      compliance: { title: 'GST & Statutory Compliance', category: 'Operations' },
      schemes: { title: 'Government MSME Schemes', category: 'Operations' },
      staff: { title: 'Staff & Payroll Management', category: 'Operations' },
      approvals: { title: 'Approval Center (HITL)', category: 'AI Control' },
      activity: { title: 'Agent Activity & Observability', category: 'AI Control' },
      audit: { title: 'Immutable Audit Logs', category: 'AI Control' },
      settings: { title: 'System & Automation Settings', category: 'System' },
    };
    return titles[tab] || { title: 'Dashboard', category: 'VyaparAI' };
  };

  const currentMeta = getPageTitle(activeTab);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-subtle select-none">
      {/* Left: Breadcrumbs & Current Page Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center text-xs text-slate-400 space-x-1.5 font-medium">
          <span className="text-slate-500 font-semibold">{t.appName}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-400">{currentMeta.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-semibold">{currentMeta.title}</span>
        </div>
      </div>

      {/* Right Controls: AI Status, Enterprise Switcher, Notifications, Language, Avatar */}
      <div className="flex items-center space-x-2.5">
        {/* AI Active Status Pill */}
        <div className="relative" ref={aiStatusRef}>
          <button
            onClick={() => setShowAiStatusMenu(!showAiStatusMenu)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-50/80 hover:bg-indigo-100/70 border border-indigo-200/70 text-indigo-700 text-xs font-semibold transition"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>AI Active</span>
            <ChevronDown className="w-3 h-3 text-indigo-500 ml-0.5" />
          </button>

          {showAiStatusMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-modal border border-slate-200 p-4 z-50 text-xs animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span className="font-bold text-slate-900">VyaparAI Agent Swarm</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full">
                  7 Active
                </span>
              </div>

              <div className="mt-3 space-y-2 text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Specialized Domain Agents</span>
                  <span className="font-semibold text-slate-900">7 Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Continuous Surveillance Loop</span>
                  <span className="font-semibold text-emerald-600 font-mono text-[11px]">60s interval</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Low Stock Items Flagged</span>
                  <span className={`font-semibold ${urgentLowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                    {urgentLowStockCount} items
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Actions Awaiting Consent</span>
                  <span className={`font-semibold ${pendingApprovalsCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                    {pendingApprovalsCount} pending
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                Autonomous surveillance active. Human-in-the-Loop policy enforced for financial/tax decisions.
              </div>
            </div>
          )}
        </div>

        {/* Enterprise Multi-Tenant Switcher */}
        <div className="relative" ref={businessMenuRef}>
          <button
            onClick={() => setShowBusinessMenu(!showBusinessMenu)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate max-w-[130px]">{business?.name || 'Shree General Store'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showBusinessMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-modal border border-slate-200 p-2.5 z-50 text-xs animate-fade-in">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Enterprise (Strict Tenant Isolation)
              </div>
              <div className="space-y-1 mt-1">
                {businessList.map((b) => {
                  const isCurrent = business?._id === b.id || business?.name === b.name;
                  return (
                    <button
                      key={b.id}
                      onClick={() => {
                        setShowBusinessMenu(false);
                        handleSwitchBusiness(b.id);
                      }}
                      className={`w-full text-left p-3 rounded-xl flex items-start justify-between transition ${
                        isCurrent
                          ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-950 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {b.businessType} • {b.city}
                        </div>
                      </div>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-[11px] font-semibold">
          {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2 py-1 rounded-lg transition ${
                language === lang
                  ? 'bg-white text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
            </button>
          ))}
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          disabled={resetting}
          title={t.resetDemo}
          className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {business?.name ? business.name.slice(0, 2).toUpperCase() : 'SG'}
          </div>
        </div>
      </div>
    </header>
  );
};
