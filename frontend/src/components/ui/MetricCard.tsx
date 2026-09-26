import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  icon?: React.ElementType;
  iconColor?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-600 bg-indigo-50',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:border-slate-300 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 tracking-tight">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline justify-between">
        <div className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">
          {value}
        </div>
        {change && (
          <div
            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
              changeType === 'positive'
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                : changeType === 'negative'
                ? 'text-red-700 bg-red-50 border border-red-200/60'
                : 'text-slate-600 bg-slate-100 border border-slate-200/60'
            }`}
          >
            {changeType === 'positive' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
            {changeType === 'negative' && <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtitle && <p className="mt-1.5 text-xs text-slate-400 font-normal">{subtitle}</p>}
    </div>
  );
};
