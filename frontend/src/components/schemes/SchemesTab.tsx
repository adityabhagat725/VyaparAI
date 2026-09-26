import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  FileText,
  ArrowRight,
  ExternalLink,
  Sparkles,
  AlertCircle,
  Building2,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { api } from '../../api/client';
import { SchemeItem } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const SchemesTab: React.FC = () => {
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const data = await api.getSchemes();
      setSchemes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleGenerateDraft = async (schemeId: string) => {
    setGeneratingId(schemeId);
    try {
      await api.generateSchemeDraft(schemeId);
      await fetchSchemes();
      alert('Application draft generated successfully! Required document checklist prepared.');
    } catch (err: any) {
      alert(`Error generating draft: ${err.message}`);
    } finally {
      setGeneratingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Matching enterprise profile against MSME schemes...
          </p>
        </div>
      </div>
    );
  }

  const eligibleCount = schemes.filter((s) => s.matchScore >= 80).length;
  const draftsCount = schemes.filter((s) => s.applicationStatus !== 'DISCOVERED').length;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Government MSME Schemes & Subsidies
            </h2>
            <Badge variant="primary" dot>
              Scheme Agent Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated eligibility matching based on turnover, sector, location, and Udyam MSME registration records.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Matched MSME Schemes"
          value={schemes.length}
          subtitle="Screened against store profile"
          icon={Award}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="High Match Eligibility"
          value={eligibleCount}
          change="> 80% Match"
          changeType="positive"
          subtitle="Qualifies under retail MSME"
          icon={Percent}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <MetricCard
          title="Max Potential Capital Subsidy"
          value="₹25 Lakhs"
          subtitle="PMEGP Credit Linked Subsidy"
          icon={TrendingUp}
          iconColor="text-amber-600 bg-amber-50"
        />
        <MetricCard
          title="Application Drafts Prepared"
          value={draftsCount}
          subtitle="Auto-filled with store data"
          icon={FileText}
          iconColor="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Demo Data Disclaimer Banner */}
      <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-indigo-950 shadow-card">
        <Sparkles className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h4 className="font-bold text-primary-900">AI Relevance Matching Indicator</h4>
          <p className="text-indigo-800 leading-relaxed text-[11px]">
            Match percentages indicate semantic alignment with published scheme parameters and do not constitute legal eligibility guarantees.
            <strong> DEMO DATA — replace with verified government data before production.</strong>
          </p>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="space-y-4">
        {schemes.map((scheme) => (
          <div
            key={scheme.schemeId}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-lg tracking-tight">{scheme.name}</h3>
                  <Badge variant="neutral">{scheme.code}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">{scheme.ministry}</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 font-medium">AI Relevance Match</div>
                  <div className="text-xl font-black text-emerald-600">{scheme.matchScore}%</div>
                </div>
              </div>
            </div>

            {/* Scheme Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Potential Financial Benefit
                </span>
                <div className="font-bold text-slate-900 text-sm">{scheme.benefitSummary}</div>
                <div className="text-primary-700 font-semibold text-xs pt-0.5">
                  Max Ceiling: {scheme.maxBenefitAmount}
                </div>
              </div>

              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Why Your Business Qualifies
                </span>
                <p className="text-slate-800 leading-relaxed text-xs">{scheme.matchReason}</p>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="pt-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Required Verification Documents:
              </span>
              <div className="flex flex-wrap gap-2">
                {scheme.requiredDocuments.map((doc, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-slate-100/80 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200"
                  >
                    ✓ {doc}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-500">Status:</span>
                <Badge variant={scheme.applicationStatus === 'DISCOVERED' ? 'neutral' : 'success'}>
                  {scheme.applicationStatus.replace(/_/g, ' ')}
                </Badge>
                <a
                  href={scheme.officialPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 hover:text-primary-800 font-medium flex items-center space-x-1 ml-2 transition"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div>
                {scheme.applicationStatus === 'DISCOVERED' ? (
                  <button
                    onClick={() => handleGenerateDraft(scheme.schemeId)}
                    disabled={generatingId === scheme.schemeId}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-xs transition disabled:opacity-40 flex items-center space-x-1.5 active:scale-95"
                  >
                    <FileText className="w-4 h-4" />
                    <span>
                      {generatingId === scheme.schemeId
                        ? 'Generating...'
                        : 'Pre-fill Application Draft'}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-bold bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Application Draft Ready</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
