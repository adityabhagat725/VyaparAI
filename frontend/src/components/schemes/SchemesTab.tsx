import React, { useState, useEffect } from 'react';
import { Award, CheckCircle2, FileText, ArrowRight, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { SchemeItem } from '../../types';

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
    return <div className="p-8 text-center text-xs text-slate-500">Matching enterprise profile against MSME schemes...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Government MSME Schemes & Subsidies</h2>
        <p className="text-xs text-slate-500">
          Automated eligibility matching based on turnover, sector, location, and registration records.
        </p>
      </div>

      {/* Demo Data Disclaimer Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start space-x-3 text-xs text-blue-900">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold">AI Relevance Matching Indicator</h4>
          <p className="text-blue-800 mt-0.5 leading-relaxed">
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
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-lg">{scheme.name}</h3>
                  <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded uppercase">
                    {scheme.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{scheme.ministry}</p>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-medium">AI Relevance Match</div>
                  <div className="text-xl font-black text-emerald-600">{scheme.matchScore}%</div>
                </div>
              </div>
            </div>

            {/* Scheme Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium block">Potential Financial Benefit</span>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{scheme.benefitSummary}</div>
                <div className="text-emerald-700 font-semibold mt-1">Max Ceiling: {scheme.maxBenefitAmount}</div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-medium block">Why Your Business Qualifies</span>
                <p className="text-slate-800 mt-0.5 leading-relaxed">{scheme.matchReason}</p>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="pt-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Required Verification Documents:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {scheme.requiredDocuments.map((doc, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg border border-slate-200"
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
                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                  {scheme.applicationStatus.replace(/_/g, ' ')}
                </span>
                <a
                  href={scheme.officialPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 hover:text-emerald-800 font-medium flex items-center space-x-1 ml-2"
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
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-40 flex items-center space-x-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>{generatingId === scheme.schemeId ? 'Generating...' : 'Pre-fill Application Draft'}</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
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
