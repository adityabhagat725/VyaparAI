import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Package,
  Users,
  CreditCard,
  Scale,
  Award,
  ShieldCheck,
  Activity,
  FileText,
  Settings,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'whatsapp'
  | 'assistant'
  | 'inventory'
  | 'suppliers'
  | 'payments'
  | 'compliance'
  | 'schemes'
  | 'approvals'
  | 'activity'
  | 'audit'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  urgentLowStockCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  urgentLowStockCount,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    highlight?: boolean;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'whatsapp',
      label: 'WhatsApp Simulator',
      icon: MessageSquare,
      highlight: true,
    },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      badge: urgentLowStockCount > 0 ? urgentLowStockCount : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    { id: 'suppliers', label: 'Suppliers', icon: Users },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'compliance', label: 'GST & Compliance', icon: Scale },
    { id: 'schemes', label: 'Government Schemes', icon: Award },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: ShieldCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500 text-slate-900 font-bold',
    },
    { id: 'activity', label: 'Agent Activity', icon: Activity },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 shadow-lg select-none">
      <div className="py-4">
        <div className="px-5 mb-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Back Office Modules
        </div>
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-semibold'
                    : item.highlight
                    ? 'text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/50 hover:text-emerald-300'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                      item.badgeColor || 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 m-3 rounded-xl text-xs text-slate-400">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-slate-300">Agentic Engine</span>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
            ONLINE
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Autonomous surveillance active. Actions require owner consent.
        </p>
      </div>
    </aside>
  );
};
