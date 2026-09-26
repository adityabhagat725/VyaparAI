import React, { useState } from 'react';
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
  UserCheck,
  Activity,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Business } from '../../types';

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
  | 'staff'
  | 'activity'
  | 'audit'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingApprovalsCount: number;
  urgentLowStockCount: number;
  business?: Business | null;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavSection {
  title: string;
  items: Array<{
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeVariant?: 'danger' | 'warning' | 'primary' | 'success';
    isLive?: boolean;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingApprovalsCount,
  urgentLowStockCount,
  business,
  collapsed: externalCollapsed,
  onToggleCollapse,
}) => {
  const { t } = useLanguage();
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));

  const sections: NavSection[] = [
    {
      title: 'BUSINESS',
      items: [
        { id: 'dashboard', label: t.tabs.dashboard, icon: LayoutDashboard },
        { id: 'whatsapp', label: t.tabs.whatsapp, icon: MessageSquare, isLive: true },
        { id: 'assistant', label: t.tabs.assistant, icon: Bot },
        {
          id: 'inventory',
          label: t.tabs.inventory,
          icon: Package,
          badge: urgentLowStockCount > 0 ? urgentLowStockCount : undefined,
          badgeVariant: 'danger',
        },
        { id: 'suppliers', label: t.tabs.suppliers, icon: Users },
        { id: 'payments', label: t.tabs.payments, icon: CreditCard },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'compliance', label: t.tabs.compliance, icon: Scale },
        { id: 'schemes', label: t.tabs.schemes, icon: Award },
        { id: 'staff', label: t.tabs.staff, icon: UserCheck },
      ],
    },
    {
      title: 'AI CONTROL',
      items: [
        {
          id: 'approvals',
          label: t.tabs.approvals,
          icon: ShieldCheck,
          badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
          badgeVariant: 'warning',
        },
        { id: 'activity', label: t.tabs.activity, icon: Activity },
        { id: 'audit', label: t.tabs.audit, icon: FileText },
      ],
    },
    {
      title: 'SYSTEM',
      items: [{ id: 'settings', label: t.tabs.settings, icon: Settings }],
    },
  ];

  const getBadgeStyle = (variant?: 'danger' | 'warning' | 'primary' | 'success') => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-500 text-white';
      case 'warning':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'success':
        return 'bg-emerald-500 text-white';
      default:
        return 'bg-primary-600 text-white';
    }
  };

  return (
    <aside
      className={`${
        isCollapsed ? 'w-18' : 'w-64'
      } bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 shadow-subtle select-none transition-all duration-200 z-20`}
    >
      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 no-scrollbar space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="px-2.5">
            {!isCollapsed ? (
              <div className="px-2.5 mb-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {section.title}
              </div>
            ) : (
              <div className="h-2" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => onTabChange(item.id)}
                      className={`w-full flex items-center ${
                        isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                      } rounded-lg text-xs font-medium transition-all group-hover:scale-[1.01] ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 font-semibold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div className="relative">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive
                                ? 'text-primary-600'
                                : 'text-slate-400 group-hover:text-slate-600'
                            }`}
                          />
                          {/* Dot indicator when collapsed */}
                          {isCollapsed && item.badge && (
                            <span
                              className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${getBadgeStyle(
                                item.badgeVariant
                              )}`}
                            />
                          )}
                        </div>

                        {!isCollapsed && (
                          <span className="truncate tracking-tight">{item.label}</span>
                        )}
                      </div>

                      {/* Expanded Badges */}
                      {!isCollapsed && (
                        <div className="flex items-center space-x-1.5 shrink-0">
                          {item.isLive && (
                            <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Live</span>
                            </span>
                          )}
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shadow-xs ${getBadgeStyle(
                                item.badgeVariant
                              )}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Floating Tooltip in collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap flex items-center space-x-1.5">
                        <span>{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 rounded-full font-bold ${getBadgeStyle(
                              item.badgeVariant
                            )}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Profile & AI Status Card */}
      <div className="p-2.5 border-t border-slate-200/80 bg-slate-50/60">
        {!isCollapsed ? (
          <div className="p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 truncate">
                <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {business?.name || 'Shree General Store'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {business?.businessType || 'Kirana & Retail'}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleCollapse}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px]">
              <div className="flex items-center space-x-1.5 text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Engine Online</span>
              </div>
              <span className="text-slate-400 font-mono text-[9px]">v2.4</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <button
              onClick={toggleCollapse}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
