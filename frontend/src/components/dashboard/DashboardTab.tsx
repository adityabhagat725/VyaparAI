import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Package,
  CreditCard,
  Scale,
  ShieldCheck,
  TrendingUp,
  Clock,
  ExternalLink,
  Users,
  Award,
  Receipt,
  UserCheck,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Activity,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { NavTab } from '../common/Sidebar';
import { ActionCard } from '../ui/ActionCard';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

interface DashboardTabProps {
  data: any;
  loading: boolean;
  onNavigate: (tab: NavTab) => void;
  onApproveAction: (approvalId: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  data,
  loading,
  onNavigate,
  onApproveAction,
}) => {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Loading executive attention dashboard...</p>
        </div>
      </div>
    );
  }

  const { urgent, aiActions, businessSnapshot, agentActivity } = data;

  // 7-day trend mockup data for subtle chart visualization
  const trendData = [
    { day: 'Mon', sales: 21500, stockValue: 188000 },
    { day: 'Tue', sales: 23200, stockValue: 186500 },
    { day: 'Wed', sales: 19800, stockValue: 185000 },
    { day: 'Thu', sales: 26400, stockValue: 183200 },
    { day: 'Fri', sales: 28900, stockValue: 182400 },
    { day: 'Sat', sales: 34500, stockValue: 181000 },
    { day: 'Sun', sales: 31200, stockValue: 184200 },
  ];

  const agentTeam = [
    {
      id: 'inventory',
      name: 'Inventory Agent',
      role: 'Stock Velocity & Auto-PO',
      icon: Package,
      status: 'Surveillance Active',
      lastAction: 'Predicted cooking oil stockout in 48h',
      tab: 'inventory' as NavTab,
      color: 'text-rose-600 bg-rose-50',
    },
    {
      id: 'payments',
      name: 'Payment Agent',
      role: 'Ledger Audit & Discrepancies',
      icon: CreditCard,
      status: 'Auditing Ledger',
      lastAction: 'Flagged ₹2,000 ABC Wholesale mismatch',
      tab: 'payments' as NavTab,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'compliance',
      name: 'Compliance Agent',
      role: 'GST & Statutory Filings',
      icon: Scale,
      status: 'Draft Prepared',
      lastAction: 'Reconciled 42 purchase invoices for GSTR-3B',
      tab: 'compliance' as NavTab,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'schemes',
      name: 'Scheme Agent',
      role: 'MSME Subsidies & Loans',
      icon: Award,
      status: 'Monitoring Schemes',
      lastAction: 'Matched PMEGP 25% capital subsidy',
      tab: 'schemes' as NavTab,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'expense',
      name: 'Expense Agent',
      role: 'Petty Cash & Overhead OCR',
      icon: Receipt,
      status: 'Awaiting Vouchers',
      lastAction: 'Logged ₹500 tempo delivery diesel bill',
      tab: 'whatsapp' as NavTab,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'insights',
      name: 'Insights Agent',
      role: 'Profit Margins & Cashflow',
      icon: TrendingUp,
      status: 'Analyzing Health',
      lastAction: 'Estimated ₹3.20L monthly run-rate',
      tab: 'dashboard' as NavTab,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'staff',
      name: 'Staff Agent',
      role: 'Attendance & Advance Ledger',
      icon: UserCheck,
      status: 'Roster Synced',
      lastAction: 'Tracked ₹1,000 helper salary advance',
      tab: 'staff' as NavTab,
      color: 'text-teal-600 bg-teal-50',
    },
  ];

  return (
    <div className="space-y-7 pb-12 animate-fade-in">
      {/* 1. Executive Greeting Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-card relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Autonomous Back Office Operating</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300 font-normal">60s Surveillance Cycle</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Good morning, Ramesh 👋 Here&apos;s what your AI back office found today.
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              VyaparAI continuously monitors your inventory velocity, vendor ledger, GST deadlines, and government subsidies. When risks appear, agents plan procurement and draft filings, seeking your one-click approval.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => onNavigate('whatsapp')}
              className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl shadow-sm transition text-xs"
            >
              <span>WhatsApp Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('assistant')}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl border border-white/15 transition text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Attention Center: Needs Your Attention (The 3 Action Cards) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Needs Your Attention ({urgent.lowStockCount > 0 ? 3 : 0} Items Flagged)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Autonomous triggers awaiting verification</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1: Critical Stockout */}
          <ActionCard
            id="urgent-oil-stock"
            agentName="Inventory Agent"
            agentIcon={Package}
            severity="critical"
            title="Cooking Oil & Rice Stock Depletion"
            whatHappened="Cooking oil runs out in 2 days (4 units remaining, daily burn 2 units). Rice has ~3 days left."
            whyItMatters="Risk of losing ~₹4,200 in weekend kirana sales and disappointing recurring neighborhood customers."
            aiRecommendation="Reorder 20L Cooking oil & 50kg Rice from Mahadev Traders (Best wholesale rate: ₹130/L)."
            amount="₹3,400"
            riskLevel="HIGH"
            primaryActionLabel="Review & Order Stock"
            onPrimaryAction={() => onNavigate('inventory')}
            secondaryActionLabel="View Stock Velocity"
            onSecondaryAction={() => onNavigate('inventory')}
          />

          {/* Card 2: Payment Discrepancy */}
          <ActionCard
            id="urgent-abc-discrepancy"
            agentName="Payment Agent"
            agentIcon={CreditCard}
            severity="warning"
            title="ABC Wholesale Payment Mismatch"
            whatHappened="₹2,000 partial payment discrepancy detected between vendor invoice #INV-8821 and bank statement."
            whyItMatters={`Total vendor payables stand at ₹${urgent.totalPendingPayments.toLocaleString('en-IN')}; unresolved mismatches may freeze supplier credit.`}
            aiRecommendation="Reconcile ledger entry against UPI transaction reference #UPI-44910 and issue updated voucher."
            amount="₹2,000 Mismatch"
            riskLevel="MEDIUM"
            primaryActionLabel="Reconcile Payment"
            onPrimaryAction={() => onNavigate('payments')}
            secondaryActionLabel="Audit Ledger"
            onSecondaryAction={() => onNavigate('payments')}
          />

          {/* Card 3: GST Compliance Deadline */}
          <ActionCard
            id="urgent-gst-compliance"
            agentName="Compliance Agent"
            agentIcon={Scale}
            severity="info"
            title={`${urgent.nextComplianceDeadline?.title || 'GSTR-3B Return'} Due Soon`}
            whatHappened={`Monthly GSTR-3B tax return deadline is approaching (due in ${urgent.nextComplianceDeadline?.daysRemaining || 5} days).`}
            whyItMatters="Late fee of ₹50/day and 18% p.a. interest penalty automatically applies on unpaid tax liability."
            aiRecommendation="Agent has auto-reconciled 42 purchase invoices. 4 pending invoices flagged for vendor verification."
            amount="₹14,250 Tax Liability"
            riskLevel="LOW"
            primaryActionLabel="Review GSTR-3B Draft"
            onPrimaryAction={() => onNavigate('compliance')}
            secondaryActionLabel="Export JSON"
            onSecondaryAction={() => onNavigate('compliance')}
          />
        </div>
      </section>

      {/* 3. AI Actions Awaiting Owner Approval (HITL Queue) */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Human-In-The-Loop Approval Queue
                </h3>
                <Badge variant="warning">{aiActions.pendingApprovalsCount} Pending</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Autonomous agents draft purchase orders, adjustments, and filings. You authorize execution with 1 click.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1 shrink-0 self-start sm:self-auto"
          >
            <span>Open Decision Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {aiActions.pendingApprovals.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Approval Queue Cleared"
            description="No pending actions requiring owner consent right now. Use WhatsApp or Inventory to propose new stock reorders."
            actionLabel="Simulate WhatsApp Command"
            onAction={() => onNavigate('whatsapp')}
          />
        ) : (
          <div className="space-y-3">
            {aiActions.pendingApprovals.map((app: any) => (
              <div
                key={app._id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 hover:bg-slate-50 transition gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{app.title}</span>
                    <Badge variant={app.riskLevel === 'HIGH' ? 'danger' : 'warning'}>
                      {app.riskLevel} RISK
                    </Badge>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Generated by <span className="text-slate-700 font-semibold">{app.agentName}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{app.proposedAction}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onApproveAction(app._id)}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-xs shadow-xs transition active:scale-95"
                  >
                    Approve & Execute
                  </button>
                  <button
                    onClick={() => onNavigate('approvals')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-medium transition"
                  >
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Business Operational Snapshot Metrics & Cashflow Chart */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Business Operational Snapshot
          </h2>
          <span className="text-xs text-slate-500">Live multi-tenant ledger synchronization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Est. Monthly Run-Rate"
            value={`₹${Math.round(businessSnapshot.estimatedMonthlyRunRate).toLocaleString('en-IN')}`}
            change="+12.4% vs last mo"
            changeType="positive"
            subtitle="Annualized ~₹38.5 Lakhs"
            icon={TrendingUp}
            iconColor="text-indigo-600 bg-indigo-50"
            onClick={() => onNavigate('dashboard')}
          />

          <MetricCard
            title="Inventory Asset Value"
            value={`₹${businessSnapshot.totalInventoryValue.toLocaleString('en-IN')}`}
            change={`${businessSnapshot.totalProductsCount} SKUs Active`}
            changeType="neutral"
            subtitle="Cooking oil & Rice low"
            icon={Package}
            iconColor="text-emerald-600 bg-emerald-50"
            onClick={() => onNavigate('inventory')}
          />

          <MetricCard
            title="Pending Supplier Dues"
            value={`₹${businessSnapshot.pendingPaymentsAmount.toLocaleString('en-IN')}`}
            change="3 Overdue Invoices"
            changeType="negative"
            subtitle="ABC Wholesale mismatch"
            icon={CreditCard}
            iconColor="text-amber-600 bg-amber-50"
            onClick={() => onNavigate('payments')}
          />

          <MetricCard
            title="Recorded Operating Expenses"
            value={`₹${businessSnapshot.totalExpensesRecorded.toLocaleString('en-IN')}`}
            change="17 AI Logged Vouchers"
            changeType="positive"
            subtitle="Transport, rent, wages"
            icon={Receipt}
            iconColor="text-blue-600 bg-blue-50"
            onClick={() => onNavigate('whatsapp')}
          />
        </div>

        {/* Weekly Revenue & Inventory Value Sparkline Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                7-Day Cashflow & Inventory Trajectory
              </h3>
              <p className="text-[11px] text-slate-500">
                Daily sales turnover vs inventory stock asset valuation
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-600" />
                <span>Daily Sales</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Inventory Value</span>
              </span>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#FFF',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="sales" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 5. Your AI Team (Agent Status Grid) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Your AI Team (7 Specialized Autonomous Agents)
            </h2>
          </div>
          <span className="text-xs text-slate-500">Deterministic business rules + LLM reasoning</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agentTeam.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                onClick={() => onNavigate(agent.tab)}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-xl ${agent.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-primary-600 transition">
                      {agent.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{agent.role}</p>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {agent.lastAction}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-primary-600 font-semibold">
                  <span>Open Module</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Recent Agent Activity Feed & Observability */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Recent Autonomous Agent Execution Trace
              </h3>
              <p className="text-xs text-slate-500">
                End-to-end audit log of tools executed, inferences made, and transactions created.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('activity')}
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <span>Live Observability Trace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {agentActivity && agentActivity.length > 0 ? (
            agentActivity.slice(0, 5).map((run: any) => (
              <div
                key={run._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:border-slate-300 transition gap-2 text-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-bold text-slate-900">{run.orchestratorIntent}</span>
                    <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      {run.triggerSource}
                    </span>
                    <Badge variant={run.status === 'COMPLETED' ? 'success' : 'warning'}>
                      {run.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600 text-xs">
                    {run.summaryResult || run.userQuery || 'Autonomous surveillance execution.'}
                  </p>
                </div>

                <div className="text-[11px] text-slate-400 shrink-0 font-medium sm:text-right">
                  <div>{run.steps?.length || 0} tool steps executed</div>
                  <div className="text-[10px]">{new Date(run.createdAt).toLocaleTimeString('en-IN')}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 py-3 text-center">No recent activity logged yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};
