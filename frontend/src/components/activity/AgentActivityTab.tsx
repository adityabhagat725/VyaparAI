import React, { useState, useEffect } from 'react';
import {
  Activity,
  Clock,
  Cpu,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Terminal,
  ArrowDown,
  Sparkles,
  Zap,
} from 'lucide-react';
import { api } from '../../api/client';
import { AgentRunItem } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const AgentActivityTab: React.FC = () => {
  const [runs, setRuns] = useState<AgentRunItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      try {
        const data = await api.getAgentActivity();
        setRuns(data);
        if (data.length > 0) setExpandedRunId(data[0]._id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedRunId(expandedRunId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Loading agent telemetry and reasoning traces...
          </p>
        </div>
      </div>
    );
  }

  const totalToolCalls = runs.reduce((acc, r) => acc + (r.steps?.length || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Agent Activity & Observability Trace
            </h2>
            <Badge variant="primary" dot>
              Live Telemetry
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step telemetry showing how the Orchestrator interprets intents, plans workflows, and invokes verified tools.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Autonomous Executions"
          value={runs.length}
          subtitle="Total agent reasoning loops"
          icon={Activity}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <MetricCard
          title="Verified Tool Steps"
          value={totalToolCalls}
          subtitle="Database queries & mutations"
          icon={Terminal}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="Execution Success Rate"
          value="100%"
          change="0 Failures"
          changeType="positive"
          subtitle="Deterministic error recovery"
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="Active Micro-Agents"
          value="7 Agents"
          subtitle="Inventory, Pay, GST, Staff, etc."
          icon={Cpu}
          iconColor="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Runs Trace List */}
      <div className="space-y-4">
        {runs.map((run) => {
          const isExpanded = expandedRunId === run._id;
          return (
            <div
              key={run._id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-card transition hover:border-slate-300"
            >
              <div
                onClick={() => toggleExpand(run._id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/60 transition"
              >
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                        {run.orchestratorIntent}
                      </h3>
                      <Badge variant="neutral">{run.triggerSource}</Badge>
                      <Badge variant={run.status === 'COMPLETED' ? 'success' : 'warning'}>
                        {run.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Query:{' '}
                      <span className="text-slate-700 font-medium">
                        &quot;{run.userQuery || 'Automated background surveillance'}&quot;
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs text-slate-400">
                  <div className="text-right">
                    <div className="font-medium text-slate-700">
                      {run.steps?.length || 0} tool steps
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(run.createdAt).toLocaleTimeString('en-IN')}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Step-by-Step Execution Graph */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/40 animate-fade-in">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider my-3.5">
                    Execution Trace & Tool Pipeline
                  </div>

                  <div className="relative pl-6 space-y-3.5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {run.steps?.map((step) => (
                      <div key={step.stepNumber} className="relative text-xs">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary-600 border-2 border-white shadow-2xs"></div>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">
                              Step {step.stepNumber}: {step.action}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {step.durationMs}ms
                            </span>
                          </div>

                          <div className="text-slate-600 leading-relaxed font-sans text-xs">
                            {step.reasoning}
                          </div>

                          {step.toolCalled && (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center space-x-1.5 font-mono text-[11px] text-primary-800 bg-primary-50/60 p-2 rounded-lg">
                              <Terminal className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                              <span>
                                Tool Invoked: <strong>{step.toolCalled}()</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {run.summaryResult && (
                    <div className="mt-4 p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
                      <strong>Result Summary:</strong> {run.summaryResult}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
