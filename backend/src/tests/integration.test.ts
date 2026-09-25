import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { connectDB, disconnectDB } from '../config/db';
import { seedDatabase } from '../seed/seedData';
import { OrchestratorAgent } from '../agents/orchestrator';
import { Business, Approval, PurchaseOrder, Inventory, Expense } from '../models';

describe('VyaparAI End-to-End Multi-Agent Integration Tests', () => {
  let businessId: string;

  before(async () => {
    await connectDB();
    await seedDatabase(true);
    const business = await Business.findOne({ name: 'Shree General Store' });
    assert.ok(business, 'Business must exist after seed');
    businessId = business._id.toString();
  });

  after(async () => {
    await disconnectDB();
  });

  test('Scenario 1: Inventory stock check returns accurate days remaining', async () => {
    const res = await OrchestratorAgent.processMessage({
      businessId,
      query: 'How much rice do I have?',
    });
    assert.strictEqual(res.agentName, 'InventoryAgent');
    assert.ok(res.text.includes('18 kg'), 'Should state 18 kg remaining');
    assert.ok(res.text.includes('3 days'), 'Should predict 3 days left');
  });

  test('Scenario 1 (Action): User asks to handle low stock -> Prepares PO & Approval', async () => {
    const res = await OrchestratorAgent.processMessage({
      businessId,
      query: 'Order the rice',
    });
    assert.strictEqual(res.agentName, 'InventoryAgent');
    assert.strictEqual(res.actionRequired, true);
    assert.ok(res.approvalId, 'Must create an Approval ID');
    assert.ok(res.buttons && res.buttons.length > 0, 'Must provide interactive action buttons');

    // Verify approval document in MongoDB
    const approval = await Approval.findById(res.approvalId);
    assert.ok(approval, 'Approval record must be in database');
    assert.strictEqual(approval.status, 'PENDING');
    assert.strictEqual(approval.riskLevel, 'MEDIUM');

    // Test Human Approval execution
    const approveRes = await OrchestratorAgent.handleApprovalAction({
      businessId,
      action: 'APPROVE',
      approvalId: res.approvalId,
    });
    assert.ok(approveRes.text.includes('Approved action'), 'Should confirm action approved');

    // Verify PO status changed to EXECUTED_SIMULATED
    const po = await PurchaseOrder.findById(approval.dataPayload.purchaseOrderId);
    assert.ok(po);
    assert.strictEqual(po.status, 'EXECUTED_SIMULATED');
  });

  test('Scenario 2: Supplier Payment Reconciliation detects pending & partial mismatch', async () => {
    const res = await OrchestratorAgent.processMessage({
      businessId,
      query: 'Check supplier payments',
    });
    assert.strictEqual(res.agentName, 'PaymentReconciliationAgent');
    assert.ok(res.text.includes('36,100'), 'Total pending must match ₹36,100');
    assert.ok(res.text.includes('2,000 mismatch'), 'Must detect ₹2,000 partial payment mismatch on ABC');
  });

  test('Scenario 3: Compliance Agent identifies GSTR-3B due in 5 days with flagged invoices', async () => {
    const res = await OrchestratorAgent.processMessage({
      businessId,
      query: 'What compliance tasks are pending?',
    });
    assert.strictEqual(res.agentName, 'ComplianceAgent');
    assert.ok(res.text.includes('GSTR-3B'), 'Should identify GSTR-3B');
    assert.ok(res.text.includes('5 days'), 'Should specify due in 5 days');
    assert.ok(res.text.includes('4 invoices') && res.text.includes('needing attention'), 'Should flag 4 invoices');
  });

  test('Scenario 4: Government Scheme Agent finds MSME support schemes', async () => {
    const res = await OrchestratorAgent.processMessage({
      businessId,
      query: 'Find schemes for my business',
    });
    assert.strictEqual(res.agentName, 'GovernmentSchemeAgent');
    assert.ok(res.text.includes('Pradhan Mantri Mudra Yojana') || res.text.includes('PMMY'), 'Should return Mudra');
    assert.ok(res.text.includes('DEMO DATA'), 'Must include clear demo data disclaimer');
  });

  test('Scenario 5: Expense Agent records conversational expense', async () => {
    const res = await OrchestratorAgent.processMessage({
      businessId,
      query: 'Petrol 2000',
    });
    assert.strictEqual(res.agentName, 'ExpenseAgent');
    assert.ok(res.text.includes('Transportation'), 'Must classify as Transportation');
    assert.ok(res.text.includes('2,000'), 'Must record ₹2,000');

    // Verify stored in DB
    const exp = await Expense.findOne({ businessId, amount: 2000, category: 'Transportation' });
    assert.ok(exp, 'Expense must exist in database');
  });

  test('Scenario 6: Business Insights Agent delivers comprehensive operational overview', async () => {
    const res = await OrchestratorAgent.processMessage({
      businessId,
      query: 'How is my business doing?',
    });
    assert.strictEqual(res.agentName, 'BusinessInsightsAgent');
    assert.ok(res.text.includes('Business Health Summary'), 'Must provide summary header');
    assert.ok(res.text.includes('Recommended Agent Actions'), 'Must provide actionable agent recommendations');
  });
});
