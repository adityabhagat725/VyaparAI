export interface IPaymentDisbursementRequest {
  businessId: string;
  supplierId: string;
  invoiceId?: string;
  amount: number;
  paymentMode: 'UPI' | 'NEFT' | 'RTGS';
  beneficiaryUpiId?: string;
  beneficiaryBankDetails?: {
    accountNumber: string;
    ifsc: string;
  };
  narration: string;
}

export interface IPaymentDisbursementResponse {
  success: boolean;
  transactionReference: string;
  disbursedAmount: number;
  feeAmount: number;
  status: 'INITIATED' | 'COMPLETED' | 'FAILED';
  gatewayMessage: string;
}

export interface IPaymentService {
  disbursePayment(request: IPaymentDisbursementRequest): Promise<IPaymentDisbursementResponse>;
  verifyTransaction(referenceNumber: string): Promise<boolean>;
}

export class MockPaymentService implements IPaymentService {
  async disbursePayment(request: IPaymentDisbursementRequest): Promise<IPaymentDisbursementResponse> {
    const txnRef = `TXN-UPI-${Date.now().toString().slice(-8)}`;
    return {
      success: true,
      transactionReference: txnRef,
      disbursedAmount: request.amount,
      feeAmount: 0,
      status: 'COMPLETED',
      gatewayMessage: `Successfully transferred ₹${request.amount.toLocaleString('en-IN')} to supplier via ${request.paymentMode}.`,
    };
  }

  async verifyTransaction(referenceNumber: string): Promise<boolean> {
    return true;
  }
}

export const paymentService: IPaymentService = new MockPaymentService();
