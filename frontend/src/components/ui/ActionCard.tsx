import React from 'react';
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { Badge } from './Badge';

export interface ActionCardProps {
  id: string;
  agentName: string;
  agentIcon?: React.ElementType;
  severity?: 'critical' | 'warning' | 'info';
  title: string;
  whatHappened: string;
  whyItMatters: string;
  aiRecommendation: string;
  amount?: string | number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  submitting?: boolean;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  agentName,
  agentIcon: AgentIcon = Sparkles,
  severity = 'info',
  title,
  whatHappened,
  whyItMatters,
  aiRecommendation,
  amount,
  riskLevel = 'MEDIUM',
  primaryActionLabel = 'Approve & Execute',
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  submitting = false,
}) => {
  const severityBorder = {
    critical: 'border-l-4 border-l-red-500 border-y border-r border-slate-200/80',
    warning: 'border-l-4 border-l-amber-500 border-y border-r border-slate-200/80',
    info: 'border-l-4 border-l-indigo-500 border-y border-r border-slate-200/80',
  }[severity];

  const severityBadge = {
    critical: <Badge variant="danger" dot>Critical Action</Badge>,
    warning: <Badge variant="warning" dot>Needs Review</Badge>,
    info: <Badge variant="primary" dot>AI Recommendation</Badge>,
  }[severity];

  return (
    <div
      className={`bg-white rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between ${severityBorder}`}
    >
      <div>
        {/* Top Header: Agent & Severity */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <AgentIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold text-slate-700">{agentName}</span>
          </div>
          <div>{severityBadge}</div>
        </div>

        {/* Title & Core Details */}
        <div className="mt-3">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-base font-semibold text-slate-900 leading-snug">{title}</h4>
            {amount && (
              <span className="text-base font-bold text-slate-900 font-mono shrink-0">
                {typeof amount === 'number' ? `₹${amount.toLocaleString('en-IN')}` : amount}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">{whatHappened}</p>
        </div>

        {/* Why it matters & AI Recommendation Container */}
        <div className="mt-3 bg-slate-50/90 rounded-xl p-3 border border-slate-100 space-y-2">
          <div className="text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Impact: </span>
            {whyItMatters}
          </div>
          <div className="text-[11px] text-indigo-900 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100/80 flex items-start space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-indigo-700">AI Plan: </span>
              {aiRecommendation}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Risk badge and Actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-[11px] text-slate-500">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {riskLevel} Risk • Requires Authorization
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
            >
              {secondaryActionLabel}
            </button>
          )}

          {onPrimaryAction && (
            <button
              disabled={submitting}
              onClick={onPrimaryAction}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              {submitting ? (
                <span>Executing...</span>
              ) : (
                <>
                  <span>{primaryActionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
