import React, { useState, useEffect } from 'react';
import { Users, Phone, Mail, Clock, CreditCard, ShoppingBag, ExternalLink } from 'lucide-react';
import { api } from '../../api/client';
import { SupplierItem } from '../../types';

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
    return <div className="p-8 text-center text-xs text-slate-500">Loading wholesale supplier directory...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Wholesale Suppliers Directory</h2>
        <p className="text-xs text-slate-500">
          Managed supplier profiles, agreed payment terms, delivery lead times, and current balances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {suppliers.map((supp) => (
          <div
            key={supp._id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{supp.name}</h3>
                  <p className="text-xs text-slate-500">Contact: {supp.contactPerson}</p>
                </div>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded uppercase">
                  {supp.avgDeliveryLeadDays} Days Lead
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{supp.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{supp.email}</span>
                </div>
                {supp.upiId && (
                  <div className="flex items-center space-x-2 text-slate-600">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>UPI: <code className="bg-slate-100 px-1 py-0.5 rounded">{supp.upiId}</code></span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Products Supplied:</span>
                <div className="flex flex-wrap gap-1.5">
                  {supp.productsSupplied?.map((p, idx) => (
                    <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded-full border border-emerald-200">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-medium">Outstanding Dues</span>
                <span className="text-sm font-bold text-slate-900">₹{supp.outstandingBalance?.toLocaleString('en-IN')}</span>
              </div>
              <span className="text-[11px] text-slate-500">Terms: Net {supp.avgDeliveryLeadDays * 5} days</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
