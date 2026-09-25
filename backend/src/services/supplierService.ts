export interface ISupplierOrderRequest {
  supplierId: string;
  orderNumber: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  totalAmount: number;
  deliveryNotes?: string;
}

export interface ISupplierOrderResponse {
  success: boolean;
  orderReference: string;
  acknowledgedAt: Date;
  estimatedDeliveryDate: Date;
  status: 'CONFIRMED' | 'BACKORDERED' | 'REJECTED';
  supplierNotes: string;
}

export interface ISupplierService {
  placePurchaseOrder(request: ISupplierOrderRequest): Promise<ISupplierOrderResponse>;
  checkStockAvailability(supplierId: string, productName: string, quantity: number): Promise<boolean>;
}

export class MockSupplierService implements ISupplierService {
  async placePurchaseOrder(request: ISupplierOrderRequest): Promise<ISupplierOrderResponse> {
    // Simulate real supplier order placement
    const estDelivery = new Date(Date.now() + 2 * 86400000); // 2 days lead time
    return {
      success: true,
      orderReference: `SUP-ACK-${Date.now().toString().slice(-6)}`,
      acknowledgedAt: new Date(),
      estimatedDeliveryDate: estDelivery,
      status: 'CONFIRMED',
      supplierNotes: `Order of ${request.items.length} items (Total: ₹${request.totalAmount.toLocaleString('en-IN')}) received and queued for dispatch.`,
    };
  }

  async checkStockAvailability(supplierId: string, productName: string, quantity: number): Promise<boolean> {
    return true; // Supplier has wholesale inventory available
  }
}

export const supplierService: ISupplierService = new MockSupplierService();
