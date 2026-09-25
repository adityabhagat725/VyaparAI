import bcrypt from 'bcryptjs';
import {
  Business,
  User,
  Product,
  Inventory,
  Supplier,
  Invoice,
  Payment,
  Expense,
  ComplianceTask,
  GovernmentScheme,
  SchemeApplication,
  PurchaseOrder,
  Approval,
  AuditLog,
  Notification,
  Conversation,
  Message,
  Staff,
} from '../models';

export async function seedDatabase(force: boolean = false): Promise<void> {
  const existingBusiness = await Business.findOne({ name: 'Shree General Store' });
  if (existingBusiness && !force) {
    console.log('Database already contains demo data for "Shree General Store". Skipping seeding.');
    return;
  }

  console.log('Clearing old data and populating realistic demo data for "Shree General Store"...');
  await Promise.all([
    Business.deleteMany({}),
    User.deleteMany({}),
    Product.deleteMany({}),
    Inventory.deleteMany({}),
    Supplier.deleteMany({}),
    Invoice.deleteMany({}),
    Payment.deleteMany({}),
    Expense.deleteMany({}),
    ComplianceTask.deleteMany({}),
    GovernmentScheme.deleteMany({}),
    SchemeApplication.deleteMany({}),
    PurchaseOrder.deleteMany({}),
    Approval.deleteMany({}),
    AuditLog.deleteMany({}),
    Notification.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Staff.deleteMany({}),
  ]);

  // 1. Create Business
  const business = await Business.create({
    name: 'Shree General Store',
    businessType: 'Kirana & Retail',
    gstin: '27AABCS1429B1Z1',
    pan: 'AABCS1429B',
    address: 'Shop No. 12, Shivaji Market, Sadashiv Peth',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411030',
    phone: '+91 98221 55667',
    email: 'ramesh@shreegeneral.com',
    annualTurnover: 3850000,
    employeeCount: 3,
    settings: {
      autoApproveLowRisk: true,
      stockoutRiskThresholdDays: 4,
      gstAlertDaysPrior: 7,
      overduePaymentGraceDays: 3,
      whatsappNotificationsEnabled: true,
    },
  });

  // 2. Create Demo User
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await User.create({
    businessId: business._id,
    name: 'Ramesh Gupta',
    email: 'ramesh@shreegeneral.com',
    passwordHash,
    phone: '+91 98221 55667',
    role: 'OWNER',
    isDemoUser: true,
  });

  // 3. Create Suppliers
  const abcSupplier = await Supplier.create({
    businessId: business._id,
    name: 'ABC Wholesale',
    contactPerson: 'Ajay Sharma',
    phone: '+91 98220 11223',
    email: 'orders@abcwholesale.com',
    gstin: '27AAACA9921D1ZZ',
    address: 'Gate 3, Market Yard, Gultekdi, Pune',
    productsSupplied: ['Rice', 'Sugar', 'Wheat'],
    paymentTermsDays: 15,
    outstandingBalance: 12500,
    avgDeliveryLeadDays: 2,
    upiId: 'abcwholesale@icici',
  });

  const kumarSupplier = await Supplier.create({
    businessId: business._id,
    name: 'Kumar Distributors',
    contactPerson: 'Sunil Kumar',
    phone: '+91 98220 44556',
    email: 'kumar.distributors@gmail.com',
    gstin: '27AABCK8842E1ZQ',
    address: 'Plot 44, Hadapsar Industrial Area, Pune',
    productsSupplied: ['Cooking Oil', 'Biscuits', 'Packaged Snacks'],
    paymentTermsDays: 10,
    outstandingBalance: 8200,
    avgDeliveryLeadDays: 2,
    upiId: 'kumardist@hdfcbank',
  });

  const shreeSuppliers = await Supplier.create({
    businessId: business._id,
    name: 'Shree Suppliers',
    contactPerson: 'Dilip Patel',
    phone: '+91 98220 77889',
    email: 'dilip@shreesuppliers.in',
    gstin: '27AAGCS7712M1Z5',
    address: 'B-12, APMC Market, Vashi / Pune Depot',
    productsSupplied: ['Tea', 'Salt', 'Spices'],
    paymentTermsDays: 7,
    outstandingBalance: 15400,
    avgDeliveryLeadDays: 3,
    upiId: 'shreesuppliers@okaxis',
  });

  // 4. Create Products & Inventory
  const productsData = [
    {
      name: 'Kolam Rice (Steam)',
      category: 'Grains',
      sku: 'RICE-01',
      unit: 'kg',
      basePurchasePrice: 48,
      sellingPrice: 58,
      taxRatePercent: 0,
      currentStock: 18, // 18kg remaining
      safetyStockThreshold: 30,
      recommendedReorderQuantity: 50,
      avgDailySales: 6, // 18 / 6 = 3 days left
      stockStatus: 'LOW' as const,
      preferredSupplierId: abcSupplier._id,
    },
    {
      name: 'Sunflower Cooking Oil (1L Pouch)',
      category: 'Edible Oils',
      sku: 'OIL-01',
      unit: 'L',
      basePurchasePrice: 124,
      sellingPrice: 145,
      taxRatePercent: 5,
      currentStock: 7, // 7L remaining
      safetyStockThreshold: 20,
      recommendedReorderQuantity: 25,
      avgDailySales: 3.5, // 7 / 3.5 = 2 days left
      stockStatus: 'CRITICAL' as const,
      preferredSupplierId: kumarSupplier._id,
    },
    {
      name: 'Refined White Sugar',
      category: 'Commodities',
      sku: 'SUGAR-01',
      unit: 'kg',
      basePurchasePrice: 40,
      sellingPrice: 46,
      taxRatePercent: 5,
      currentStock: 12, // 12kg remaining
      safetyStockThreshold: 25,
      recommendedReorderQuantity: 40,
      avgDailySales: 4, // 12 / 4 = 3 days left
      stockStatus: 'LOW' as const,
      preferredSupplierId: abcSupplier._id,
    },
    {
      name: 'Chakki Fresh Sharbati Atta',
      category: 'Flour',
      sku: 'ATTA-01',
      unit: 'kg',
      basePurchasePrice: 36,
      sellingPrice: 44,
      taxRatePercent: 0,
      currentStock: 45,
      safetyStockThreshold: 20,
      recommendedReorderQuantity: 50,
      avgDailySales: 5, // 9 days left
      stockStatus: 'HEALTHY' as const,
      preferredSupplierId: abcSupplier._id,
    },
    {
      name: 'Assam Premium CTC Tea',
      category: 'Beverages',
      sku: 'TEA-01',
      unit: 'kg',
      basePurchasePrice: 280,
      sellingPrice: 340,
      taxRatePercent: 5,
      currentStock: 16,
      safetyStockThreshold: 8,
      recommendedReorderQuantity: 20,
      avgDailySales: 1, // 16 days left
      stockStatus: 'HEALTHY' as const,
      preferredSupplierId: shreeSuppliers._id,
    },
    {
      name: 'Marie Gold Biscuits (Carton of 24)',
      category: 'Packaged Food',
      sku: 'BISC-01',
      unit: 'box',
      basePurchasePrice: 420,
      sellingPrice: 500,
      taxRatePercent: 12,
      currentStock: 28,
      safetyStockThreshold: 10,
      recommendedReorderQuantity: 20,
      avgDailySales: 2, // 14 days left
      stockStatus: 'HEALTHY' as const,
      preferredSupplierId: kumarSupplier._id,
    },
    {
      name: 'Pasteurized Toned Milk (500ml)',
      category: 'Dairy',
      sku: 'MILK-01',
      unit: 'packet',
      basePurchasePrice: 26,
      sellingPrice: 30,
      taxRatePercent: 0,
      currentStock: 35,
      safetyStockThreshold: 15,
      recommendedReorderQuantity: 40,
      avgDailySales: 15,
      stockStatus: 'HEALTHY' as const,
      preferredSupplierId: kumarSupplier._id,
    },
    {
      name: 'Tata Iodized Salt (1kg Pouch)',
      category: 'Commodities',
      sku: 'SALT-01',
      unit: 'packet',
      basePurchasePrice: 22,
      sellingPrice: 28,
      taxRatePercent: 0,
      currentStock: 40,
      safetyStockThreshold: 15,
      recommendedReorderQuantity: 30,
      avgDailySales: 3,
      stockStatus: 'HEALTHY' as const,
      preferredSupplierId: shreeSuppliers._id,
    },
  ];

  for (const item of productsData) {
    const product = await Product.create({
      businessId: business._id,
      name: item.name,
      category: item.category,
      sku: item.sku,
      unit: item.unit,
      basePurchasePrice: item.basePurchasePrice,
      sellingPrice: item.sellingPrice,
      taxRatePercent: item.taxRatePercent,
    });

    const estimatedDaysLeft = Math.round(item.currentStock / item.avgDailySales);

    await Inventory.create({
      businessId: business._id,
      productId: product._id,
      currentStock: item.currentStock,
      safetyStockThreshold: item.safetyStockThreshold,
      recommendedReorderQuantity: item.recommendedReorderQuantity,
      avgDailySales: item.avgDailySales,
      stockVelocity: item.avgDailySales,
      estimatedDaysLeft,
      stockStatus: item.stockStatus,
      preferredSupplierId: item.preferredSupplierId,
      lastAuditedAt: new Date(),
    });
  }

  // 5. Create Invoices & Payments for Scenario 2 (Payment Reconciliation)
  // ABC Wholesale: Pending ₹12,500 with ₹2,000 partial payment mismatch (Invoice: ₹14,500, Paid: ₹2,000, Pending: ₹12,500)
  const invABC = await Invoice.create({
    businessId: business._id,
    supplierId: abcSupplier._id,
    invoiceNumber: 'INV-ABC-2026-089',
    invoiceDate: new Date(Date.now() - 12 * 86400000),
    dueDate: new Date(Date.now() - 2 * 86400000), // 2 days overdue
    amount: 14500,
    paidAmount: 2000,
    pendingAmount: 12500,
    status: 'PARTIALLY_PAID',
    reconciliationStatus: 'PARTIAL_MATCH',
    reconciliationNote: 'I found a ₹2,000 mismatch between an ABC Wholesale invoice and the recorded payment. Would you like me to investigate?',
    items: [{ productName: 'Kolam Rice (Steam)', quantity: 200, unit: 'kg', unitPrice: 48, totalPrice: 9600 }],
  });

  await Payment.create({
    businessId: business._id,
    supplierId: abcSupplier._id,
    invoiceId: invABC._id,
    amount: 2000,
    paymentDate: new Date(Date.now() - 5 * 86400000),
    paymentMode: 'UPI',
    referenceNumber: 'UPI/20260918/ABC/99120',
    status: 'COMPLETED',
    notes: 'Partial payment made via UPI. ₹12,500 balance remaining with ₹2,000 recorded voucher.',
  });

  // Invoice 2: Kumar Distributors - Pending payment ₹8,200
  await Invoice.create({
    businessId: business._id,
    supplierId: kumarSupplier._id,
    invoiceNumber: 'INV-KMR-2026-102',
    invoiceDate: new Date(Date.now() - 8 * 86400000),
    dueDate: new Date(Date.now() + 2 * 86400000), // Due in 2 days
    amount: 8200,
    paidAmount: 0,
    pendingAmount: 8200,
    status: 'UNPAID',
    reconciliationStatus: 'UNMATCHED',
    items: [{ productName: 'Sunflower Cooking Oil', quantity: 50, unit: 'L', unitPrice: 124, totalPrice: 6200 }],
  });

  // Invoice 3: Shree Suppliers - Pending payment ₹15,400
  await Invoice.create({
    businessId: business._id,
    supplierId: shreeSuppliers._id,
    invoiceNumber: 'INV-SHR-2026-115',
    invoiceDate: new Date(Date.now() - 4 * 86400000),
    dueDate: new Date(Date.now() + 3 * 86400000), // Due in 3 days
    amount: 15400,
    paidAmount: 0,
    pendingAmount: 15400,
    status: 'UNPAID',
    reconciliationStatus: 'UNMATCHED',
    items: [{ productName: 'Assam Premium CTC Tea', quantity: 50, unit: 'kg', unitPrice: 280, totalPrice: 14000 }],
  });

  // Historical Matched Invoices (3 matched transactions)
  const matchedSuppliers = [
    { sup: abcSupplier, no: 'INV-ABC-2026-071', amt: 9600, ref: 'UPI/20260825/99812' },
    { sup: kumarSupplier, no: 'INV-KMR-2026-088', amt: 6200, ref: 'NEFT/20260901/77123' },
    { sup: shreeSuppliers, no: 'INV-SHR-2026-094', amt: 11000, ref: 'UPI/20260908/33214' },
  ];

  for (const m of matchedSuppliers) {
    const inv = await Invoice.create({
      businessId: business._id,
      supplierId: m.sup._id,
      invoiceNumber: m.no,
      invoiceDate: new Date(Date.now() - 25 * 86400000),
      dueDate: new Date(Date.now() - 10 * 86400000),
      amount: m.amt,
      paidAmount: m.amt,
      pendingAmount: 0,
      status: 'PAID',
      reconciliationStatus: 'MATCHED',
      items: [{ productName: 'Wholesale Stock', quantity: 1, unit: 'lot', unitPrice: m.amt, totalPrice: m.amt }],
    });

    await Payment.create({
      businessId: business._id,
      supplierId: m.sup._id,
      invoiceId: inv._id,
      amount: m.amt,
      paymentDate: new Date(Date.now() - 12 * 86400000),
      paymentMode: 'UPI',
      referenceNumber: m.ref,
      status: 'COMPLETED',
      reconciled: true,
      notes: 'Fully matched and reconciled.',
    });
  }

  // 6. Create Compliance Tasks (Scenario 3: GST)
  await ComplianceTask.create({
    businessId: business._id,
    title: 'GSTR-3B Monthly Return',
    category: 'GST',
    formType: 'GSTR-3B',
    period: 'August 2026',
    dueDate: new Date(Date.now() + 5 * 86400000), // Due in 5 days
    status: 'PENDING_REVIEW',
    requiredDocuments: ['GSTR-2B Statement', 'Sales Register', 'Purchase Invoices', 'Bank Statements'],
    missingDocuments: ['Invoice #INV-KMR-2026-088 E-Way bill copy', 'Credit Note from ABC Wholesale'],
    preparedData: {
      totalTurnover: 320000,
      taxableValue: 295000,
      cgstAmount: 7375,
      sgstAmount: 7375,
      igstAmount: 2400,
      itcEligible: 12850,
      invoicesCount: 42,
      flaggedInvoicesCount: 4,
      summaryNotes: 'Agent reconciled 42 inward/outward invoices. Flagged 4 invoices needing vendor confirmation before final submission.',
    },
    approvedByOwner: false,
  });

  await ComplianceTask.create({
    businessId: business._id,
    title: 'GSTR-1 Outward Supplies',
    category: 'GST',
    formType: 'GSTR-1',
    period: 'September 2026',
    dueDate: new Date(Date.now() + 18 * 86400000), // Due in 18 days
    status: 'UPCOMING',
    requiredDocuments: ['B2B Sales Invoices', 'B2C Sales Register', 'HSN Summary'],
    missingDocuments: [],
    preparedData: {
      totalTurnover: 185000,
      invoicesCount: 26,
      summaryNotes: 'Continuous sync from POS and invoices.',
    },
    approvedByOwner: false,
  });

  // 7. Create Government Schemes (Scenario 4: Government Schemes)
  const mudraScheme = await GovernmentScheme.create({
    name: 'Pradhan Mantri Mudra Yojana (PMMY) — Kishor Category',
    code: 'PMMY-KISHOR',
    ministry: 'Ministry of Finance / SIDBI',
    sector: 'Kirana, Retail, Services',
    schemeCategory: 'COLLATERAL_FREE_LOAN',
    benefitSummary: 'Collateral-free working capital or equipment loan from ₹50,000 to ₹5,00,000 at competitive bank interest rates.',
    maxBenefitAmount: '₹5,00,000',
    eligibilityDescription: 'Small retail store, Kirana shop, or local enterprise with operational history > 1 year and valid Udyam certificate.',
    eligibilityCriteria: {
      minTurnover: 500000,
      maxTurnover: 10000000,
      targetSectors: ['Retail', 'Kirana', 'Trading'],
      targetBusinessTypes: ['Kirana & Retail', 'Wholesale'],
      minYearsInBusiness: 1,
      requiresUdyamRegistration: true,
      requiresGST: false,
    },
    requiredDocuments: ['Udyam Registration Certificate', 'PAN Card', 'Aadhaar Card', 'Last 6 Months Bank Statement', 'Shop Act License'],
    officialPortalUrl: 'https://www.mudra.org.in',
    isDemoData: true,
  });

  const cgtmseScheme = await GovernmentScheme.create({
    name: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
    code: 'CGTMSE-SCHEME',
    ministry: 'Ministry of MSME',
    sector: 'Manufacturing & Retail Trade',
    schemeCategory: 'COLLATERAL_FREE_LOAN',
    benefitSummary: 'Guaranteed collateral-free bank loans up to ₹200 Lakhs with 85% credit guarantee coverage by the trust.',
    maxBenefitAmount: '₹2,00,00,000 (85% Guaranteed)',
    eligibilityDescription: 'Registered Micro & Small retail traders and manufacturers with satisfactory credit appraisal.',
    eligibilityCriteria: {
      minTurnover: 1000000,
      maxTurnover: 50000000,
      targetSectors: ['Retail', 'Wholesale', 'Manufacturing'],
      targetBusinessTypes: ['Kirana & Retail', 'Wholesale', 'Manufacturing'],
      minYearsInBusiness: 2,
      requiresUdyamRegistration: true,
      requiresGST: true,
    },
    requiredDocuments: ['Udyam Certificate', 'GST Returns for 1 Year', 'Audited Financials', 'KYC of Proprietor'],
    officialPortalUrl: 'https://www.cgtmse.in',
    isDemoData: true,
  });

  const pmegpScheme = await GovernmentScheme.create({
    name: 'Prime Minister Employment Generation Programme (PMEGP)',
    code: 'PMEGP-SUBSIDY',
    ministry: 'Ministry of MSME / KVIC',
    sector: 'Service and Micro-Retail Expansion',
    schemeCategory: 'CREDIT_SUBSIDY',
    benefitSummary: 'Government subsidy of 15% to 35% on project cost for setting up new micro-units or modernizing existing stores.',
    maxBenefitAmount: 'Up to 35% Margin Money Subsidy',
    eligibilityDescription: 'Individuals above 18 years, proprietary micro-units with total project cost up to ₹20 Lakhs in service/trading.',
    eligibilityCriteria: {
      minTurnover: 0,
      maxTurnover: 5000000,
      targetSectors: ['Services', 'Retail', 'Agro-processing'],
      targetBusinessTypes: ['Kirana & Retail', 'Manufacturing'],
      minYearsInBusiness: 0,
      requiresUdyamRegistration: true,
      requiresGST: false,
    },
    requiredDocuments: ['Detailed Project Report (DPR)', 'Educational Qualification', 'Aadhaar / PAN', 'Rural/Urban Certificate'],
    officialPortalUrl: 'https://www.kviconline.gov.in/pmegpeportal',
    isDemoData: true,
  });

  // Pre-seed matched applications
  await SchemeApplication.create({
    businessId: business._id,
    schemeId: mudraScheme._id,
    matchScore: 94,
    matchReason: 'Your Kirana & Retail business with ₹38.5 Lakhs annual turnover meets all criteria for Kishor category working capital.',
    status: 'DRAFT_APPLICATION_READY',
    draftData: {
      applicantName: 'Ramesh Gupta',
      enterpriseName: 'Shree General Store',
      udyamNumber: 'UDYAM-MH-26-0094123',
      proposedLoanAmount: 400000,
      activityDescription: 'Working capital to expand cold storage and packaged FMCG inventory.',
    },
    checklist: [
      { documentName: 'Udyam Certificate', uploaded: true, mandatory: true },
      { documentName: 'PAN & Aadhaar', uploaded: true, mandatory: true },
      { documentName: '6-Month Bank Statement', uploaded: true, mandatory: true },
      { documentName: 'Shop Act License', uploaded: false, mandatory: false },
    ],
  });

  await SchemeApplication.create({
    businessId: business._id,
    schemeId: cgtmseScheme._id,
    matchScore: 88,
    matchReason: 'Business holds active GSTIN (27AABCS1429B1Z1) and over 2 years in retail trade.',
    status: 'DISCOVERED',
    checklist: [
      { documentName: 'Udyam Certificate', uploaded: true, mandatory: true },
      { documentName: 'GST Returns', uploaded: true, mandatory: true },
    ],
  });

  await SchemeApplication.create({
    businessId: business._id,
    schemeId: pmegpScheme._id,
    matchScore: 76,
    matchReason: 'Eligible for store modernization subsidy under Urban Retail Services category.',
    status: 'DISCOVERED',
    checklist: [{ documentName: 'Detailed Project Report (DPR)', uploaded: false, mandatory: true }],
  });

  // 8. Create Expenses (Scenario 5: Expenses)
  await Expense.create([
    {
      businessId: business._id,
      amount: 2000,
      category: 'Transportation',
      description: 'Tempo transport for wholesale market stock pickup from Market Yard',
      expenseDate: new Date(Date.now() - 1 * 86400000),
      paymentMode: 'CASH',
      autoCategorized: true,
      confidenceScore: 0.98,
    },
    {
      businessId: business._id,
      amount: 850,
      category: 'Packaging',
      description: 'Brown paper carry bags and packaging tape rolls',
      expenseDate: new Date(Date.now() - 3 * 86400000),
      paymentMode: 'UPI',
      autoCategorized: true,
      confidenceScore: 0.95,
    },
    {
      businessId: business._id,
      amount: 3400,
      category: 'Utilities',
      description: 'MSEB Commercial Electricity bill for store & display refrigerator',
      expenseDate: new Date(Date.now() - 6 * 86400000),
      paymentMode: 'UPI',
      autoCategorized: true,
      confidenceScore: 0.99,
    },
  ]);

  // 9. Create Proactive Notifications
  await Notification.create([
    {
      businessId: business._id,
      type: 'INVENTORY_ALERT',
      severity: 'CRITICAL',
      title: 'Critical Stockout Alert: Cooking Oil',
      message: 'Cooking oil will run out in ~2 days. Kumar Distributors has stock ready. Reorder recommendation prepared.',
      read: false,
      linkTab: 'inventory',
    },
    {
      businessId: business._id,
      type: 'PAYMENT_ALERT',
      severity: 'WARNING',
      title: 'Payment Mismatch Detected',
      message: 'ABC Wholesale invoice has a ₹2,000 discrepancy between invoice value and recorded payment.',
      read: false,
      linkTab: 'payments',
    },
    {
      businessId: business._id,
      type: 'COMPLIANCE_ALERT',
      severity: 'INFO',
      title: 'GSTR-3B Due in 5 Days',
      message: 'Monthly GSTR-3B deadline is in 5 days. Draft reconciliation is prepared for your review.',
      read: false,
      linkTab: 'compliance',
    },
  ]);

  // 10. Create Initial Audit Logs
  await AuditLog.create([
    {
      businessId: business._id,
      userId: user._id,
      agentName: 'InventoryAgent',
      actionType: 'STOCK_VELOCITY_CALCULATION',
      resourceType: 'Inventory',
      riskLevel: 'LOW',
      inputData: { checkAllItems: true },
      outputData: { flaggedLowStockCount: 3, criticalStock: 'Sunflower Cooking Oil (1L Pouch)' },
      status: 'SUCCESS',
      timestamp: new Date(Date.now() - 35 * 60000),
    },
    {
      businessId: business._id,
      userId: user._id,
      agentName: 'PaymentAgent',
      actionType: 'INVOICE_RECONCILIATION',
      resourceType: 'Payment',
      riskLevel: 'LOW',
      inputData: { totalInvoicesChecked: 6 },
      outputData: { matched: 3, partial: 1, unmatched: 2, flaggedDiscrepancyAmount: 2000 },
      status: 'SUCCESS',
      timestamp: new Date(Date.now() - 25 * 60000),
    },
  ]);

  // 11. Create Default Conversation for WhatsApp Simulator
  const conversation = await Conversation.create({
    businessId: business._id,
    channel: 'WHATSAPP',
    participantPhone: '+91 98221 55667',
    lastMessageAt: new Date(),
    status: 'ACTIVE',
  });

  await Message.create({
    conversationId: conversation._id,
    businessId: business._id,
    sender: 'AGENT',
    agentName: 'VyaparAI Orchestrator',
    messageType: 'TEXT',
    content:
      'Namaste Ramesh ji! 🙏 I am your VyaparAI Back Office assistant. I am continuously monitoring your stock, supplier payments, GST tasks, and expenses.\n\nYou can ask me things like:\n• "How is my business doing?"\n• "Check my inventory"\n• "Check supplier payments"\n• "What compliance tasks are pending?"\n• "Find schemes for my business"',
  });

  // 17. Seed Staff for Shree General Store
  await Staff.create([
    {
      businessId: business._id,
      name: 'Raju Kumar',
      phone: '+91 98221 11001',
      role: 'Store Helper',
      monthlySalary: 12000,
      advanceSalaryTaken: 2000,
      presentDaysThisMonth: 24,
      totalWorkingDays: 30,
      joiningDate: new Date('2024-01-15'),
      active: true,
    },
    {
      businessId: business._id,
      name: 'Anil Shinde',
      phone: '+91 98221 11002',
      role: 'Delivery Associate',
      monthlySalary: 14000,
      advanceSalaryTaken: 0,
      presentDaysThisMonth: 26,
      totalWorkingDays: 30,
      joiningDate: new Date('2023-06-10'),
      active: true,
    },
  ]);

  // ==========================================
  // 18. Seed Business 2: "Sharma Auto Spares" (Nagpur)
  // Demonstrates strict multi-tenant isolation!
  // ==========================================
  const business2 = await Business.create({
    name: 'Sharma Auto Spares',
    businessType: 'Automobile Spare Parts & Wholesale',
    gstin: '27AABCS9988D1Z2',
    pan: 'AABCS9988D',
    address: 'Shop 4, Gandhi Grain Market Road, Central Avenue',
    city: 'Nagpur',
    state: 'Maharashtra',
    pincode: '440002',
    phone: '+91 97654 33221',
    email: 'rahul@sharmaauto.com',
    annualTurnover: 7200000,
    employeeCount: 5,
    settings: {
      autoApproveLowRisk: true,
      stockoutRiskThresholdDays: 5,
      gstAlertDaysPrior: 7,
      overduePaymentGraceDays: 3,
      whatsappNotificationsEnabled: true,
    },
  });

  await User.create({
    businessId: business2._id,
    name: 'Rahul Sharma',
    email: 'rahul@sharmaauto.com',
    passwordHash,
    phone: '+91 97654 33221',
    role: 'OWNER',
    isDemoUser: false,
  });

  const boschSupplier = await Supplier.create({
    businessId: business2._id,
    name: 'Bosch Authorized Dealer',
    contactPerson: 'Vikas Deshmukh',
    phone: '+91 98230 99887',
    email: 'orders@bosch-nagpur.com',
    gstin: '27AABCB1234F1Z9',
    address: 'MIDC Hingna Industrial Area, Nagpur',
    productsSupplied: ['Brake Pads', 'Spark Plugs', 'Oil Filters'],
    paymentTermsDays: 30,
    outstandingBalance: 48500,
    avgDeliveryLeadDays: 2,
    upiId: 'boschnagpur@icici',
  });

  const castrolSupplier = await Supplier.create({
    businessId: business2._id,
    name: 'Western Lubricants Dist.',
    contactPerson: 'Pradeep Joshi',
    phone: '+91 98231 44556',
    email: 'contact@westernlube.in',
    gstin: '27AABCW5678G1Z4',
    address: 'Wanjra Layout, Kamptee Road, Nagpur',
    productsSupplied: ['Engine Oil 20W40', 'Gear Oil', 'Coolant'],
    paymentTermsDays: 15,
    outstandingBalance: 22000,
    avgDeliveryLeadDays: 1,
    upiId: 'westernlube@hdfcbank',
  });

  const prodEngineOil = await Product.create({
    businessId: business2._id,
    name: 'Engine Oil 20W40 (4L Can)',
    category: 'Lubricants',
    sku: 'LUB-ENG-20W40-4L',
    hsnCode: '2710',
    unit: 'can',
    basePurchasePrice: 1250,
    sellingPrice: 1650,
    taxRatePercent: 18,
  });

  const prodBrakePads = await Product.create({
    businessId: business2._id,
    name: 'Ceramic Front Brake Pads',
    category: 'Braking Systems',
    sku: 'BRK-CER-PAD-F',
    hsnCode: '8708',
    unit: 'box',
    basePurchasePrice: 850,
    sellingPrice: 1200,
    taxRatePercent: 18,
  });

  await Inventory.create([
    {
      businessId: business2._id,
      productId: prodEngineOil._id,
      currentStock: 4,
      safetyStockThreshold: 10,
      recommendedReorderQuantity: 15,
      avgDailySales: 2.5,
      stockVelocity: 2.5,
      estimatedDaysLeft: 1.6,
      stockStatus: 'CRITICAL',
      preferredSupplierId: castrolSupplier._id,
    },
    {
      businessId: business2._id,
      productId: prodBrakePads._id,
      currentStock: 18,
      safetyStockThreshold: 15,
      recommendedReorderQuantity: 20,
      avgDailySales: 1.5,
      stockVelocity: 1.5,
      estimatedDaysLeft: 12,
      stockStatus: 'HEALTHY',
      preferredSupplierId: boschSupplier._id,
    },
  ]);

  await ComplianceTask.create({
    businessId: business2._id,
    title: 'GSTR-1 Quarterly Return',
    category: 'GST',
    formType: 'GSTR-1',
    period: 'Q2 2026',
    dueDate: new Date(Date.now() + 12 * 86400000),
    status: 'UPCOMING',
    requiredDocuments: ['B2B Invoices', 'HSN Summary'],
    missingDocuments: [],
    preparedData: {
      totalTurnover: 1840000,
      taxableValue: 1560000,
      cgstAmount: 140400,
      sgstAmount: 140400,
      igstAmount: 42000,
      itcEligible: 98000,
      invoicesCount: 68,
      flaggedInvoicesCount: 0,
      summaryNotes: 'Auto-prepared from sales ledger.',
    },
    filingDisclaimer: 'DEMO / ASSISTANCE ONLY: AI prepares and reconciles data.',
    approvedByOwner: false,
  });

  const conv2 = await Conversation.create({
    businessId: business2._id,
    channel: 'WHATSAPP',
    participantPhone: '+91 97654 33221',
    lastMessageAt: new Date(),
    status: 'ACTIVE',
  });

  await Message.create({
    conversationId: conv2._id,
    businessId: business2._id,
    sender: 'AGENT',
    agentName: 'VyaparAI Orchestrator',
    messageType: 'TEXT',
    content:
      'Namaste Rahul ji! 🚗 I am monitoring inventory and supplier dues for Sharma Auto Spares, Nagpur. Engine Oil 20W40 has only ~1.5 days remaining (4 cans left). Let me know if you would like me to prepare a purchase order with Western Lubricants.',
  });

  // Seed Staff for Sharma Auto Spares
  await Staff.create([
    {
      businessId: business2._id,
      name: 'Santosh Yadav',
      phone: '+91 97654 44001',
      role: 'Mechanic & Parts Packer',
      monthlySalary: 16000,
      advanceSalaryTaken: 3000,
      presentDaysThisMonth: 25,
      totalWorkingDays: 30,
      joiningDate: new Date('2022-03-01'),
      active: true,
    },
    {
      businessId: business2._id,
      name: 'Ganesh Patil',
      phone: '+91 97654 44002',
      role: 'Delivery Driver',
      monthlySalary: 15000,
      advanceSalaryTaken: 1000,
      presentDaysThisMonth: 27,
      totalWorkingDays: 30,
      joiningDate: new Date('2023-09-15'),
      active: true,
    },
  ]);

  console.log('✅ Demo database successfully seeded for Shree General Store & Sharma Auto Spares!');
}

// Standalone execution runner
if (require.main === module) {
  const { connectDB, disconnectDB } = require('../config/db');
  connectDB()
    .then(() => seedDatabase(true))
    .then(() => disconnectDB())
    .then(() => process.exit(0))
    .catch((err: any) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
