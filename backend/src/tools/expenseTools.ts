import { Expense } from '../models';
import { AuditService } from '../services/auditService';

export interface ParsedExpense {
  amount: number;
  category: string;
  description: string;
  confidence: number;
}

export class ExpenseTools {
  static parseExpenseInput(rawText: string): ParsedExpense {
    const text = rawText.trim();
    // Look for number patterns (e.g. 2000, 2,000, ₹2000, Rs. 2000)
    const amountMatch = text.match(/(?:(?:₹|rs\.?|inr)\s*)?(\d+(?:,\d+)*(?:\.\d+)?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

    const lower = text.toLowerCase();
    let category = 'Misc';
    let confidence = 0.85;

    if (lower.includes('petrol') || lower.includes('diesel') || lower.includes('fuel') || lower.includes('transport') || lower.includes('tempo') || lower.includes('auto') || lower.includes('delivery')) {
      category = 'Transportation';
      confidence = 0.98;
    } else if (lower.includes('pack') || lower.includes('bag') || lower.includes('box') || lower.includes('tape') || lower.includes('pouch')) {
      category = 'Packaging';
      confidence = 0.95;
    } else if (lower.includes('electric') || lower.includes('light') || lower.includes('mseb') || lower.includes('water') || lower.includes('power') || lower.includes('bill')) {
      category = 'Utilities';
      confidence = 0.99;
    } else if (lower.includes('rent') || lower.includes('shop rent')) {
      category = 'Rent';
      confidence = 0.99;
    } else if (lower.includes('salary') || lower.includes('wages') || lower.includes('worker') || lower.includes('helper')) {
      category = 'Salaries';
      confidence = 0.95;
    } else if (lower.includes('tea') || lower.includes('snack') || lower.includes('refreshment') || lower.includes('coffee')) {
      category = 'Refreshments';
      confidence = 0.92;
    }

    return {
      amount,
      category,
      description: text,
      confidence,
    };
  }

  static async recordExpense(businessId: string, input: string): Promise<any> {
    const parsed = this.parseExpenseInput(input);
    if (!parsed.amount || parsed.amount <= 0) {
      throw new Error('Could not detect a valid expense amount in your input.');
    }

    const expense = await Expense.create({
      businessId: businessId as any,
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
      expenseDate: new Date(),
      paymentMode: 'CASH',
      autoCategorized: true,
      confidenceScore: parsed.confidence,
    });

    await AuditService.log({
      businessId,
      agentName: 'ExpenseAgent',
      actionType: 'RECORD_EXPENSE',
      resourceType: 'Expense',
      resourceId: expense._id.toString(),
      riskLevel: 'LOW',
      inputData: { input },
      outputData: { expenseId: expense._id.toString(), amount: parsed.amount, category: parsed.category },
      status: 'SUCCESS',
    });

    return expense;
  }

  static async getExpenseSummary(businessId: string): Promise<{ total: number; byCategory: Record<string, number>; count: number }> {
    const expenses = await Expense.find({ businessId });
    let total = 0;
    const byCategory: Record<string, number> = {};

    for (const exp of expenses) {
      total += exp.amount;
      byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
    }

    return { total, byCategory, count: expenses.length };
  }
}
