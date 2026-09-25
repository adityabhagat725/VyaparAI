import { ComplianceTools } from '../tools/complianceTools';
import { AgentRunService } from '../services/agentRunService';
import { AgentResponse } from './inventoryAgent';

export class ComplianceAgent {
  static async handle(params: {
    businessId: string;
    query: string;
    runId: string;
    phoneNumber?: string;
  }): Promise<AgentResponse> {
    const { businessId, runId } = params;

    const startTime = Date.now();
    await AgentRunService.addStep(runId, {
      agentName: 'ComplianceAgent',
      action: 'TOOL: getUpcomingDeadlines',
      toolCalled: 'getUpcomingDeadlines',
      reasoning: 'Checking statutory GST filing schedules, invoice reconciliation status, and document audit records.',
      durationMs: Date.now() - startTime,
    });

    const tasks = await ComplianceTools.getUpcomingDeadlines(businessId);
    const nextTask = tasks[0];

    if (!nextTask) {
      return {
        agentName: 'ComplianceAgent',
        text: '✅ All compliance filings for your business are currently up to date! No deadlines within the next 30 days.',
      };
    }

    let messageText = `⚖️ *GST & Compliance Alert:*\n\n` +
      `Your next compliance task *${nextTask.title}* (${nextTask.period}) is due in *${nextTask.daysRemaining} days* (${new Date(nextTask.dueDate).toLocaleDateString('en-IN')}).\n\n` +
      `• *Status:* ${nextTask.status.replace('_', ' ')}\n` +
      `• *Taxable Turnover Reconciled:* ₹${(nextTask.preparedData?.taxableValue || 0).toLocaleString('en-IN')}\n` +
      `• *Eligible ITC (Input Tax Credit):* ₹${(nextTask.preparedData?.itcEligible || 0).toLocaleString('en-IN')}\n`;

    if (nextTask.preparedData?.flaggedInvoicesCount > 0) {
      messageText += `\n⚠️ I found *${nextTask.preparedData.flaggedInvoicesCount} invoices* needing attention before submission (missing supplier E-way bill or ITC mismatch). I have prepared the required draft information for your review.`;
    }

    messageText += `\n\n_Note: ${nextTask.filingDisclaimer}_`;

    await AgentRunService.completeRun(runId, `Compliance status checked. Next task ${nextTask.title} due in ${nextTask.daysRemaining} days.`);

    return {
      agentName: 'ComplianceAgent',
      text: messageText,
      data: { tasks, nextTask },
      buttons: [
        { label: '📄 Review Draft Form', payload: `VIEW_COMPLIANCE:${nextTask.taskId}`, style: 'primary' },
        { label: '📑 Missing Documents', payload: `DOCS_COMPLIANCE:${nextTask.taskId}`, style: 'secondary' },
      ],
    };
  }
}
