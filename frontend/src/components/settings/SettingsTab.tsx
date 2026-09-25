import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, CheckCircle2, ShieldCheck, Building } from 'lucide-react';
import { api } from '../../api/client';
import { Business } from '../../types';

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
    return <div className="p-8 text-center text-xs text-slate-500">Loading business settings...</div>;
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings & AI Governance</h2>
        <p className="text-xs text-slate-500">
          Configure enterprise profile, automated action boundaries, risk thresholds, and demo reset controls.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <Building className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Enterprise Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Business Name</label>
              <input
                type="text"
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Business Category / Type</label>
              <input
                type="text"
                value={business.businessType}
                onChange={(e) => setBusiness({ ...business, businessType: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">GSTIN</label>
              <input
                type="text"
                value={business.gstin || ''}
                onChange={(e) => setBusiness({ ...business, gstin: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Annual Turnover (INR)</label>
              <input
                type="number"
                value={business.annualTurnover || 0}
                onChange={(e) => setBusiness({ ...business, annualTurnover: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 font-semibold mb-1">Store Address & City</label>
              <input
                type="text"
                value={`${business.address}, ${business.city}, ${business.state}`}
                onChange={(e) => setBusiness({ ...business, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* AI Action Boundaries & Risk Governance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">AI Autonomy & Safety Boundaries</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <div>
                <span className="font-bold text-slate-900 block">Auto-Execute Low-Risk Tasks</span>
                <span className="text-slate-500">Allow agents to automatically categorize expenses, recalculate stock velocity, and log audit entries without prompting.</span>
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
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {/* Reset Demo Data Button */}
          <button
            type="button"
            onClick={onResetDemo}
            disabled={resetting}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Restore Shree General Store Demo Seed</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
