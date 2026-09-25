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
} from 'lucide-react';
import { api } from '../../api/client';
import { PayrollSummary, StaffItem } from '../../types';

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
      <div className="p-8 text-center text-xs text-slate-500">
        Loading staff & payroll records...
      </div>
    );
  }

  const staffList = payroll?.staff || [];
  const totalPayroll = payroll?.totalMonthlyPayroll || 0;
  const totalAdvances = payroll?.totalAdvancesGiven || 0;
  const totalNet = payroll?.totalNetPayable || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Header and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <span>Staff & Payroll Management</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
              Agent 7 Active
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Automated salary calculations, conversational advance tracking, and net payroll disbursement.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              if (staffList.length > 0) setSelectedStaffName(staffList[0].name);
              setAdvanceModalOpen(true);
            }}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-xl text-xs shadow-sm transition"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Record Advance</span>
          </button>
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Active Staff</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{payroll?.totalStaffCount || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Full-time shop staff</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Monthly Base Payroll</span>
            <IndianRupee className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            ₹{totalPayroll.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total contract salaries</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Advances Given (This Month)</span>
            <Wallet className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            ₹{totalAdvances.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Deducted from month-end payout</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Net Pending Payout</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            ₹{totalNet.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Due at month end</p>
        </div>
      </div>

      {/* Conversational Assistant Banner */}
      <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-800/40 rounded-2xl p-4 text-white flex items-start space-x-3.5 shadow-sm">
        <span className="text-2xl">💬</span>
        <div className="text-xs">
          <div className="font-semibold text-emerald-300 mb-1">
            Hands-Free WhatsApp Staff Agent Ready
          </div>
          <p className="text-slate-300 leading-relaxed">
            You don't need to manually click buttons. Just voice note or text on WhatsApp:{' '}
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono">
              "Raju helper ko 1000 advance diya"
            </code>{' '}
            or{' '}
            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono">
              "Staff salary kitni baki hai?"
            </code>
            . The Staff Agent automatically recalculates net balance and logs audit records.
          </p>
        </div>
      </div>

      {/* Staff Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {staffList.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{s.name}</h3>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                      {s.role}
                    </span>
                    {s.phone && (
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{s.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Attendance</div>
                  <div className="text-xs font-semibold text-slate-700">
                    {s.presentDays} / {s.totalWorkingDays} Days
                  </div>
                </div>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs">
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
                  <span className="flex items-center space-x-1">
                    <span>Advance Taken</span>
                    {s.advanceSalaryTaken > 0 && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded">
                        Deduction
                      </span>
                    )}
                  </span>
                  <span className="font-semibold">
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
                className="flex-1 py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium rounded-xl text-xs transition"
              >
                + Give Advance
              </button>
              <button
                disabled={submitting}
                onClick={() => handleDisburse(s)}
                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition disabled:opacity-50"
              >
                ✓ Disburse Salary
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Give Advance Modal */}
      {advanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                <span>Record Salary Advance</span>
              </h3>
              <button
                onClick={() => setAdvanceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.role}) - Base ₹{s.monthlySalary.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Advance Amount (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1000"
                  required
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason / Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Emergency family medical need"
                  value={advanceNote}
                  onChange={(e) => setAdvanceNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
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
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Add Staff Member</span>
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
                  >
                    <option value="Helper">Helper</option>
                    <option value="Delivery Boy">Delivery Boy</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Billing Operator">Billing Operator</option>
                    <option value="Store Manager">Store Manager</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="9876543210"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Monthly Salary (₹)</label>
                <input
                  type="number"
                  placeholder="12000"
                  required
                  value={newStaffSalary}
                  onChange={(e) => setNewStaffSalary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 text-xs"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Save Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
