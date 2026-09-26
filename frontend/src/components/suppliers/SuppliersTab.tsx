import React, { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  Mail,
  Clock,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  Building2,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../api/client';
import { SupplierItem } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const SuppliersTab: React.FC = () => {
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await api.getSuppliers();
        setSuppliers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuppliers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">
            Loading wholesale supplier directory...
          </p>
        </div>
      </div>
    );
  }

  const totalDues = suppliers.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0);
  const avgLead = suppliers.length > 0
    ? (suppliers.reduce((acc, s) => acc + (s.avgDeliveryLeadDays || 0), 0) / suppliers.length).toFixed(1)
    : '2.0';

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Wholesale Suppliers Directory
            </h2>
            <Badge variant="primary" dot>
              Supplier Ledger Synced
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Managed vendor profiles, credit limits, delivery lead times, and active payables.
          </p>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Wholesale Vendors"
          value={suppliers.length}
          subtitle="Direct distributors & wholesalers"
          icon={Users}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <MetricCard
          title="Total Vendor Payables"
          value={`₹${totalDues.toLocaleString('en-IN')}`}
          subtitle="Current outstanding book balance"
          icon={CreditCard}
          iconColor="text-amber-600 bg-amber-50"
        />
        <MetricCard
          title="Avg Delivery Lead Time"
          value={`${avgLead} Days`}
          change="Express Transit"
          changeType="positive"
          subtitle="Warehouse to retail store"
          icon={Clock}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="UPI Direct Settlement"
          value="Enabled"
          subtitle="1-click vendor disbursement"
          icon={CheckCircle2}
          iconColor="text-blue-600 bg-blue-50"
        />
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {suppliers.map((supp) => (
          <div
            key={supp._id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base tracking-tight">{supp.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Contact: {supp.contactPerson}</p>
                </div>
                <Badge variant="neutral">
                  {supp.avgDeliveryLeadDays} Days Lead
                </Badge>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{supp.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{supp.email}</span>
                </div>
                {supp.upiId && (
                  <div className="flex items-center space-x-2 text-slate-600">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      UPI:{' '}
                      <code className="bg-slate-100 text-slate-800 font-mono px-1.5 py-0.5 rounded text-[11px]">
                        {supp.upiId}
                      </code>
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Products Supplied:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {supp.productsSupplied?.map((p, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-slate-100/80 text-slate-700 font-medium px-2 py-0.5 rounded-md border border-slate-200/60"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                  Outstanding Dues
                </span>
                <span className="text-base font-bold text-slate-900">
                  ₹{supp.outstandingBalance?.toLocaleString('en-IN')}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Terms: Net {supp.avgDeliveryLeadDays * 5} days
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
