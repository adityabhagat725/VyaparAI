import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  IndianRupee,
  Calendar,
  Phone,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  X,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../api/client';
import { PayrollSummary, StaffItem } from '../../types';
import { MetricCard } from '../ui/MetricCard';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

export const StaffTab: React.FC = () => {
  const [payroll, setPayroll] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Advance modal state
  const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
  const [selectedStaffName, setSelectedStaffName] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceNote, setAdvanceNote] = useState('');

  // Add staff modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Helper');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffSalary, setNewStaffSalary] = useState('12000');

  const fetchStaffData = async () => {
    try {
      setLoading(true);
      const data = await api.getStaff();
      setPayroll(data);
    } catch (err) {
      console.error('Error fetching staff data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const handleGiveAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffName || !advanceAmount) return;

    try {
      setSubmitting(true);
      const res = await api.recordStaffAdvance(
        selectedStaffName,
        parseFloat(advanceAmount),
        advanceNote || 'Advance payment'
      );
      alert(`✅ ₹${res.advanceRecorded} advance recorded for ${res.staffName}. Net payable updated.`);
      setAdvanceModalOpen(false);
      setAdvanceAmount('');
      setAdvanceNote('');
      await fetchStaffData();
    } catch (err: any) {
      alert(`Error recording advance: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffSalary) return;

    try {
      setSubmitting(true);
      await api.createStaff({
        name: newStaffName,
        role: newStaffRole,
        phone: newStaffPhone,
        monthlySalary: parseFloat(newStaffSalary),
      });
      alert(`✅ Added ${newStaffName} (${newStaffRole}) to payroll!`);
      setAddModalOpen(false);
      setNewStaffName('');
      setNewStaffPhone('');
      setNewStaffSalary('12000');
      await fetchStaffData();
    } catch (err: any) {
      alert(`Error adding staff: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisburse = async (staff: StaffItem) => {
    if (
      !window.confirm(
        `Disburse ₹${staff.netPayable.toLocaleString(
          'en-IN'
        )} net salary to ${staff.name}? This will record a Salary Expense and reset advances for the new cycle.`
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.disburseStaffSalary(staff.id);
      alert(
        `✅ Disbursed ₹${res.disbursedAmount.toLocaleString(
          'en-IN'
        )} to ${res.staffName}! Deducted ₹${res.deductedAdvance} advance. Logged in business expenses.`
      );
      await fetchStaffData();
    } catch (err: any) {
      alert(`Error disbursing salary: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !payroll) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading staff & payroll records...</p>
        </div>
      </div>
    );
  }

  const staffList = payroll?.staff || [];
  const totalPayroll = payroll?.totalMonthlyPayroll || 0;
  const totalAdvances = payroll?.totalAdvancesGiven || 0;
  const totalNet = payroll?.totalNetPayable || 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Staff & Payroll Roster
            </h2>
            <Badge variant="primary" dot>
              Staff Agent Active
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated pro-rated salary calculations, conversational advance tracking, and net payroll disbursement.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              if (staffList.length > 0) setSelectedStaffName(staffList[0].name);
              setAdvanceModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-2xs transition active:scale-95"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Record Advance</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs shadow-2xs transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Store Staff"
          value={payroll?.totalStaffCount || 0}
          subtitle="Full-time shop personnel"
          icon={UserCheck}
          iconColor="text-emerald-600 bg-emerald-50"
        />

        <MetricCard
          title="Monthly Base Payroll"
          value={`₹${totalPayroll.toLocaleString('en-IN')}`}
          subtitle="Total contract salaries"
          icon={IndianRupee}
          iconColor="text-indigo-600 bg-indigo-50"
        />

        <MetricCard
          title="Advances Given (Month)"
          value={`₹${totalAdvances.toLocaleString('en-IN')}`}
          change="Auto-Deducted"
          changeType="neutral"
          subtitle="Deducted at settlement"
          icon={Wallet}
          iconColor="text-amber-600 bg-amber-50"
        />

        <MetricCard
          title="Net Pending Payout"
          value={`₹${totalNet.toLocaleString('en-IN')}`}
          subtitle="Estimated month-end liability"
          icon={CheckCircle2}
          iconColor="text-emerald-600 bg-emerald-50"
        />
      </div>

      {/* Conversational Assistant Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-4 text-white flex items-start space-x-3.5 shadow-card">
        <span className="text-xl">💬</span>
        <div className="text-xs space-y-1">
          <div className="font-semibold text-indigo-300">
            Hands-Free WhatsApp Staff Agent Active
          </div>
          <p className="text-slate-300 leading-relaxed">
            You don't need to manually click forms. Just voice note or text on WhatsApp:{' '}
            <code className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono text-[11px]">
              &quot;Raju helper ko 1000 advance diya&quot;
            </code>{' '}
            or{' '}
            <code className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono text-[11px]">
              &quot;Staff salary kitni baki hai?&quot;
            </code>
            . The Staff Agent automatically recalculates net balance and logs immutable audit records.
          </p>
        </div>
      </div>

      {/* Staff Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {staffList.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base tracking-tight">{s.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="neutral">{s.role}</Badge>
                    {s.phone && (
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{s.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Attendance</div>
                  <div className="text-xs font-semibold text-slate-800">
                    {s.presentDays} / {s.totalWorkingDays} Days
                  </div>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="mt-4 bg-slate-50/70 border border-slate-200/70 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Monthly Base Salary</span>
                  <span className="font-semibold text-slate-900">
                    ₹{s.monthlySalary.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Earned to Date ({s.presentDays} days)</span>
                  <span className="font-medium text-slate-800">
                    ₹{s.earnedSalary.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-amber-700">
                  <span className="flex items-center space-x-1.5">
                    <span>Advance Taken</span>
                    {s.advanceSalaryTaken > 0 && <Badge variant="warning">Deduction</Badge>}
                  </span>
                  <span className="font-semibold text-amber-700">
                    - ₹{s.advanceSalaryTaken.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-xs">Net Payable Payout</span>
                  <span className="font-bold text-emerald-700 text-base">
                    ₹{s.netPayable.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSelectedStaffName(s.name);
                  setAdvanceModalOpen(true);
                }}
                className="flex-1 py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold rounded-xl text-xs transition shadow-2xs"
              >
                + Give Advance
              </button>
              <button
                disabled={submitting}
                onClick={() => handleDisburse(s)}
                className="flex-1 py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs transition disabled:opacity-50 shadow-2xs active:scale-95"
              >
                ✓ Disburse Salary
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Give Advance Modal */}
      {advanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-modal border border-slate-200 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                <span>Record Salary Advance</span>
              </h3>
              <button
                onClick={() => setAdvanceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGiveAdvance} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Staff Member</label>
                <select
                  value={selectedStaffName}
                  onChange={(e) => setSelectedStaffName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.role}) - Base ₹{s.monthlySalary.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Advance Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={advanceNote}
                  onChange={(e) => setAdvanceNote(e.target.value)}
                  placeholder="e.g. Emergency family expense, medical"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAdvanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {submitting ? 'Recording...' : 'Confirm Advance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-modal border border-slate-200 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-primary-600" />
                <span>Add Staff Member</span>
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role / Position</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs"
                >
                  <option value="Helper">Helper / Assistant</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Delivery Boy">Delivery Boy</option>
                  <option value="Store Manager">Store Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Monthly Base Salary (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={newStaffSalary}
                  onChange={(e) => setNewStaffSalary(e.target.value)}
                  placeholder="e.g. 12000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-xs transition disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add to Payroll'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
