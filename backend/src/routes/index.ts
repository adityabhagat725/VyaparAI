import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthController } from '../controllers/authController';
import { DashboardController } from '../controllers/dashboardController';
import { InventoryController } from '../controllers/inventoryController';
import { SupplierController } from '../controllers/supplierController';
import { PaymentController } from '../controllers/paymentController';
import { ComplianceController } from '../controllers/complianceController';
import { SchemeController } from '../controllers/schemeController';
import { ApprovalController } from '../controllers/approvalController';
import { AgentController } from '../controllers/agentController';
import { ChatController } from '../controllers/chatController';
import { SettingsController } from '../controllers/settingsController';
import { StaffController } from '../controllers/staffController';

const router = Router();

// Public Auth Endpoints
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authMiddleware, AuthController.me);
router.get('/auth/businesses', AuthController.listBusinesses);
router.post('/auth/switch-business', AuthController.switchBusiness);

// Protected Business Routes
router.use(authMiddleware);

// 1. Dashboard
router.get('/dashboard', DashboardController.getOverview);

// 2. Inventory & Procurement
router.get('/inventory', InventoryController.list);
router.get('/inventory/purchase-orders', InventoryController.listPurchaseOrders);
router.post('/inventory/reorder', InventoryController.triggerReorder);

// 3. Suppliers
router.get('/suppliers', SupplierController.list);

// 4. Payments & Invoices
router.get('/payments/reconciliation', PaymentController.getReconciliation);
router.get('/payments/invoices', PaymentController.listInvoices);
router.get('/payments', PaymentController.listPayments);
router.post('/payments/reconcile', PaymentController.reconcileInvoice);
router.post('/payments/pay', PaymentController.disbursePayment);
router.post('/payments/link', PaymentController.createPaymentLink);

// 5. Compliance & GST
router.get('/compliance', ComplianceController.list);
router.post('/compliance/:id/prepare', ComplianceController.prepareDraft);
router.post('/compliance/:id/authorize', ComplianceController.authorizeFiling);

// 6. Government Schemes
router.get('/schemes', SchemeController.list);
router.post('/schemes/:id/draft', SchemeController.generateDraft);

// 7. Approvals (Human-in-the-Loop)
router.get('/approvals', ApprovalController.list);
router.post('/approvals/:id/approve', ApprovalController.approve);
router.post('/approvals/:id/reject', ApprovalController.reject);

// 8. Agent Activity & Audit Logs
router.get('/agents/activity', AgentController.listActivity);
router.get('/agents/audit-logs', AgentController.listAuditLogs);

// 9. Conversational Chat & WhatsApp Simulator
router.get('/chat/messages', ChatController.getMessages);
router.post('/chat', ChatController.sendMessage);
router.all('/whatsapp/webhook', ChatController.whatsappWebhook);

// 10. Staff & Payroll
router.get('/staff', StaffController.list);
router.post('/staff', StaffController.create);
router.post('/staff/advance', StaffController.recordAdvance);
router.post('/staff/:id/disburse', StaffController.disburse);

// 11. Settings & Demo Management
router.get('/settings', SettingsController.get);
router.put('/settings', SettingsController.update);
router.post('/settings/reset-demo', SettingsController.resetDemo);

export default router;
