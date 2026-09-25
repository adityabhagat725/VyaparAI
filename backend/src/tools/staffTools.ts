import { Staff, AuditLog, Expense } from '../models';

export class StaffTools {
  static async listStaff(businessId: string) {
    const staff = await Staff.find({ businessId, active: true });
    return staff.map((s) => {
      const perDaySalary = s.monthlySalary / s.totalWorkingDays;
      const earnedSalary = Math.round(perDaySalary * s.presentDaysThisMonth);
      const netPayable = Math.max(0, earnedSalary - s.advanceSalaryTaken);

      return {
        id: s._id,
        name: s.name,
        phone: s.phone,
        role: s.role,
        monthlySalary: s.monthlySalary,
        advanceSalaryTaken: s.advanceSalaryTaken,
        presentDays: s.presentDaysThisMonth,
        totalWorkingDays: s.totalWorkingDays,
        earnedSalary,
        netPayable,
        active: s.active,
      };
    });
  }

  static async recordSalaryAdvance(
    businessId: string,
    nameOrRole: string,
    amount: number,
    note?: string
  ) {
    // Find staff by name (case-insensitive fuzzy)
    let staff = await Staff.findOne({
      businessId,
      name: { $regex: new RegExp(nameOrRole.trim(), 'i') },
      active: true,
    });

    if (!staff) {
      // Fallback: search by role
      staff = await Staff.findOne({
        businessId,
        role: { $regex: new RegExp(nameOrRole.trim(), 'i') },
        active: true,
      });
    }

    if (!staff) {
      // If still not found, pick the first active staff member
      staff = await Staff.findOne({ businessId, active: true });
    }

    if (!staff) {
      throw new Error(`No staff member found matching "${nameOrRole}".`);
    }

    const previousAdvance = staff.advanceSalaryTaken;
    staff.advanceSalaryTaken += amount;
    await staff.save();

    const perDaySalary = staff.monthlySalary / staff.totalWorkingDays;
    const earnedSalary = Math.round(perDaySalary * staff.presentDaysThisMonth);
    const netPayable = Math.max(0, earnedSalary - staff.advanceSalaryTaken);

    // Audit log
    await AuditLog.create({
      businessId,
      agentName: 'StaffAgent',
      actionType: 'RECORD_SALARY_ADVANCE',
      resourceType: 'Staff',
      resourceId: staff._id,
      riskLevel: 'LOW',
      inputData: { nameOrRole, amount, note },
      outputData: {
        staffName: staff.name,
        amount,
        previousAdvance,
        newTotalAdvance: staff.advanceSalaryTaken,
        netPayableRemaining: netPayable,
      },
      status: 'SUCCESS',
    });

    return {
      staffId: staff._id,
      staffName: staff.name,
      advanceRecorded: amount,
      totalAdvanceTaken: staff.advanceSalaryTaken,
      monthlySalary: staff.monthlySalary,
      earnedSalary,
      netPayableRemaining: netPayable,
    };
  }

  static async addStaff(
    businessId: string,
    data: { name: string; phone?: string; role?: string; monthlySalary: number }
  ) {
    const newStaff = await Staff.create({
      businessId,
      name: data.name,
      phone: data.phone || '',
      role: data.role || 'Helper',
      monthlySalary: data.monthlySalary || 12000,
      advanceSalaryTaken: 0,
      presentDaysThisMonth: 26,
      totalWorkingDays: 30,
      active: true,
    });

    await AuditLog.create({
      businessId,
      agentName: 'StaffAgent',
      actionType: 'CREATE_STAFF',
      resourceType: 'Staff',
      resourceId: newStaff._id,
      riskLevel: 'LOW',
      inputData: data,
      outputData: {
        staffName: newStaff.name,
        role: newStaff.role,
        monthlySalary: newStaff.monthlySalary,
      },
      status: 'SUCCESS',
    });

    return newStaff;
  }

  static async disburseSalary(businessId: string, staffId: string) {
    const staff = await Staff.findOne({ _id: staffId, businessId, active: true });
    if (!staff) {
      throw new Error('Staff member not found.');
    }

    const perDaySalary = staff.monthlySalary / staff.totalWorkingDays;
    const earnedSalary = Math.round(perDaySalary * staff.presentDaysThisMonth);
    const netPayout = Math.max(0, earnedSalary - staff.advanceSalaryTaken);

    // Record the net payout in Expenses
    await Expense.create({
      businessId: businessId as any,
      amount: netPayout,
      category: 'Salaries',
      description: `Monthly salary disbursement for ${staff.name} (${staff.role}) after ₹${staff.advanceSalaryTaken} advance deduction`,
      paymentMode: 'Bank Transfer / Cash',
      date: new Date(),
    });

    // Reset current month advance
    const previousAdvance = staff.advanceSalaryTaken;
    staff.advanceSalaryTaken = 0;
    await staff.save();

    await AuditLog.create({
      businessId,
      agentName: 'StaffAgent',
      actionType: 'DISBURSE_SALARY',
      resourceType: 'Staff',
      resourceId: staff._id,
      riskLevel: 'MEDIUM',
      inputData: { staffId },
      outputData: {
        staffName: staff.name,
        netPayout,
        earnedSalary,
        deductedAdvance: previousAdvance,
      },
      status: 'SUCCESS',
    });

    return {
      staffId: staff._id,
      staffName: staff.name,
      disbursedAmount: netPayout,
      deductedAdvance: previousAdvance,
    };
  }

  static async summarizePayroll(businessId: string) {
    const staffList = await this.listStaff(businessId);
    const totalMonthlyPayroll = staffList.reduce((acc, s) => acc + s.monthlySalary, 0);
    const totalAdvancesGiven = staffList.reduce((acc, s) => acc + s.advanceSalaryTaken, 0);
    const totalNetPayable = staffList.reduce((acc, s) => acc + s.netPayable, 0);

    return {
      totalStaffCount: staffList.length,
      totalMonthlyPayroll,
      totalAdvancesGiven,
      totalNetPayable,
      staff: staffList,
    };
  }
}

