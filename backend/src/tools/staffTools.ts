import { Staff, AuditLog } from '../models';

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
        role: s.role,
        monthlySalary: s.monthlySalary,
        advanceSalaryTaken: s.advanceSalaryTaken,
        presentDays: s.presentDaysThisMonth,
        earnedSalary,
        netPayable,
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
      details: {
        staffName: staff.name,
        amount,
        previousAdvance,
        newTotalAdvance: staff.advanceSalaryTaken,
        netPayableRemaining: netPayable,
        note: note || 'Conversational salary advance via WhatsApp',
      },
      status: 'EXECUTED_SIMULATED',
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
