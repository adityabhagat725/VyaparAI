import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
  ArrowRight,
  TrendingDown,
  DollarSign,
  Package,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';
import { ApprovalItem } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

interface ApprovalsTabProps {
  onApprovalDone?: () => void;
}

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({ onApprovalDone }) => {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await api.getApprovals(filter === 'ALL' ? undefined : filter);
      setApprovals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const handleApprove = async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.approveAction(id);
      await fetchApprovals();
      if (onApprovalDone) onApprovalDone();
      alert('Action approved! Autonomous execution completed and logged to audit trail.');
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.rejectAction(id);
      await fetchApprovals();
      if (onApprovalDone) onApprovalDone();
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingCount = approvals.filter((a) => a.status === 'PENDING').length;
  const highRiskCount = approvals.filter((a) => a.riskLevel === 'HIGH' && a.status === 'PENDING').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Human-In-The-Loop Approval Center
            </h2>
            <Badge variant="warning" dot>
              HITL Safety Verification
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Explicit authorization gate for medium and high-risk agent operations. Autonomous side-effects are held until approved.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs shrink-0 shadow-2xs">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition text-xs ${
                filter === s
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Awaiting Decision"
          value={pendingCount}
          change={pendingCount > 0 ? 'Requires Action' : 'All Clear'}
          changeType={pendingCount > 0 ? 'negative' : 'positive'}
          subtitle="Proposals pending owner review"
          icon={ShieldAlert}
          iconColor="text-amber-600 bg-amber-50"
        />
        <MetricCard
          title="High-Risk Operations"
          value={highRiskCount}
          subtitle="Stock reorders > ₹2,000"
          icon={AlertCircle}
          iconColor="text-rose-600 bg-rose-50"
        />
        <MetricCard
          title="Autonomous Guardrails"
          value="Active"
          subtitle="Owner consent required for execution"
          icon={ShieldCheck}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="Audit Trail Logging"
          value="100%"
          subtitle="Every decision cryptographically logged"
          icon={CheckCircle2}
          iconColor="text-indigo-600 bg-indigo-50"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading approval requests...</p>
          </div>
        </div>
      ) : approvals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-12 shadow-card">
          <EmptyState
            icon={CheckCircle2}
            title="Approval Queue Cleared"
            description="When autonomous agents identify low inventory, payment mismatches, or tax deadlines, proposals will appear here for one-click authorization."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <Badge
                      variant={
                        app.riskLevel === 'HIGH'
                          ? 'danger'
                          : app.riskLevel === 'MEDIUM'
                          ? 'warning'
                          : 'primary'
                      }
                      dot
                    >
                      {app.riskLevel} RISK
                    </Badge>
                    <span className="text-xs font-semibold text-slate-500">
                      Proposed by <strong className="text-slate-800">{app.agentName}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(app.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base tracking-tight pt-1">
                    {app.title}
                  </h3>
                </div>

                <div>
                  <Badge
                    variant={
                      app.status === 'APPROVED'
                        ? 'success'
                        : app.status === 'REJECTED'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              </div>

              {/* Rationale & Action Details (Standard 4-Part Structure) */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                    Trigger Reason
                  </span>
                  <p className="text-slate-800 mt-0.5 font-medium leading-relaxed">{app.reason}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block">
                    Proposed Autonomous Action
                  </span>
                  <p className="text-slate-900 mt-0.5 font-semibold text-xs leading-relaxed">
                    {app.proposedAction}
                  </p>
                </div>

                {app.amount && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-slate-500">Authorized Financial Value:</span>
                    <strong className="text-slate-900 text-sm font-semibold">
                      ₹{app.amount.toLocaleString('en-IN')}
                    </strong>
                  </div>
                )}
              </div>

              {/* Action Controls */}
              {app.status === 'PENDING' && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => handleReject(app._id)}
                    disabled={actionLoadingId === app._id}
                    className="px-4 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold transition active:scale-95 disabled:opacity-40"
                  >
                    Reject Action
                  </button>
                  <button
                    onClick={() => handleApprove(app._id)}
                    disabled={actionLoadingId === app._id}
                    className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 active:scale-95 disabled:opacity-40"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {actionLoadingId === app._id ? 'Executing...' : 'Approve & Execute Action'}
                    </span>
                  </button>
                </div>
              )}

              {app.status === 'APPROVED' && (
                <div className="text-xs text-emerald-700 font-medium flex items-center space-x-1.5 pt-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Approved and executed. Immutable audit record created.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
