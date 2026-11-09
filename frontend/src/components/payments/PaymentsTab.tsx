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
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../api/client';
import { InvoiceItem } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

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
      await api.reconcileInvoice(
        invoiceId,
        'Discrepancy reviewed and reconciled against vendor payment statement by store owner.'
      );
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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Loading vendor ledger & reconciliation reports...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Vendor Ledger & Payment Reconciliation
            </h2>
            <Badge variant="primary" dot>
              AI Ledger Audit
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated invoice verification, partial payment anomaly detection, and instant UPI settlement.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200/90 hover:bg-slate-100 text-slate-700 text-xs font-semibold self-start sm:self-auto transition shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Reconciliation Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Outstanding Dues"
          value={`₹${reconciliation?.totalPendingAmount?.toLocaleString('en-IN') || 0}`}
          subtitle="Pending across all vendors"
          icon={CreditCard}
          iconColor="text-amber-600 bg-amber-50"
        />

        <MetricCard
          title="Matched Transactions"
          value={`${reconciliation?.matchedCount || 0} Invoices`}
          change="100% Verified"
          changeType="positive"
          subtitle="Bank statements reconciled"
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50"
        />

        <MetricCard
          title="Partial Mismatches"
          value={`${reconciliation?.partialCount || 0} Flagged`}
          change={reconciliation?.partialCount > 0 ? 'Requires Owner Review' : '0 Anomalies'}
          changeType={reconciliation?.partialCount > 0 ? 'negative' : 'positive'}
          subtitle="Audit discrepancy detected"
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50"
        />

        <MetricCard
          title="Open Invoices"
          value={`${reconciliation?.unmatchedCount || 0} Open`}
          subtitle="Awaiting disbursement"
          icon={FileText}
          iconColor="text-indigo-600 bg-indigo-50"
        />
      </div>

      {/* Discrepancy Alert Banner */}
      {reconciliation?.discrepancies?.length > 0 && (
        <div className="bg-amber-50/70 border-l-4 border-l-amber-500 border-y border-r border-amber-200/80 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-card">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-amber-100/80 text-amber-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-amber-900 text-xs">
                  Payment Discrepancy: {reconciliation.discrepancies[0].supplierName} (Invoice #{reconciliation.discrepancies[0].invoiceNumber})
                </h4>
                <Badge variant="warning">Audit Mismatch</Badge>
              </div>
              <p className="text-amber-800 mt-1 leading-relaxed text-[11px]">
                {reconciliation.discrepancies[0].note} Invoice value: ₹
                {reconciliation.discrepancies[0].invoiceAmount.toLocaleString('en-IN')}, Paid: ₹
                {reconciliation.discrepancies[0].paidAmount.toLocaleString('en-IN')}.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              handleResolveDiscrepancy(
                invoices.find((i) => i.reconciliationStatus === 'PARTIAL_MATCH')?._id || ''
              )
            }
            disabled={reconcilingId !== null}
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-xs transition shadow-2xs active:scale-95 disabled:opacity-40"
          >
            {reconcilingId ? 'Reconciling...' : 'Mark Reconciled'}
          </button>
        </div>
      )}

      {/* Invoices Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">
            Wholesale Invoices & Reconciliation Status
          </h3>
          <span className="text-xs text-slate-400">{invoices.length} invoices registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Supplier</th>
                <th className="px-4 py-3.5">Invoice Value</th>
                <th className="px-4 py-3.5">Paid Amount</th>
                <th className="px-4 py-3.5">Pending Due</th>
                <th className="px-4 py-3.5">Due Date</th>
                <th className="px-4 py-3.5">Audit Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8">
                    <EmptyState
                      icon={CreditCard}
                      title="No invoices found"
                      description="No vendor invoices are logged in the active enterprise database."
                    />
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition group">
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
                    <td className="px-4 py-3.5 font-bold text-rose-600">
                      ₹{inv.pendingAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {new Date(inv.dueDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          inv.reconciliationStatus === 'MATCHED'
                            ? 'success'
                            : inv.reconciliationStatus === 'PARTIAL_MATCH'
                            ? 'warning'
                            : 'neutral'
                        }
                        dot
                      >
                        {inv.reconciliationStatus.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {inv.pendingAmount > 0 && (
                          <button
                            onClick={() => handleOpenPaymentModal(inv)}
                            className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-[11px] font-semibold flex items-center space-x-1 shadow-2xs transition active:scale-95"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Pay via UPI</span>
                          </button>
                        )}
                        {inv.reconciliationStatus === 'PARTIAL_MATCH' && (
                          <button
                            onClick={() => handleResolveDiscrepancy(inv._id)}
                            disabled={reconcilingId === inv._id}
                            className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition"
                          >
                            {reconcilingId === inv._id ? 'Resolving...' : 'Resolve'}
                          </button>
                        )}
                        {inv.reconciliationStatus === 'MATCHED' && inv.pendingAmount === 0 && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Reconciled</span>
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UPI Instant Settlement Modal */}
      {activePaymentInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-modal border border-slate-200 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Disburse Supplier Due</h3>
                  <p className="text-[11px] text-slate-500">
                    Invoice #{activePaymentInvoice.invoiceNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActivePaymentInvoice(null);
                  setPaymentLinkData(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingLink ? (
              <div className="py-10 text-center text-xs text-slate-500">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Generating secure UPI intent and payment link...
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-xs">
                {/* Due Breakdown */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Beneficiary Supplier</span>
                    <span className="font-semibold text-slate-900">
                      {paymentLinkData?.supplierName}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Invoice Value</span>
                    <span className="font-medium text-slate-800">
                      ₹{activePaymentInvoice.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Already Settled</span>
                    <span className="font-medium text-emerald-600">
                      ₹{activePaymentInvoice.paidAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Pending Amount to Pay</span>
                    <span className="text-base font-bold text-rose-600">
                      ₹{activePaymentInvoice.pendingAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Simulated UPI QR / Intent */}
                <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-3.5 text-center space-y-2.5">
                  <div className="flex items-center justify-center space-x-1.5 text-primary-800 font-semibold text-[11px]">
                    <QrCode className="w-4 h-4 text-primary-600" />
                    <span>Instant UPI Payment Link</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 truncate">
                    {paymentLinkData?.paymentLink}
                  </div>
                  <button
                    onClick={() => handleCopy(paymentLinkData?.paymentLink || '')}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-medium text-[11px] transition shadow-2xs"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy Payment Link'}</span>
                  </button>
                </div>

                {/* Disburse Button */}
                <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePaymentInvoice(null);
                      setPaymentLinkData(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={disbursing}
                    onClick={() => handleDisburseInvoice(activePaymentInvoice._id)}
                    className="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50 flex items-center justify-center space-x-1.5 text-xs active:scale-95"
                  >
                    <Zap className="w-4 h-4" />
                    <span>
                      {disbursing
                        ? 'Disbursing...'
                        : `Disburse ₹${activePaymentInvoice.pendingAmount.toLocaleString('en-IN')}`}
                    </span>
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
