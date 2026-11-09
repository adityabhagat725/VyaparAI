import React, { useState, useEffect } from 'react';
import {
  Scale,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
  X,
  Download,
  Printer,
  Calendar,
  Building2,
  FileCheck2,
} from 'lucide-react';
import { api } from '../../api/client';
import { ComplianceTaskItem } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const ComplianceTab: React.FC = () => {
  const [tasks, setTasks] = useState<ComplianceTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorizingId, setAuthorizingId] = useState<string | null>(null);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<ComplianceTaskItem | null>(null);

  const fetchCompliance = async () => {
    setLoading(true);
    try {
      const data = await api.getCompliance();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompliance();
  }, []);

  const handleAuthorizeFiling = async (taskId: string) => {
    setAuthorizingId(taskId);
    try {
      await api.authorizeCompliance(taskId);
      await fetchCompliance();
      if (selectedTaskForModal) {
        setSelectedTaskForModal(null);
      }
      alert('Return authorized! Simulated submission generated with official GSTN acknowledgment reference.');
    } catch (err: any) {
      alert(`Error authorizing return: ${err.message}`);
    } finally {
      setAuthorizingId(null);
    }
  };

  const handleDownloadGstnJson = (task: any) => {
    const gstnPayload = {
      gstin: '27AABCS1429B1Z1',
      fp: task.period || '082026',
      form_type: task.formType || 'GSTR-3B',
      turnover_details: {
        gross_turnover: task.preparedData?.totalTurnover || 320000,
        taxable_value: task.preparedData?.taxableValue || 295000,
      },
      tax_liability: {
        cgst: task.preparedData?.cgstAmount || 7375,
        sgst: task.preparedData?.sgstAmount || 7375,
        igst: task.preparedData?.igstAmount || 2400,
      },
      itc_eligible: {
        total_itc_claimed: task.preparedData?.itcEligible || 12850,
        invoices_reconciled: task.preparedData?.invoicesCount || 42,
        flagged_invoices: task.preparedData?.flaggedInvoicesCount || 4,
      },
      preparation_metadata: {
        prepared_by: 'VyaparAI Autonomous Multi-Agent Back Office',
        compliance_engine: 'GSTN-Draft-Engine v1.0',
        timestamp: new Date().toISOString(),
        disclaimer: task.filingDisclaimer,
      },
    };

    const blob = new Blob([JSON.stringify(gstnPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GSTN_${task.formType || 'GSTR3B'}_${(task.period || 'current').replace(
      /\s+/g,
      '_'
    )}_Draft.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Loading statutory compliance calendar & tax reconciliation...
          </p>
        </div>
      </div>
    );
  }

  const primaryTask = tasks[0];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              GST & Statutory Tax Compliance
            </h2>
            <Badge variant="primary" dot>
              GSTN Draft Engine Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Autonomous tax calendar tracking, purchase invoice ITC reconciliation, and official Form GSTR-3B builders.
          </p>
        </div>

        {primaryTask && (
          <button
            onClick={() => handleDownloadGstnJson(primaryTask)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-xs transition shadow-2xs self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export GSTR-3B JSON</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Taxable Sales Turnover"
          value={`₹${primaryTask?.preparedData?.taxableValue?.toLocaleString('en-IN') || '2,95,000'}`}
          change="Reconciled from Sales"
          changeType="positive"
          subtitle="Taxable base for current period"
          icon={FileText}
          iconColor="text-indigo-600 bg-indigo-50"
        />

        <MetricCard
          title="Eligible ITC (Tax Credit)"
          value={`₹${primaryTask?.preparedData?.itcEligible?.toLocaleString('en-IN') || '12,850'}`}
          change="42 Invoices Matched"
          changeType="positive"
          subtitle="Input Tax Credit claimed"
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50"
        />

        <MetricCard
          title="Tax Liability (CGST+SGST)"
          value={`₹${(
            (primaryTask?.preparedData?.cgstAmount || 7375) +
            (primaryTask?.preparedData?.sgstAmount || 7375)
          ).toLocaleString('en-IN')}`}
          subtitle="Net output tax payable"
          icon={Scale}
          iconColor="text-amber-600 bg-amber-50"
        />

        <MetricCard
          title="Vendor Invoices Flagged"
          value={`${primaryTask?.preparedData?.flaggedInvoicesCount || 4} Invoices`}
          change="Needs Verification"
          changeType="negative"
          subtitle="Missing supplier GST filings"
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50"
        />
      </div>

      {/* Compliance Task Cards */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.taskId}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-card flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-bold text-slate-900 text-lg tracking-tight">{task.title}</h3>
                  <Badge variant="neutral">Period: {task.period}</Badge>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Form Category: {task.category} ({task.formType})
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={task.status === 'SUBMITTED' ? 'success' : 'warning'} dot>
                  {task.status.replace('_', ' ')}
                </Badge>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                  Due in {task.daysRemaining} days (
                  {new Date(task.dueDate).toLocaleDateString('en-IN')})
                </span>
              </div>
            </div>

            {/* AI Prepared Return Data Grid */}
            {task.preparedData && (
              <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    AI Reconciled Tax Figures (Sales & Purchase Registers)
                  </span>
                  <button
                    onClick={() => setSelectedTaskForModal(task)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                  >
                    <span>View Official Form Format</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Reconciled Turnover</span>
                    <strong className="text-slate-900 text-sm font-semibold">
                      ₹{task.preparedData.taxableValue?.toLocaleString('en-IN') || 0}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Eligible ITC (Tax Credit)</span>
                    <strong className="text-emerald-700 text-sm font-semibold">
                      ₹{task.preparedData.itcEligible?.toLocaleString('en-IN') || 0}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">CGST + SGST</span>
                    <strong className="text-slate-900 text-sm font-semibold">
                      ₹
                      {(
                        (task.preparedData.cgstAmount || 0) + (task.preparedData.sgstAmount || 0)
                      ).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Flagged Invoices</span>
                    <strong className="text-amber-700 text-sm font-semibold">
                      {task.preparedData.flaggedInvoicesCount || 0} Invoices Flagged
                    </strong>
                  </div>
                </div>

                {task.preparedData.summaryNotes && (
                  <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/60 leading-relaxed">
                    💡 <strong>Compliance Agent Note:</strong> {task.preparedData.summaryNotes}
                  </p>
                )}
              </div>
            )}

            {/* Missing documents alert */}
            {task.missingDocuments && task.missingDocuments.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Missing Documentation Flagged by AI:</span>
                  <ul className="list-disc list-inside mt-0.5 text-amber-800 space-y-0.5">
                    {task.missingDocuments.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Disclaimer & Authorization Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <p className="text-[11px] text-slate-400 italic max-w-xl">
                ⚠️ {task.filingDisclaimer}
              </p>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedTaskForModal(task)}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-xs transition shadow-2xs"
                >
                  Inspect Form Draft
                </button>
                {task.status !== 'SUBMITTED' ? (
                  <button
                    onClick={() => handleAuthorizeFiling(task.taskId)}
                    disabled={authorizingId === task.taskId}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-xs transition disabled:opacity-40 active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>
                      {authorizingId === task.taskId
                        ? 'Authorizing...'
                        : 'Authorize & Submit (Simulated)'}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorized & Filed by Owner</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Official-Style GSTR-3B Return Inspector Modal */}
      {selectedTaskForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-modal border border-slate-200 flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-primary-600">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Government of India — Form GSTR-3B</h3>
                  <p className="text-xs text-slate-400">
                    Monthly Self-Assessed Return Draft • Period: {selectedTaskForModal.period}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-800">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN</span>
                  <strong className="text-slate-900 font-mono">27AABCS1429B1Z1</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Legal Name
                  </span>
                  <strong className="text-slate-900">Shree General Store</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Tax Period
                  </span>
                  <strong className="text-slate-900">{selectedTaskForModal.period}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Filing Status
                  </span>
                  <Badge
                    variant={selectedTaskForModal.status === 'SUBMITTED' ? 'success' : 'warning'}
                  >
                    {selectedTaskForModal.status}
                  </Badge>
                </div>
              </div>

              {/* Table 3.1: Details of Outward Supplies */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">
                  3.1 Details of Outward Supplies and inward supplies liable to reverse charge
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[520px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5">Nature of Supplies</th>
                        <th className="p-2.5 text-right">Total Taxable Value</th>
                        <th className="p-2.5 text-right">Integrated Tax</th>
                        <th className="p-2.5 text-right">Central Tax</th>
                        <th className="p-2.5 text-right">State/UT Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 text-slate-800 font-medium">
                          (a) Outward taxable supplies (other than zero rated, nil rated and
                          exempted)
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900">
                          ₹
                          {selectedTaskForModal.preparedData?.taxableValue?.toLocaleString('en-IN') ||
                            '2,95,000'}
                        </td>
                        <td className="p-2.5 text-right text-slate-600">
                          ₹
                          {selectedTaskForModal.preparedData?.igstAmount?.toLocaleString('en-IN') ||
                            '2,400'}
                        </td>
                        <td className="p-2.5 text-right text-slate-600">
                          ₹
                          {selectedTaskForModal.preparedData?.cgstAmount?.toLocaleString('en-IN') ||
                            '7,375'}
                        </td>
                        <td className="p-2.5 text-right text-slate-600">
                          ₹
                          {selectedTaskForModal.preparedData?.sgstAmount?.toLocaleString('en-IN') ||
                            '7,375'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 4: Eligible ITC */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs mb-2">
                  4. Eligible ITC (Input Tax Credit Available)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[520px]">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                      <tr>
                        <th className="p-2.5">Details</th>
                        <th className="p-2.5 text-right">Integrated Tax</th>
                        <th className="p-2.5 text-right">Central Tax</th>
                        <th className="p-2.5 text-right">State/UT Tax</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 text-slate-800 font-medium">
                          (A) ITC Available (whether in full or part) - All other ITC
                        </td>
                        <td className="p-2.5 text-right text-slate-600">₹0</td>
                        <td className="p-2.5 text-right text-slate-600">
                          ₹
                          {Math.round(
                            (selectedTaskForModal.preparedData?.itcEligible || 12850) / 2
                          ).toLocaleString('en-IN')}
                        </td>
                        <td className="p-2.5 text-right text-slate-600">
                          ₹
                          {Math.round(
                            (selectedTaskForModal.preparedData?.itcEligible || 12850) / 2
                          ).toLocaleString('en-IN')}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50 font-bold text-emerald-900">
                        <td className="p-2.5">Total ITC Claimed (Invoices Reconciled: 42)</td>
                        <td colSpan={3} className="p-2.5 text-right text-emerald-800 text-sm">
                          ₹
                          {selectedTaskForModal.preparedData?.itcEligible?.toLocaleString('en-IN') ||
                            '12,850'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions Footer in Modal */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => handleDownloadGstnJson(selectedTaskForModal)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Form JSON</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-700 font-semibold flex items-center space-x-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Form</span>
                  </button>
                  {selectedTaskForModal.status !== 'SUBMITTED' ? (
                    <button
                      onClick={() => handleAuthorizeFiling(selectedTaskForModal.taskId)}
                      disabled={authorizingId === selectedTaskForModal.taskId}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-40"
                    >
                      Authorize & Sign
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedTaskForModal(null)}
                      className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl"
                    >
                      Done
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
