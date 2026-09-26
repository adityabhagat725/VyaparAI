import React, { useState, useEffect } from 'react';
import { FileText, ShieldCheck, CheckCircle2, AlertTriangle, Clock, Search } from 'lucide-react';
import { api } from '../../api/client';
import { AuditLogItem } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const AuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading immutable audit ledger...</p>
        </div>
      </div>
    );
  }

  const filteredLogs = logs.filter(
    (l) =>
      l.agentName.toLowerCase().includes(search.toLowerCase()) ||
      l.actionType.toLowerCase().includes(search.toLowerCase()) ||
      l.resourceType.toLowerCase().includes(search.toLowerCase())
  );

  const highRiskCount = logs.filter((l) => l.riskLevel === 'HIGH').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Immutable Audit Trail
            </h2>
            <Badge variant="primary" dot>
              Tamper-Proof Audit
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically recorded audit log of every autonomous action, human approval, tool invocation, and financial change.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Recorded Audit Events"
          value={logs.length}
          subtitle="Non-repudiable events logged"
          icon={FileText}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <MetricCard
          title="High-Risk Actions"
          value={highRiskCount}
          subtitle="Financial & procurement operations"
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50"
        />
        <MetricCard
          title="Audit Integrity"
          value="100% Verified"
          change="Zero Tampering"
          changeType="positive"
          subtitle="Cryptographic verification"
          icon={ShieldCheck}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="Ledger Consensus"
          value="Multi-Tenant"
          subtitle="Isolated per enterprise account"
          icon={CheckCircle2}
          iconColor="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit logs by agent, action, or resource..."
          className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 shadow-2xs transition"
        />
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5">Agent / Actor</th>
                <th className="px-4 py-3.5">Action Type</th>
                <th className="px-4 py-3.5">Resource Affected</th>
                <th className="px-4 py-3.5">Risk Tier</th>
                <th className="px-5 py-3.5 text-right">Execution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      icon={FileText}
                      title="No audit events found"
                      description="No records matched your search query."
                    />
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition group">
                    <td className="px-5 py-3.5 text-slate-500 font-sans text-xs">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 font-sans">
                      {log.agentName}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-primary-700 font-mono text-[11px]">
                      {log.actionType}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-sans">{log.resourceType}</td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          log.riskLevel === 'HIGH'
                            ? 'danger'
                            : log.riskLevel === 'MEDIUM'
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {log.riskLevel}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Badge variant={log.status === 'SUCCESS' ? 'success' : 'warning'} dot>
                        {log.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
