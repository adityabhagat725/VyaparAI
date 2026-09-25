import React from 'react';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Package,
  CreditCard,
  Scale,
  CheckCircle2,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { NavTab } from '../common/Sidebar';

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
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-slate-500 font-medium">Loading executive attention dashboard...</p>
        </div>
      </div>
    );
  }

  const { urgent, aiActions, businessSnapshot, agentActivity } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Core Value Proposition */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-900/60 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Autonomous Back Office Operating</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              &quot;It&apos;s not a dashboard. It&apos;s an AI back office that takes actions itself.&quot;
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              VyaparAI continuously monitors your inventory velocity, vendor ledger, GST deadlines, and government subsidies. When risks appear, agents plan procurement and draft filings, seeking your one-click approval.
            </p>
          </div>
          <button
            onClick={() => onNavigate('whatsapp')}
            className="shrink-0 flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-xl shadow-lg transition text-xs"
          >
            <span>Open WhatsApp Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION 1: URGENT ATTENTION ITEMS */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Urgent — Needs Immediate Attention
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Critical Stockout Alert */}
          <div className="bg-white rounded-2xl border border-red-200/80 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full uppercase">
                Critical Risk
              </span>
            </div>
            <h4 className="font-bold text-slate-900 mt-3 text-base">Cooking Oil & Rice Low</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Cooking oil runs out in <strong className="text-red-600 font-semibold">2 days</strong>. Rice has ~3 days left. Reorders prepared.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">{urgent.lowStockCount} items below threshold</span>
              <button
                onClick={() => onNavigate('inventory')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Fix Stock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Payment Discrepancy */}
          <div className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full uppercase">
                Payment Mismatch
              </span>
            </div>
            <h4 className="font-bold text-slate-900 mt-3 text-base">ABC Wholesale Discrepancy</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              ₹2,000 partial payment mismatch detected. Total vendor payables: <strong className="text-slate-900">₹{urgent.totalPendingPayments.toLocaleString('en-IN')}</strong>.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">{aiActions.discrepanciesCount} audit discrepancy</span>
              <button
                onClick={() => onNavigate('payments')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Reconcile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: GST Deadline */}
          <div className="bg-white rounded-2xl border border-blue-200/80 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full uppercase">
                Due in {urgent.nextComplianceDeadline?.daysRemaining || 5} Days
              </span>
            </div>
            <h4 className="font-bold text-slate-900 mt-3 text-base">
              {urgent.nextComplianceDeadline?.title || 'GSTR-3B Monthly Return'}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Agent reconciled 42 purchase invoices. Flagged 4 invoices needing vendor verification.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Draft prepared by AI</span>
              <button
                onClick={() => onNavigate('compliance')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
              >
                <span>Review Draft</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AI ACTIONS AWAITING APPROVAL */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AI Actions Awaiting Owner Approval ({aiActions.pendingApprovalsCount})
              </h3>
              <p className="text-xs text-slate-500">
                Agents have planned the work and drafted transactions. Authorize with one click to execute.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All Approvals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {aiActions.pendingApprovals.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            No pending approvals right now. Trigger procurement from WhatsApp or Inventory tab to see agent proposals.
          </div>
        ) : (
          <div className="space-y-3">
            {aiActions.pendingApprovals.map((app: any) => (
              <div
                key={app._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-emerald-300 transition gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{app.title}</span>
                    <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">
                      {app.riskLevel} Risk
                    </span>
                    <span className="text-[10px] text-slate-500">by {app.agentName}</span>
                  </div>
                  <p className="text-xs text-slate-600">{app.proposedAction}</p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => onApproveAction(app._id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
                  >
                    Approve Action
                  </button>
                  <button
                    onClick={() => onNavigate('approvals')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: BUSINESS SNAPSHOT METRICS */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Business Operational Snapshot
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Inventory Asset Value</span>
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₹{businessSnapshot.totalInventoryValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{businessSnapshot.totalProductsCount} SKUs monitored</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Pending Supplier Dues</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₹{businessSnapshot.pendingPaymentsAmount.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Across 3 wholesale vendors</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Recorded Expenses</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₹{businessSnapshot.totalExpensesRecorded.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Transport, rent, packaging</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Est. Monthly Turnover</span>
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              ₹{Math.round(businessSnapshot.estimatedMonthlyRunRate).toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Annual: ₹38.5 Lakhs</p>
          </div>
        </div>
      </div>

      {/* SECTION 4: RECENT AGENT ACTIVITY FEED */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Recent Autonomous Agent Activity
            </h3>
          </div>
          <button
            onClick={() => onNavigate('activity')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>Live Observability Trace</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {agentActivity.map((run: any) => (
            <div
              key={run._id}
              className="flex items-start justify-between text-xs p-3 rounded-lg bg-slate-50/70 border border-slate-100"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{run.orchestratorIntent}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                    {run.triggerSource}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    run.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {run.status}
                  </span>
                </div>
                <p className="text-slate-600">{run.summaryResult || run.userQuery || 'Autonomous surveillance execution.'}</p>
                <div className="text-[10px] text-slate-400">
                  {run.steps?.length || 0} tool steps executed • {new Date(run.createdAt).toLocaleTimeString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
