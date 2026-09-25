import { ExpenseTools } from '../tools/expenseTools';
import { AgentRunService } from '../services/agentRunService';
import { AgentResponse } from './inventoryAgent';

export class ExpenseAgent {
  static async handle(params: {
    businessId: string;
    query: string;
    runId: string;
    phoneNumber?: string;
  }): Promise<AgentResponse> {
    const { businessId, query, runId } = params;
    const lower = query.toLowerCase();

    // If query is checking expenses
    if (lower.includes('how much') || lower.includes('show') || lower.includes('summary') || lower.includes('list')) {
      const summary = await ExpenseTools.getExpenseSummary(businessId);
      const catLines = Object.entries(summary.byCategory).map(
        ([cat, amt]) => `• ${cat}: ₹${amt.toLocaleString('en-IN')}`
      );

      return {
        agentName: 'ExpenseAgent',
        text: `📊 *Store Expense Summary:*\n\nTotal recorded expenses: *₹${summary.total.toLocaleString('en-IN')}* across ${summary.count} entries:\n\n${catLines.join('\n')}`,
      };
    }

    // Otherwise record new expense
    const startTime = Date.now();
    await AgentRunService.addStep(runId, {
      agentName: 'ExpenseAgent',
      action: 'TOOL: recordExpense',
      toolCalled: 'recordExpense',
      reasoning: 'Parsing conversational expense input, extracting amount, and auto-categorizing.',
      durationMs: Date.now() - startTime,
    });

    try {
      const expense = await ExpenseTools.recordExpense(businessId, query);
      const responseText = `✅ Recorded *₹${expense.amount.toLocaleString('en-IN')}* under *${expense.category}*.\nDescription: "${expense.description}"`;

      await AgentRunService.completeRun(runId, `Expense of ₹${expense.amount} recorded under ${expense.category}.`);

      return {
        agentName: 'ExpenseAgent',
        text: responseText,
        data: expense,
      };
    } catch (err: any) {
      return {
        agentName: 'ExpenseAgent',
        text: `⚠️ Could not record expense: ${err.message}. Please enter in format: "Petrol 2000" or "Packaging 850".`,
      };
    }
  }
}
