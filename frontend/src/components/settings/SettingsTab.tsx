import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Building,
  Sliders,
  AlertTriangle,
  Lock,
  Sparkles,
} from 'lucide-react';
import { api } from '../../api/client';
import { Business } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';

interface SettingsTabProps {
  onResetDemo: () => void;
  resetting: boolean;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onResetDemo, resetting }) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await api.getSettings();
        setBusiness(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await api.updateSettings(business);
      setBusiness(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !business) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading enterprise settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Settings & AI Governance Controls
          </h2>
          <Badge variant="primary" dot>
            Enterprise Governance
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure enterprise profile, automated action boundaries, risk thresholds, and demo dataset controls.
        </p>
      </div>

      {/* Top Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Data Isolation"
          value="Multi-Tenant"
          subtitle="Strict businessId query scoping"
          icon={Lock}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <MetricCard
          title="Surveillance Frequency"
          value="60 Seconds"
          subtitle="Continuous autonomous loop"
          icon={Sliders}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="Human Consent Gate"
          value="Enforced"
          subtitle="Required for PO & financial disbursements"
          icon={ShieldCheck}
          iconColor="text-blue-600 bg-blue-50"
        />
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2 shadow-2xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully! Updated runtime agent configurations.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                Enterprise & Legal Profile
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">ID: {business._id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Business Name</label>
              <input
                type="text"
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs transition"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Business Category / Industry
              </label>
              <input
                type="text"
                value={business.businessType}
                onChange={(e) => setBusiness({ ...business, businessType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs transition"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                GSTIN (Tax Identification)
              </label>
              <input
                type="text"
                value={business.gstin || ''}
                onChange={(e) => setBusiness({ ...business, gstin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 font-mono text-xs transition"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Estimated Annual Turnover (INR)
              </label>
              <input
                type="number"
                value={business.annualTurnover || 0}
                onChange={(e) =>
                  setBusiness({ ...business, annualTurnover: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">
                Operating Address & Location
              </label>
              <input
                type="text"
                value={`${business.address}, ${business.city}, ${business.state}`}
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs transition"
              />
            </div>
          </div>
        </div>

        {/* AI Action Boundaries & Risk Governance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">
              AI Autonomy & Safety Boundaries
            </h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition">
              <div className="space-y-0.5 pr-4">
                <span className="font-bold text-slate-900 block">
                  Auto-Execute Low-Risk Operations
                </span>
                <span className="text-slate-500 text-[11px] leading-relaxed">
                  Allow agents to automatically categorize receipts, recalculate stock velocity, and log audit entries without prompting.
                </span>
              </div>
              <input
                type="checkbox"
                checked={business.settings?.autoApproveLowRisk ?? true}
                onChange={(e) =>
                  setBusiness({
                    ...business,
                    settings: {
                      ...(business.settings as any),
                      autoApproveLowRisk: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-primary-600 rounded accent-primary-600"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Critical Stockout Threshold (Days Left)
                </label>
                <input
                  type="number"
                  value={business.settings?.stockoutRiskThresholdDays || 4}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      settings: {
                        ...(business.settings as any),
                        stockoutRiskThresholdDays: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs transition"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  GST Deadline Warning (Days Ahead)
                </label>
                <input
                  type="number"
                  value={business.settings?.gstAlertDaysPrior || 7}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      settings: {
                        ...(business.settings as any),
                        gstAlertDaysPrior: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs transition"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Demo Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={onResetDemo}
            disabled={resetting}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition active:scale-95 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Restore Shree General Store Demo Seed</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-xs transition active:scale-95 disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
