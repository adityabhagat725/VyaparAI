import { StaffTools } from '../tools/staffTools';
import { AgentResponse } from './inventoryAgent';

export class StaffAgent {
  static async process(query: string, businessId: string): Promise<AgentResponse> {
    const q = query.toLowerCase();

    // 1. Advance salary payment detection
    // Patterns like: "Raju ko 1000 advance", "Give 2000 advance to Raju", "1500 advance helper"
    const isAdvance =
      q.includes('advance') ||
      q.includes('उधार') ||
      q.includes('ऍडव्हान्स') ||
      q.includes('एडवांस') ||
      q.includes('diya') ||
      q.includes('dile');

    if (isAdvance) {
      // Extract amount
      const numMatch = query.match(/(?:rs\.?|₹|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
      const amount = numMatch ? parseFloat(numMatch[1].replace(/,/g, '')) : 1000;

      // Extract staff name or role
      let staffQuery = 'Raju';
      if (q.includes('raju') || q.includes('राजू')) staffQuery = 'Raju';
      else if (q.includes('anil') || q.includes('अनिल')) staffQuery = 'Anil';
      else if (q.includes('helper') || q.includes('हेल्पर')) staffQuery = 'Helper';
      else if (q.includes('delivery') || q.includes('डिलिव्हरी')) staffQuery = 'Delivery';

      try {
        const result = await StaffTools.recordSalaryAdvance(businessId, staffQuery, amount, query);

        return {
          agentName: 'StaffAgent',
          text: `✅ Recorded *₹${result.advanceRecorded.toLocaleString('en-IN')}* advance to *${result.staffName}*.\n\n• Monthly Salary: ₹${result.monthlySalary.toLocaleString('en-IN')}\n• Total Advance Taken: ₹${result.totalAdvanceTaken.toLocaleString('en-IN')}\n• Net Balance Due: *₹${result.netPayableRemaining.toLocaleString('en-IN')}*`,
          data: result,
          buttons: [
            {
              label: '📋 View All Staff',
              payload: 'VIEW_STAFF_PAYROLL',
              style: 'secondary',
            },
          ],
        };
      } catch (err: any) {
        return {
          agentName: 'StaffAgent',
          text: `Could not record advance: ${err.message}`,
        };
      }
    }

    // 2. Staff Payroll Summary inquiry
    const summary = await StaffTools.summarizePayroll(businessId);
    let text = `👥 *Staff & Payroll Summary (${summary.totalStaffCount} Active Staff):*\n\n`;

    summary.staff.forEach((s) => {
      text += `• *${s.name}* (${s.role})\n`;
      text += `   Monthly: ₹${s.monthlySalary.toLocaleString('en-IN')} | Advance: ₹${s.advanceSalaryTaken.toLocaleString('en-IN')} | *Net Due: ₹${s.netPayable.toLocaleString('en-IN')}*\n`;
    });

    text += `\n💰 *Total Net Payroll Due:* *₹${summary.totalNetPayable.toLocaleString('en-IN')}* (after deducting ₹${summary.totalAdvancesGiven.toLocaleString('en-IN')} advances).`;

    return {
      agentName: 'StaffAgent',
      text,
      data: summary,
      buttons: [
        {
          label: '💵 Record Staff Advance',
          payload: 'RECORD_STAFF_ADVANCE',
          style: 'primary',
        },
      ],
    };
  }
}
