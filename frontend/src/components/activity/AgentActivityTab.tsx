import React, { useState, useEffect } from 'react';
import { Activity, Clock, Cpu, CheckCircle2, ChevronDown, ChevronRight, Terminal, ArrowDown } from 'lucide-react';
import { api } from '../../api/client';
import { AgentRunItem } from '../../types';

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
    return <div className="p-8 text-center text-xs text-slate-500">Loading agent telemetry and reasoning runs...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Agent Activity & Observability Trace</h2>
        <p className="text-xs text-slate-500">
          Live execution trace showing how Orchestrator interprets intents, plans workflows, and invokes controlled tools.
        </p>
      </div>

      <div className="space-y-4">
        {runs.map((run) => {
          const isExpanded = expandedRunId === run._id;
          return (
            <div
              key={run._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition"
            >
              <div
                onClick={() => toggleExpand(run._id)}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/80 transition"
              >
                <div className="flex items-start sm:items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-900 text-sm">{run.orchestratorIntent}</h3>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">
                        {run.triggerSource}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        run.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Query: &quot;{run.userQuery || 'Automated background surveillance'}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs text-slate-400">
                  <div className="text-right">
                    <div>{run.steps?.length || 0} tool steps</div>
                    <div className="text-[10px]">{new Date(run.createdAt).toLocaleTimeString('en-IN')}</div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </div>

              {/* Expanded Step-by-Step Execution Graph */}
              {isExpanded && (
                <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider my-3">
                    Execution Trace & Tool Calls
                  </div>

                  <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
                    {run.steps?.map((step) => (
                      <div key={step.stepNumber} className="relative text-xs">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow-sm"></div>
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              Step {step.stepNumber}: {step.action}
                            </span>
                            <span className="text-[10px] text-slate-400">{step.durationMs}ms</span>
                          </div>

                          <div className="text-slate-600 leading-relaxed font-sans">
                            {step.reasoning}
                          </div>

                          {step.toolCalled && (
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center space-x-1.5 font-mono text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg">
                              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tool Invoked: <strong>{step.toolCalled}()</strong></span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {run.summaryResult && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
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
