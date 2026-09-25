import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { api } from '../../api/client';
import { AuditLogItem } from '../../types';

export const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const data = await api.getAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading immutable audit ledger...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Immutable Audit Trail</h2>
        <p className="text-xs text-slate-500">
          Cryptographically recorded audit log of every autonomous action, human approval, tool invocation, and financial change.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Agent</th>
                <th className="px-4 py-3.5">Action Type</th>
                <th className="px-4 py-3.5">Resource</th>
                <th className="px-4 py-3.5">Risk Tier</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 text-slate-500 font-sans text-xs">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900 font-sans">
                    {log.agentName}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-emerald-800">
                    {log.actionType}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-sans">
                    {log.resourceType}
                  </td>
                  <td className="px-4 py-3.5 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      log.riskLevel === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : log.riskLevel === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.riskLevel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-sans">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      log.status === 'SUCCESS'
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-amber-700 bg-amber-50 border border-amber-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
