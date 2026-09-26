import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { Sidebar, NavTab } from './components/common/Sidebar';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { WhatsAppSimulatorTab } from './components/whatsapp/WhatsAppSimulatorTab';
import { AiAssistantTab } from './components/chat/AiAssistantTab';
import { InventoryTab } from './components/inventory/InventoryTab';
import { SuppliersTab } from './components/suppliers/SuppliersTab';
import { PaymentsTab } from './components/payments/PaymentsTab';
import { ComplianceTab } from './components/compliance/ComplianceTab';
import { SchemesTab } from './components/schemes/SchemesTab';
import { ApprovalsTab } from './components/approvals/ApprovalsTab';
import { StaffTab } from './components/staff/StaffTab';
import { AgentActivityTab } from './components/activity/AgentActivityTab';
import { AuditLogsTab } from './components/audit/AuditLogsTab';
import { SettingsTab } from './components/settings/SettingsTab';
import { api } from './api/client';
import { Business } from './types';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [resetting, setResetting] = useState(false);

  const fetchDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data);
      if (data.business) setBusiness(data.business);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Auto-refresh stats periodically
    const timer = setInterval(() => {
      fetchDashboard();
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset demo database to fresh initial state for Shree General Store?')) return;
    setResetting(true);
    try {
      await api.resetDemoData();
      await fetchDashboard();
      alert('Demo data restored successfully to default Shree General Store dataset!');
    } catch (err: any) {
      alert(`Error resetting demo: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  const handleApproveAction = async (approvalId: string) => {
    try {
      await api.approveAction(approvalId);
      await fetchDashboard();
      alert('Action approved and executed! Real-time inventory and supplier order records updated.');
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const { t } = useLanguage();
  const [scenarioPrompt, setScenarioPrompt] = useState<string | null>(null);
  const pendingApprovalsCount = dashboardData?.aiActions?.pendingApprovalsCount || 0;
  const urgentLowStockCount = dashboardData?.urgent?.lowStockCount || 0;

  const scenarios = [
    { label: `📦 ${t.scenarios.stock}`, prompt: t.scenarios.orderStockPrompt },
    { label: `💳 ${t.scenarios.payments}`, prompt: t.scenarios.paymentsPrompt },
    { label: `⚖️ ${t.scenarios.gst}`, prompt: t.scenarios.gstPrompt },
    { label: `🏛️ ${t.scenarios.schemes}`, prompt: t.scenarios.schemesPrompt },
    { label: `⛽ ${t.scenarios.expense}`, prompt: t.scenarios.expensePrompt },
    { label: `📈 ${t.scenarios.insights}`, prompt: t.scenarios.insightsPrompt },
    { label: `👥 ${t.scenarios.staff}`, prompt: t.scenarios.staffPrompt },
  ];

  const handleTriggerScenario = (prompt: string) => {
    setActiveTab('whatsapp');
    setScenarioPrompt(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Top Header */}
      <Header
        business={business}
        activeTab={activeTab}
        pendingApprovalsCount={pendingApprovalsCount}
        urgentLowStockCount={urgentLowStockCount}
        onResetDemo={handleResetDemo}
        resetting={resetting}
      />

      {/* Guided Demo Scenarios Bar */}
      <div className="bg-white/90 backdrop-blur-xs border-b border-slate-200/80 px-6 py-2 flex items-center space-x-2.5 overflow-x-auto text-xs shrink-0 no-scrollbar shadow-xs">
        <span className="text-[11px] font-bold text-primary-600 uppercase tracking-wider shrink-0 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          <span>{t.quickScenarios}</span>
        </span>
        {scenarios.map((sc, idx) => (
          <button
            key={idx}
            onClick={() => handleTriggerScenario(sc.prompt)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100/80 hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-200 hover:border-primary-300 font-medium transition text-[11px]"
          >
            {sc.label}
          </button>
        ))}
      </div>

      {/* Main Workspace with Sidebar & Active View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          pendingApprovalsCount={pendingApprovalsCount}
          urgentLowStockCount={urgentLowStockCount}
          business={business}
        />

        {/* Dynamic Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/60">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardTab
                data={dashboardData}
                loading={loadingDashboard}
                onNavigate={(tab) => setActiveTab(tab)}
                onApproveAction={handleApproveAction}
              />
            )}

            {activeTab === 'whatsapp' && (
              <WhatsAppSimulatorTab
                onApprovalUpdate={fetchDashboard}
                initialPrompt={scenarioPrompt}
                onPromptHandled={() => setScenarioPrompt(null)}
              />
            )}

            {activeTab === 'assistant' && <AiAssistantTab />}

            {activeTab === 'inventory' && (
              <InventoryTab onRefreshApprovals={fetchDashboard} />
            )}

            {activeTab === 'suppliers' && <SuppliersTab />}

            {activeTab === 'payments' && <PaymentsTab />}

            {activeTab === 'compliance' && <ComplianceTab />}

            {activeTab === 'schemes' && <SchemesTab />}

            {activeTab === 'approvals' && (
              <ApprovalsTab onApprovalDone={fetchDashboard} />
            )}

            {activeTab === 'staff' && <StaffTab />}

            {activeTab === 'activity' && <AgentActivityTab />}

            {activeTab === 'audit' && <AuditLogsTab />}

            {activeTab === 'settings' && (
              <SettingsTab onResetDemo={handleResetDemo} resetting={resetting} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
