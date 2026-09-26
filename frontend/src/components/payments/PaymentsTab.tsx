import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Zap,
  QrCode,
  Copy,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../api/client';
import { InvoiceItem } from '../../types';

export const PaymentsTab: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

  // Payment Link & Modal State
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<InvoiceItem | null>(null);
  const [paymentLinkData, setPaymentLinkData] = useState<any>(null);
  const [loadingLink, setLoadingLink] = useState(false);
  const [disbursing, setDisbursing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const [invData, recData] = await Promise.all([
        api.getInvoices(),
        api.getReconciliation(),
      ]);
      setInvoices(invData);
      setReconciliation(recData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleResolveDiscrepancy = async (invoiceId: string) => {
    setReconcilingId(invoiceId);
    try {
      await api.reconcileInvoice(invoiceId, 'Discrepancy reviewed and reconciled against vendor payment statement by store owner.');
      await fetchPayments();
    } catch (err: any) {
      alert(`Error reconciling: ${err.message}`);
    } finally {
      setReconcilingId(null);
    }
  };

  const handleOpenPaymentModal = async (inv: InvoiceItem) => {
    setActivePaymentInvoice(inv);
    setLoadingLink(true);
    setCopied(false);
    try {
      const data = await api.createPaymentLink(inv._id);
      setPaymentLinkData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLink(false);
    }
  };

  const handleDisburseInvoice = async (invoiceId: string) => {
    setDisbursing(true);
    try {
      await api.disbursePayment({ invoiceId, paymentMode: 'UPI' });
      alert('✅ Payment successfully disbursed via UPI gateway! Invoice updated to PAID.');
      setActivePaymentInvoice(null);
      setPaymentLinkData(null);
      await fetchPayments();
    } catch (err: any) {
      alert(`Disbursement failed: ${err.message}`);
    } finally {
      setDisbursing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading payment ledger and reconciliation reports...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Vendor Payment Reconciliation</h2>
        <p className="text-xs text-slate-500">
          Automated invoice matching, partial payment anomaly detection, and pending supplier payables.
        </p>
      </div>

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Total Pending Payables</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            ₹{reconciliation?.totalPendingAmount?.toLocaleString('en-IN') || 0}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Across all wholesale invoices</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Matched Transactions</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {reconciliation?.matchedCount || 0} Invoices
          </div>
          <span className="text-[11px] text-slate-400">100% reconciled</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Partial Mismatches</span>
          <div className="text-xl font-bold text-red-600 mt-1">
            {reconciliation?.partialCount || 0} Flagged
          </div>
          <span className="text-[11px] text-red-600 font-medium">Needs investigation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-medium">Unmatched / Open</span>
          <div className="text-xl font-bold text-slate-700 mt-1">
            {reconciliation?.unmatchedCount || 0} Open
          </div>
          <span className="text-[11px] text-slate-400">Awaiting payment voucher</span>
        </div>
      </div>

      {/* Discrepancy Alert Banner */}
      {reconciliation?.discrepancies?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">
                Payment Mismatch Flagged: {reconciliation.discrepancies[0].supplierName} (Invoice #{reconciliation.discrepancies[0].invoiceNumber})
              </h4>
              <p className="text-amber-800 mt-0.5">
                {reconciliation.discrepancies[0].note} Invoice: ₹{reconciliation.discrepancies[0].invoiceAmount.toLocaleString('en-IN')}, Paid: ₹{reconciliation.discrepancies[0].paidAmount.toLocaleString('en-IN')}.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleResolveDiscrepancy(invoices.find(i => i.reconciliationStatus === 'PARTIAL_MATCH')?._id || '')}
            disabled={reconcilingId !== null}
            className="shrink-0 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition"
          >
            {reconcilingId ? 'Reconciling...' : 'Mark Reconciled'}
          </button>
        </div>
      )}

      {/* Invoices Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Supplier Invoices & Reconciliation Status</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Supplier</th>
                <th className="px-4 py-3.5">Invoice Amount</th>
                <th className="px-4 py-3.5">Paid Amount</th>
                <th className="px-4 py-3.5">Pending Due</th>
                <th className="px-4 py-3.5">Due Date</th>
                <th className="px-4 py-3.5">Reconciliation Status</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-3.5 font-bold text-slate-900 font-mono">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-800">
                    {inv.supplierId?.name || 'Vendor'}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    ₹{inv.paidAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-red-600">
                    ₹{inv.pendingAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">
                    {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      inv.reconciliationStatus === 'MATCHED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : inv.reconciliationStatus === 'PARTIAL_MATCH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {inv.reconciliationStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {inv.pendingAmount > 0 && (
                        <button
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 shadow-sm transition"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Pay via UPI</span>
                        </button>
                      )}
                      {inv.reconciliationStatus === 'PARTIAL_MATCH' && (
                        <button
                          onClick={() => handleResolveDiscrepancy(inv._id)}
                          disabled={reconcilingId === inv._id}
                          className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 border border-amber-300 bg-amber-50 px-2 py-0.5 rounded"
                        >
                          {reconcilingId === inv._id ? 'Resolving...' : 'Resolve'}
                        </button>
                      )}
                      {inv.reconciliationStatus === 'MATCHED' && (
                        <span className="text-[11px] text-slate-400 flex items-center justify-end space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Reconciled</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPI / Razorpay Payment Modal */}
      {activePaymentInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Disburse Supplier Due</h3>
                  <p className="text-[11px] text-slate-500">Invoice #{activePaymentInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivePaymentInvoice(null);
                  setPaymentLinkData(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingLink ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Generating secure UPI intent and payment link...
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-xs">
                {/* Due Breakdown */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Beneficiary Supplier</span>
                    <span className="font-semibold text-slate-900">{paymentLinkData?.supplierName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Invoice Value</span>
                    <span className="font-medium text-slate-800">₹{activePaymentInvoice.amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Already Settled</span>
                    <span className="font-medium text-emerald-600">₹{activePaymentInvoice.paidAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Pending Amount to Pay</span>
                    <span className="text-lg font-bold text-red-600">₹{activePaymentInvoice.pendingAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Simulated UPI QR / Intent */}
                <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3 text-center space-y-2">
                  <div className="flex items-center justify-center space-x-1.5 text-emerald-800 font-semibold text-[11px]">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Instant UPI Payment Link</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 truncate">
                    {paymentLinkData?.paymentLink}
                  </div>
                  <button
                    onClick={() => handleCopy(paymentLinkData?.paymentLink || '')}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md font-medium text-[11px] transition shadow-xs"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Payment Link'}</span>
                  </button>
                </div>

                {/* Disburse Button */}
                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePaymentInvoice(null);
                      setPaymentLinkData(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={disbursing}
                    onClick={() => handleDisburseInvoice(activePaymentInvoice._id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 flex items-center space-x-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>{disbursing ? 'Disbursing...' : `Disburse ₹${activePaymentInvoice.pendingAmount.toLocaleString('en-IN')}`}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
