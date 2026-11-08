const API_BASE = ((import.meta as any).env?.VITE_API_URL || '').replace(/\/$/, '') + '/api';

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('vyapar_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Dashboard
  getDashboard: () => apiRequest<any>('/dashboard'),

  // Inventory
  getInventory: (status?: string) => apiRequest<any[]>(`/inventory${status ? `?status=${status}` : ''}`),
  getPurchaseOrders: () => apiRequest<any[]>('/inventory/purchase-orders'),
  reorderProduct: (data: { productId: string; quantity: number; unitPrice: number; reason: string }) =>
    apiRequest<any>('/inventory/reorder', { method: 'POST', body: JSON.stringify(data) }),

  // Suppliers
  getSuppliers: () => apiRequest<any[]>('/suppliers'),

  // Payments & Reconciliation
  getReconciliation: () => apiRequest<any>('/payments/reconciliation'),
  getInvoices: () => apiRequest<any[]>('/payments/invoices'),
  reconcileInvoice: (invoiceId: string, resolutionNote?: string) =>
    apiRequest<any>('/payments/reconcile', { method: 'POST', body: JSON.stringify({ invoiceId, resolutionNote }) }),
  disbursePayment: (data: { invoiceId: string; amount?: number; paymentMode?: string }) =>
    apiRequest<any>('/payments/pay', { method: 'POST', body: JSON.stringify(data) }),
  createPaymentLink: (invoiceId: string) =>
    apiRequest<any>('/payments/link', { method: 'POST', body: JSON.stringify({ invoiceId }) }),

  // Compliance
  getCompliance: () => apiRequest<any[]>('/compliance'),
  prepareComplianceDraft: (id: string) => apiRequest<any>(`/compliance/${id}/prepare`, { method: 'POST' }),
  authorizeCompliance: (id: string) => apiRequest<any>(`/compliance/${id}/authorize`, { method: 'POST' }),

  // Schemes
  getSchemes: () => apiRequest<any[]>('/schemes'),
  generateSchemeDraft: (id: string) => apiRequest<any>(`/schemes/${id}/draft`, { method: 'POST' }),

  // Approvals
  getApprovals: (status?: string) => apiRequest<any[]>(`/approvals${status ? `?status=${status}` : ''}`),
  approveAction: (id: string) => apiRequest<any>(`/approvals/${id}/approve`, { method: 'POST' }),
  rejectAction: (id: string) => apiRequest<any>(`/approvals/${id}/reject`, { method: 'POST' }),

  // Agent Observability & Audit
  getAgentActivity: () => apiRequest<any[]>('/agents/activity'),
  getAuditLogs: () => apiRequest<any[]>('/agents/audit-logs'),

  // Chat & WhatsApp
  getChatMessages: (channel: string = 'WHATSAPP') => apiRequest<{ conversation: any; messages: any[] }>(`/chat/messages?channel=${channel}`),
  sendChatMessage: (text: string, channel: string = 'WHATSAPP') =>
    apiRequest<any>('/chat', { method: 'POST', body: JSON.stringify({ text, channel }) }),

  // Settings & Multi-tenant Switching
  getSettings: () => apiRequest<any>('/settings'),
  updateSettings: (data: any) => apiRequest<any>('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetDemoData: () => apiRequest<any>('/settings/reset-demo', { method: 'POST' }),

  // Multi-tenant Enterprises
  listBusinesses: () => apiRequest<any[]>('/auth/businesses'),
  switchBusiness: (businessId: string) =>
    apiRequest<any>('/auth/switch-business', { method: 'POST', body: JSON.stringify({ businessId }) }),

  // Staff & Payroll
  getStaff: () => apiRequest<any>('/staff'),
  recordStaffAdvance: (name: string, amount: number, note?: string) =>
    apiRequest<any>('/staff/advance', { method: 'POST', body: JSON.stringify({ name, amount, note }) }),
  createStaff: (data: { name: string; phone?: string; role?: string; monthlySalary: number }) =>
    apiRequest<any>('/staff', { method: 'POST', body: JSON.stringify(data) }),
  disburseStaffSalary: (staffId: string) =>
    apiRequest<any>(`/staff/${staffId}/disburse`, { method: 'POST' }),
};
