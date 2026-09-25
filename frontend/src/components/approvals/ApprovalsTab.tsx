import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { ApprovalItem } from '../../types';

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

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Human-in-the-Loop Approval Center</h2>
          <p className="text-xs text-slate-500">
            Explicit verification gate for medium and high-risk agent operations. Autonomous side-effects are held until approved.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filter === s ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">Loading approval requests...</div>
      ) : approvals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
          <h3 className="font-bold text-slate-700 text-sm">No Approvals Matching Filter</h3>
          <p>When autonomous agents identify low inventory or financial tasks, proposals will appear here for one-click authorization.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.riskLevel === 'HIGH'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : app.riskLevel === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {app.riskLevel} Risk
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Proposed by <strong>{app.agentName}</strong>
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(app.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-2">{app.title}</h3>
                </div>

                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    app.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>

              {/* Rationale & Action Details */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Trigger Reason
                  </span>
                  <p className="text-slate-800 mt-0.5 font-medium">{app.reason}</p>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                    Proposed Autonomous Action
                  </span>
                  <p className="text-slate-900 mt-0.5 font-semibold text-sm leading-relaxed">
                    {app.proposedAction}
                  </p>
                </div>

                {app.amount && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-slate-500">Authorized Financial Value:</span>
                    <strong className="text-slate-900 text-sm">₹{app.amount.toLocaleString('en-IN')}</strong>
                  </div>
                )}
              </div>

              {/* Action Controls */}
              {app.status === 'PENDING' && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => handleReject(app._id)}
                    disabled={actionLoadingId === app._id}
                    className="px-4 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-700 text-xs font-semibold transition"
                  >
                    Reject Action
                  </button>
                  <button
                    onClick={() => handleApprove(app._id)}
                    disabled={actionLoadingId === app._id}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoadingId === app._id ? 'Executing...' : 'Approve & Execute Action'}</span>
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
