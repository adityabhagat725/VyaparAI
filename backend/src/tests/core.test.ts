import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ExpenseTools } from '../tools/expenseTools';
import { OrchestratorAgent } from '../agents/orchestrator';

describe('Inventory & Expense Tool Logic Tests', () => {
  test('Expense NLP parsing extracts amount and classifies transportation correctly', () => {
    const parsed = ExpenseTools.parseExpenseInput('Petrol 2000');
    assert.strictEqual(parsed.amount, 2000);
    assert.strictEqual(parsed.category, 'Transportation');
    assert.ok(parsed.confidence >= 0.95);
  });

  test('Expense NLP parsing handles rupees symbol and packaging category', () => {
    const parsed = ExpenseTools.parseExpenseInput('₹850 for packing bags and tape');
    assert.strictEqual(parsed.amount, 850);
    assert.strictEqual(parsed.category, 'Packaging');
  });

  test('Expense NLP parsing handles utilities category', () => {
    const parsed = ExpenseTools.parseExpenseInput('MSEB electric bill 3400');
    assert.strictEqual(parsed.amount, 3400);
    assert.strictEqual(parsed.category, 'Utilities');
  });

  test('Stockout forecast formula computes correct days remaining', () => {
    const currentStock = 18;
    const avgDailySales = 6;
    const daysLeft = Math.round(currentStock / avgDailySales);
    assert.strictEqual(daysLeft, 3);
  });

  test('Critical stockout condition triggers when days left <= 2', () => {
    const currentStock = 7;
    const avgDailySales = 3.5;
    const daysLeft = Math.round(currentStock / avgDailySales);
    assert.strictEqual(daysLeft, 2);
    const status = daysLeft <= 2 ? 'CRITICAL' : 'HEALTHY';
    assert.strictEqual(status, 'CRITICAL');
  });
});

describe('Orchestrator Intent Classification Tests', () => {
  test('Classifies low stock inquiry as CHECK_INVENTORY', () => {
    const intent = OrchestratorAgent.classifyIntent('How much rice do I have?');
    assert.strictEqual(intent, 'CHECK_INVENTORY');
  });

  test('Classifies procurement request as REORDER_INVENTORY', () => {
    const intent = OrchestratorAgent.classifyIntent('Order the rice');
    assert.strictEqual(intent, 'REORDER_INVENTORY');
  });

  test('Classifies pending payment inquiry as PAYMENT_RECONCILIATION', () => {
    const intent = OrchestratorAgent.classifyIntent('Which supplier haven\'t I paid?');
    assert.strictEqual(intent, 'PAYMENT_RECONCILIATION');
  });

  test('Classifies GST question as GST_COMPLIANCE', () => {
    const intent = OrchestratorAgent.classifyIntent('When is my GST task due?');
    assert.strictEqual(intent, 'GST_COMPLIANCE');
  });

  test('Classifies MSME scheme query as GOVERNMENT_SCHEMES', () => {
    const intent = OrchestratorAgent.classifyIntent('Do I qualify for MSME support?');
    assert.strictEqual(intent, 'GOVERNMENT_SCHEMES');
  });

  test('Classifies expense logging as RECORD_EXPENSE', () => {
    const intent = OrchestratorAgent.classifyIntent('Record ₹2,000 petrol expense');
    assert.strictEqual(intent, 'RECORD_EXPENSE');
  });

  test('Classifies overall performance as BUSINESS_INSIGHTS', () => {
    const intent = OrchestratorAgent.classifyIntent('How is my business doing?');
    assert.strictEqual(intent, 'BUSINESS_INSIGHTS');
  });

  test('Classifies interactive approval button as APPROVE_ACTION', () => {
    const intent = OrchestratorAgent.classifyIntent('APPROVE:609d123456');
    assert.strictEqual(intent, 'APPROVE_ACTION');
  });
});
