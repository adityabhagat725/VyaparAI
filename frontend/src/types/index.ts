export interface Business {
  _id: string;
  name: string;
  businessType: string;
  gstin?: string;
  pan?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  annualTurnover?: number;
  employeeCount?: number;
  settings?: {
    autoApproveLowRisk: boolean;
    stockoutRiskThresholdDays: number;
    gstAlertDaysPrior: number;
    overduePaymentGraceDays: number;
    whatsappNotificationsEnabled: boolean;
  };
}

export interface InventoryItem {
  productId: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  safetyStockThreshold: number;
  avgDailySales: number;
  estimatedDaysLeft: number;
  stockStatus: 'HEALTHY' | 'LOW' | 'CRITICAL';
  basePurchasePrice: number;
  preferredSupplier?: {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    leadDays: number;
  };
}

export interface SupplierItem {
  _id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstin?: string;
  productsSupplied: string[];
  outstandingBalance: number;
  avgDeliveryLeadDays: number;
  upiId?: string;
}

export interface InvoiceItem {
  _id: string;
  invoiceNumber: string;
  supplierId: {
    _id: string;
    name: string;
  };
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  dueDate: string;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  reconciliationStatus: 'MATCHED' | 'PARTIAL_MATCH' | 'UNMATCHED';
  reconciliationNote?: string;
}

export interface ComplianceTaskItem {
  taskId: string;
  title: string;
  category: string;
  formType: string;
  period: string;
  dueDate: string;
  daysRemaining: number;
  status: string;
  requiredDocuments: string[];
  missingDocuments: string[];
  preparedData?: {
    totalTurnover?: number;
    taxableValue?: number;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    itcEligible?: number;
    flaggedInvoicesCount?: number;
    summaryNotes?: string;
  };
  filingDisclaimer: string;
  approvedByOwner: boolean;
}

export interface SchemeItem {
  schemeId: string;
  name: string;
  code: string;
  ministry: string;
  benefitSummary: string;
  maxBenefitAmount: string;
  eligibilityDescription: string;
  matchScore: number;
  matchReason: string;
  requiredDocuments: string[];
  officialPortalUrl: string;
  isDemoData: boolean;
  applicationStatus: string;
  draftData?: any;
}

export interface ApprovalItem {
  _id: string;
  agentName: string;
  actionType: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  reason: string;
  amount?: number;
  proposedAction: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
  dataPayload: any;
  createdAt: string;
  executedAt?: string;
}

export interface AgentStep {
  stepNumber: number;
  agentName: string;
  action: string;
  toolCalled?: string;
  toolInput?: any;
  toolOutput?: any;
  reasoning?: string;
  durationMs: number;
  timestamp: string;
}

export interface AgentRunItem {
  _id: string;
  orchestratorIntent: string;
  triggerSource: string;
  status: string;
  userQuery?: string;
  summaryResult?: string;
  steps: AgentStep[];
  approvalId?: any;
  durationMs?: number;
  createdAt: string;
}

export interface AuditLogItem {
  _id: string;
  agentName: string;
  actionType: string;
  resourceType: string;
  riskLevel: string;
  status: string;
  inputData?: any;
  outputData?: any;
  timestamp: string;
}

export interface ChatMessage {
  _id: string;
  sender: 'USER' | 'AGENT' | 'SYSTEM';
  agentName?: string;
  messageType: 'TEXT' | 'ACTION_CARD' | 'APPROVAL_CARD';
  content: string;
  metadata?: {
    approvalId?: string;
    actionButtons?: Array<{
      label: string;
      actionPayload: string;
      style?: 'primary' | 'danger' | 'secondary';
    }>;
  };
  createdAt: string;
}

export interface StaffItem {
  id: string;
  name: string;
  phone?: string;
  role: string;
  monthlySalary: number;
  advanceSalaryTaken: number;
  presentDays: number;
  totalWorkingDays: number;
  earnedSalary: number;
  netPayable: number;
  active: boolean;
}

export interface PayrollSummary {
  totalStaffCount: number;
  totalMonthlyPayroll: number;
  totalAdvancesGiven: number;
  totalNetPayable: number;
  staff: StaffItem[];
}

