import React, { useState, useEffect } from 'react';
import { Scale, Clock, AlertTriangle, CheckCircle2, FileText, ArrowRight, ShieldCheck, X, Download, Printer } from 'lucide-react';
import { api } from '../../api/client';
import { ComplianceTaskItem } from '../../types';

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
      gstin: "27AABCS1429B1Z1",
      fp: task.period || "082026",
      form_type: task.formType || "GSTR-3B",
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
        prepared_by: "VyaparAI Autonomous Multi-Agent Back Office",
        compliance_engine: "GSTN-Draft-Engine v1.0",
        timestamp: new Date().toISOString(),
        disclaimer: task.filingDisclaimer,
      }
    };

    const blob = new Blob([JSON.stringify(gstnPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GSTN_${task.formType || 'GSTR3B'}_${(task.period || 'current').replace(/\s+/g, '_')}_Draft.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading statutory compliance calendar...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900">GST & Regulatory Compliance</h2>
        <p className="text-xs text-slate-500">
          Autonomous calendar tracking, invoice ITC reconciliation, missing document audits, and draft return builders.
        </p>
      </div>

      {/* Compliance Cards */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.taskId}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h3 className="font-bold text-slate-900 text-lg">{task.title}</h3>
                  <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full">
                    Period: {task.period}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Form Category: {task.category} ({task.formType})</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  task.status === 'SUBMITTED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  Due in {task.daysRemaining} days ({new Date(task.dueDate).toLocaleDateString('en-IN')})
                </span>
              </div>
            </div>

            {/* AI Prepared Return Data Grid */}
            {task.preparedData && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    AI Reconciled Tax Figures (From Sales & Purchase Registers)
                  </span>
                  <button
                    onClick={() => setSelectedTaskForModal(task)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                  >
                    <span>View Official Form Format</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Reconciled Turnover</span>
                    <strong className="text-slate-900 text-sm">
                      ₹{task.preparedData.taxableValue?.toLocaleString('en-IN') || 0}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Eligible ITC (Tax Credit)</span>
                    <strong className="text-emerald-700 text-sm">
                      ₹{task.preparedData.itcEligible?.toLocaleString('en-IN') || 0}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CGST + SGST</span>
                    <strong className="text-slate-900 text-sm">
                      ₹{((task.preparedData.cgstAmount || 0) + (task.preparedData.sgstAmount || 0)).toLocaleString('en-IN')}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Flagged Invoices</span>
                    <strong className="text-amber-700 text-sm">
                      {task.preparedData.flaggedInvoicesCount || 0} Invoices Flagged
                    </strong>
                  </div>
                </div>

                {task.preparedData.summaryNotes && (
                  <p className="text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-200/60 leading-relaxed">
                    💡 <strong>Agent Audit Note:</strong> {task.preparedData.summaryNotes}
                  </p>
                )}
              </div>
            )}

            {/* Missing documents alert */}
            {task.missingDocuments && task.missingDocuments.length > 0 && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2">
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
                  className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-xs transition"
                >
                  Inspect Form Draft
                </button>
                {task.status !== 'SUBMITTED' ? (
                  <button
                    onClick={() => handleAuthorizeFiling(task.taskId)}
                    disabled={authorizingId === task.taskId}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-40"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{authorizingId === task.taskId ? 'Authorizing...' : 'Authorize & Submit (Simulated)'}</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-emerald-600">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Government of India — Form GSTR-3B</h3>
                  <p className="text-xs text-slate-400">Monthly Self-Assessed Return Draft • Period: {selectedTaskForModal.period}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs text-slate-800">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">GSTIN</span>
                  <span className="font-mono font-bold text-slate-900">27AABCS1429B1Z1</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Legal Name</span>
                  <span className="font-bold text-slate-900">Shree General Store</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Return Period</span>
                  <span className="font-bold text-slate-900">{selectedTaskForModal.period}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
                  <span className="font-bold text-red-600">{new Date(selectedTaskForModal.dueDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Table 3.1: Details of Outward Supplies */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 text-xs border-b border-slate-200">
                  3.1 Details of Outward Supplies and inward supplies liable to reverse charge
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Nature of Supplies</th>
                      <th className="p-3 text-right">Total Taxable Value</th>
                      <th className="p-3 text-right">IGST</th>
                      <th className="p-3 text-right">CGST</th>
                      <th className="p-3 text-right">SGST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-medium">Outward taxable supplies (other than zero rated, nil, exempted)</td>
                      <td className="p-3 text-right font-bold">₹{selectedTaskForModal.preparedData?.taxableValue?.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right">₹{selectedTaskForModal.preparedData?.igstAmount?.toLocaleString('en-IN') || 0}</td>
                      <td className="p-3 text-right">₹{selectedTaskForModal.preparedData?.cgstAmount?.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-right">₹{selectedTaskForModal.preparedData?.sgstAmount?.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table 4: Eligible ITC */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-800 text-xs border-b border-slate-200">
                  4. Eligible ITC (Input Tax Credit Available)
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase">
                    <tr>
                      <th className="p-3">Details</th>
                      <th className="p-3 text-right">Integrated Tax</th>
                      <th className="p-3 text-right">Central Tax</th>
                      <th className="p-3 text-right">State/UT Tax</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-medium">All other ITC (Inward supplies from registered suppliers)</td>
                      <td className="p-3 text-right">₹2,400</td>
                      <td className="p-3 text-right">₹5,225</td>
                      <td className="p-3 text-right">₹5,225</td>
                    </tr>
                    <tr className="bg-emerald-50/60 font-bold text-emerald-900">
                      <td className="p-3">Net ITC Available (4A - 4B)</td>
                      <td className="p-3 text-right" colSpan={3}>₹{selectedTaskForModal.preparedData?.itcEligible?.toLocaleString('en-IN')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Table 6.1: Payment of Tax */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-950 text-sm block">Net Tax Payable (After ITC Offset)</span>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Calculated from 42 matched purchase registers and monthly POS turnover.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-700 uppercase font-bold block">Tax Payable in Cash</span>
                  <span className="text-lg font-black text-emerald-900">
                    ₹{Math.max(0, (((selectedTaskForModal.preparedData?.cgstAmount || 0) + (selectedTaskForModal.preparedData?.sgstAmount || 0)) - (selectedTaskForModal.preparedData?.itcEligible || 0))).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-400 italic text-[11px]">
                {selectedTaskForModal.filingDisclaimer}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadGstnJson(selectedTaskForModal)}
                  className="px-3 py-1.5 border border-slate-300 rounded-xl hover:bg-slate-200 text-slate-700 font-medium flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Draft JSON</span>
                </button>
                <button
                  onClick={() => handleAuthorizeFiling(selectedTaskForModal.taskId)}
                  disabled={authorizingId === selectedTaskForModal.taskId || selectedTaskForModal.status === 'SUBMITTED'}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-40"
                >
                  {selectedTaskForModal.status === 'SUBMITTED' ? 'Already Filed' : 'Authorize Return Submission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
