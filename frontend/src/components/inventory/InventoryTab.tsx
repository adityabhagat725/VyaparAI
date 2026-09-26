import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ShoppingCart,
  FileText,
  Printer,
  X,
  TrendingDown,
  Building2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../api/client';
import { InventoryItem } from '../../types';
import { Badge } from '../ui/Badge';
import { MetricCard } from '../ui/MetricCard';
import { EmptyState } from '../ui/EmptyState';

interface InventoryTabProps {
  onRefreshApprovals?: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ onRefreshApprovals }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'LOW' | 'HEALTHY'>('ALL');
  const [search, setSearch] = useState('');
  const [orderingProductId, setOrderingProductId] = useState<string | null>(null);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);
  const [selectedPoForModal, setSelectedPoForModal] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invData, poData] = await Promise.all([
        api.getInventory(filter === 'ALL' ? undefined : filter),
        api.getPurchaseOrders(),
      ]);
      setItems(invData);
      setPurchaseOrders(poData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleQuickReorder = async (item: InventoryItem) => {
    setOrderingProductId(item.productId);
    setOrderSuccessMsg(null);
    try {
      const reorderQty = item.safetyStockThreshold * 2 || 50;
      await api.reorderProduct({
        productId: item.productId,
        quantity: reorderQty,
        unitPrice: item.basePurchasePrice,
        reason: `Manual reorder triggered from Inventory Dashboard: ${item.name} has ~${item.estimatedDaysLeft} days remaining.`,
      });
      setOrderSuccessMsg(`Draft purchase order prepared for ${item.name}. Sent to Approval Center!`);
      if (onRefreshApprovals) onRefreshApprovals();
      await fetchData();
    } catch (err: any) {
      alert(`Error ordering stock: ${err.message}`);
    } finally {
      setOrderingProductId(null);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
  );

  const criticalCount = items.filter((i) => i.stockStatus === 'CRITICAL').length;
  const lowCount = items.filter((i) => i.stockStatus === 'LOW').length;
  const totalStockValue = items.reduce((acc, curr) => acc + curr.currentStock * curr.basePurchasePrice, 0);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Inventory & Autonomous Procurement
            </h2>
            <Badge variant="primary" dot>
              AI Stock Surveillance
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive consumption velocity, safety stock run-rate analysis, and preferred supplier routing.
          </p>
        </div>

        {/* Status Filter Pill Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 text-xs shrink-0 shadow-2xs">
          {(['ALL', 'CRITICAL', 'LOW', 'HEALTHY'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition text-xs ${
                filter === s
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored SKUs"
          value={items.length}
          subtitle="All items tracked by AI"
          icon={Package}
          iconColor="text-indigo-600 bg-indigo-50"
        />
        <MetricCard
          title="Inventory Valuation"
          value={`₹${totalStockValue.toLocaleString('en-IN')}`}
          subtitle="Cost basis on-hand stock"
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50"
        />
        <MetricCard
          title="Critical Depletion Risk"
          value={criticalCount}
          change={criticalCount > 0 ? 'Stockout imminent' : 'All clear'}
          changeType={criticalCount > 0 ? 'negative' : 'positive'}
          subtitle="Runs out in < 48 hours"
          icon={AlertTriangle}
          iconColor="text-rose-600 bg-rose-50"
        />
        <MetricCard
          title="Reorder Threshold Alert"
          value={lowCount}
          change={lowCount > 0 ? 'Buffer breached' : 'Optimal'}
          changeType={lowCount > 0 ? 'negative' : 'positive'}
          subtitle="Below safety margin"
          icon={TrendingDown}
          iconColor="text-amber-600 bg-amber-50"
        />
      </div>

      {orderSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{orderSuccessMsg}</span>
          </div>
          <button
            onClick={() => setOrderSuccessMsg(null)}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by product name or category..."
          className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/90 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 shadow-2xs transition"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Product & Category</th>
                <th className="px-4 py-3.5">Current Stock</th>
                <th className="px-4 py-3.5">Daily Velocity</th>
                <th className="px-4 py-3.5">Runway</th>
                <th className="px-4 py-3.5">Stock Status</th>
                <th className="px-4 py-3.5">Preferred Supplier</th>
                <th className="px-5 py-3.5 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Calculating real-time inventory velocity...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8">
                    <EmptyState
                      icon={Package}
                      title="No products found"
                      description="No items match your active search and status filter."
                    />
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/80 transition group">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {item.category} • ₹{item.basePurchasePrice}/{item.unit}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-900">
                        {item.currentStock} {item.unit}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        Safety: {item.safetyStockThreshold} {item.unit}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="font-medium text-slate-800">
                        ~{item.avgDailySales} {item.unit}/day
                      </div>
                      <div className="text-[10px] text-slate-400">Daily burn</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span
                          className={`font-bold ${
                            item.estimatedDaysLeft <= 2
                              ? 'text-rose-600'
                              : item.estimatedDaysLeft <= 4
                              ? 'text-amber-600'
                              : 'text-emerald-700'
                          }`}
                        >
                          ~{item.estimatedDaysLeft} days left
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge
                        variant={
                          item.stockStatus === 'CRITICAL'
                            ? 'danger'
                            : item.stockStatus === 'LOW'
                            ? 'warning'
                            : 'success'
                        }
                        dot
                      >
                        {item.stockStatus}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      <div className="font-medium text-slate-800">
                        {item.preferredSupplier?.name || 'Unassigned'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Lead time: {item.preferredSupplier?.leadDays || 2} days
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleQuickReorder(item)}
                        disabled={orderingProductId === item.productId}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold text-[11px] shadow-2xs transition disabled:opacity-40 active:scale-95"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>
                          {orderingProductId === item.productId ? 'Drafting...' : 'Order Stock'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Purchase Orders Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Autonomous Purchase Orders Executed & Drafted
            </h3>
            <p className="text-xs text-slate-500">
              Procurement documents generated by Inventory Agent and authorized by owner.
            </p>
          </div>
          <span className="text-xs text-slate-400">{purchaseOrders.length} total orders</span>
        </div>

        {purchaseOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No purchase orders created"
            description="Trigger 'Order Stock' above or prompt WhatsApp to auto-generate supplier purchase orders."
          />
        ) : (
          <div className="space-y-3">
            {purchaseOrders.slice(0, 5).map((po: any) => (
              <div
                key={po._id}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">PO #{po.orderNumber}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-700 font-medium">
                      {po.supplierId?.name || 'Wholesale Vendor'}
                    </span>
                    <Badge
                      variant={
                        po.status === 'EXECUTED_SIMULATED' || po.status === 'APPROVED'
                          ? 'success'
                          : po.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {po.status}
                    </Badge>
                  </div>
                  <p className="text-slate-600 mt-1">
                    {po.items
                      ?.map((it: any) => `${it.quantity} ${it.unit} of ${it.productName}`)
                      .join(', ')}
                  </p>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-slate-900 text-sm">
                      ₹{po.totalAmount?.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(po.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPoForModal(po)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-700 font-semibold text-[11px] transition shadow-2xs"
                  >
                    View Voucher
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Official Purchase Order Voucher Modal */}
      {selectedPoForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-modal border border-slate-200 flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-primary-600">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Purchase Order Voucher</h3>
                  <p className="text-xs text-slate-400">
                    PO #{selectedPoForModal.orderNumber} • Generated by VyaparAI Inventory Agent
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoForModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-slate-800">
              {/* Buyer & Supplier Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/90">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Purchaser (Buyer)
                  </span>
                  <div className="font-bold text-slate-900 text-sm">Shree General Store</div>
                  <div className="text-slate-600 mt-0.5">
                    Shop No. 12, Shivaji Market, Sadashiv Peth, Pune
                  </div>
                  <div className="font-mono text-primary-700 font-semibold mt-1">
                    GSTIN: 27AABCS1429B1Z1
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Vendor (Supplier)
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedPoForModal.supplierId?.name || 'Wholesale Supplier'}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Contact: {selectedPoForModal.supplierId?.contactPerson || 'Vendor Rep'} (
                    {selectedPoForModal.supplierId?.phone || '+91 98220 11223'})
                  </div>
                  <div className="font-mono text-slate-700 mt-1">
                    GSTIN: {selectedPoForModal.supplierId?.gstin || '27AAACA9921D1ZZ'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-3">Item Description</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Unit Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPoForModal.items?.map((it: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3 font-semibold text-slate-900">{it.productName}</td>
                        <td className="p-3 text-right">
                          {it.quantity} {it.unit}
                        </td>
                        <td className="p-3 text-right">₹{it.unitPrice}</td>
                        <td className="p-3 text-right font-bold">
                          ₹{it.totalPrice?.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td colSpan={3} className="p-3 text-right">
                        Total Order Value:
                      </td>
                      <td className="p-3 text-right text-primary-700 text-sm">
                        ₹{selectedPoForModal.totalAmount?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Execution / Notes */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="flex items-center space-x-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Execution Status: {selectedPoForModal.status}</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {selectedPoForModal.executionResponse || selectedPoForModal.triggerReason}
                </p>
                {selectedPoForModal.deliveryExpectedDate && (
                  <p className="text-[11px] text-emerald-700">
                    Estimated Delivery:{' '}
                    {new Date(selectedPoForModal.deliveryExpectedDate).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Authorized via VyaparAI Agentic Back Office
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-xl hover:bg-slate-200 text-slate-700 font-semibold flex items-center space-x-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Voucher</span>
                </button>
                <button
                  onClick={() => setSelectedPoForModal(null)}
                  className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
