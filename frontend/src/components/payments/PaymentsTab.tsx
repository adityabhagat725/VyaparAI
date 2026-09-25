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
} from 'lucide-react';
import { api } from '../../api/client';
import { InvoiceItem } from '../../types';

export const PaymentsTab: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [reconciliation, setReconciliation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reconcilingId, setReconcilingId] = useState<string | null>(null);

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
                    {inv.reconciliationStatus !== 'MATCHED' ? (
                      <button
                        onClick={() => handleResolveDiscrepancy(inv._id)}
                        disabled={reconcilingId === inv._id}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-800"
                      >
                        {reconcilingId === inv._id ? 'Resolving...' : 'Resolve'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 flex items-center justify-end space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Reconciled</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
