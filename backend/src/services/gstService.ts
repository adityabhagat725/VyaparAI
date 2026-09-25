export interface IGSTFilingDraft {
  gstin: string;
  returnPeriod: string;
  formType: 'GSTR-1' | 'GSTR-3B';
  taxableSupplies: number;
  totalTax: number;
  eligibleITC: number;
  netTaxPayable: number;
  draftSummaryText: string;
}

export interface IGSTService {
  validateGSTIN(gstin: string): Promise<{ valid: boolean; tradeName?: string; status?: string }>;
  fetchPortalDeadlines(financialYear: string): Promise<Array<{ form: string; dueDate: string }>>;
  prepareReturnDraft(businessId: string, formType: 'GSTR-1' | 'GSTR-3B', period: string): Promise<IGSTFilingDraft>;
}

export class MockGSTService implements IGSTService {
  async validateGSTIN(gstin: string): Promise<{ valid: boolean; tradeName?: string; status?: string }> {
    const isValidFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);
    return {
      valid: isValidFormat,
      tradeName: 'Verified Taxpayer Enterprise',
      status: 'ACTIVE',
    };
  }

  async fetchPortalDeadlines(financialYear: string): Promise<Array<{ form: string; dueDate: string }>> {
    return [
      { form: 'GSTR-3B (August 2026)', dueDate: '2026-09-28' },
      { form: 'GSTR-1 (September 2026)', dueDate: '2026-10-11' },
      { form: 'CMP-08 (Q2 2026-27)', dueDate: '2026-10-18' },
    ];
  }

  async prepareReturnDraft(businessId: string, formType: 'GSTR-1' | 'GSTR-3B', period: string): Promise<IGSTFilingDraft> {
    return {
      gstin: '27AABCS1429B1Z1',
      returnPeriod: period,
      formType,
      taxableSupplies: 295000,
      totalTax: 17150,
      eligibleITC: 12850,
      netTaxPayable: 4300,
      draftSummaryText: `Draft ${formType} for ${period} generated from 42 matched purchase and sales registers. Net tax payable calculated at ₹4,300.`,
    };
  }
}

export const gstService: IGSTService = new MockGSTService();
