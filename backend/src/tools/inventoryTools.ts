import { Inventory, Product, Supplier, PurchaseOrder, Approval, IProduct, IInventory } from '../models';
import { AuditService } from '../services/auditService';
import { supplierService } from '../services/supplierService';

export interface InventoryItemDTO {
  productId: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  safetyStockThreshold: number;
  avgDailySales: number;
  estimatedDaysLeft: number;
  stockStatus: 'HEALTHY' | 'LOW' | 'CRITICAL';
  preferredSupplier?: {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    leadDays: number;
  };
  basePurchasePrice: number;
}

export class InventoryTools {
  static async getInventory(businessId: string, filterStatus?: string): Promise<InventoryItemDTO[]> {
    const query: any = { businessId };
    if (filterStatus && filterStatus !== 'ALL') {
      query.stockStatus = filterStatus;
    }

    const items = await Inventory.find(query).populate('productId').populate('preferredSupplierId');
    return items.map((item: any) => {
      const prod = item.productId as any;
      const supp = item.preferredSupplierId as any;
      return {
        productId: prod?._id?.toString() || item.productId.toString(),
        name: prod?.name || 'Unknown Product',
        category: prod?.category || 'General',
        unit: prod?.unit || 'unit',
        currentStock: item.currentStock,
        safetyStockThreshold: item.safetyStockThreshold,
        avgDailySales: item.avgDailySales,
        estimatedDaysLeft: item.estimatedDaysLeft,
        stockStatus: item.stockStatus,
        basePurchasePrice: prod?.basePurchasePrice || 0,
        preferredSupplier: supp
          ? {
              id: supp._id.toString(),
              name: supp.name,
              contactPerson: supp.contactPerson,
              phone: supp.phone,
              leadDays: supp.avgDeliveryLeadDays || 2,
            }
          : undefined,
      };
    });
  }

  static async findProductByName(businessId: string, nameQuery: string): Promise<InventoryItemDTO | null> {
    const regex = new RegExp(nameQuery.trim(), 'i');
    const product = await Product.findOne({ businessId, name: regex });
    if (!product) return null;

    const inventory = await Inventory.findOne({ businessId, productId: product._id }).populate('preferredSupplierId');
    if (!inventory) return null;

    const supp = inventory.preferredSupplierId as any;
    return {
      productId: product._id.toString(),
      name: product.name,
      category: product.category,
      unit: product.unit,
      currentStock: inventory.currentStock,
      safetyStockThreshold: inventory.safetyStockThreshold,
      avgDailySales: inventory.avgDailySales,
      estimatedDaysLeft: inventory.estimatedDaysLeft,
      stockStatus: inventory.stockStatus,
      basePurchasePrice: product.basePurchasePrice,
      preferredSupplier: supp
        ? {
            id: supp._id.toString(),
            name: supp.name,
            contactPerson: supp.contactPerson,
            phone: supp.phone,
            leadDays: supp.avgDeliveryLeadDays || 2,
          }
        : undefined,
    };
  }

  static async calculateStockVelocity(inventoryId: string): Promise<{ avgDailySales: number; daysLeft: number; status: 'HEALTHY' | 'LOW' | 'CRITICAL' }> {
    const inv = await Inventory.findById(inventoryId);
    if (!inv) throw new Error('Inventory record not found');

    const daysLeft = inv.avgDailySales > 0 ? Math.round(inv.currentStock / inv.avgDailySales) : 999;
    let status: 'HEALTHY' | 'LOW' | 'CRITICAL' = 'HEALTHY';
    if (daysLeft <= 2 || inv.currentStock <= inv.safetyStockThreshold / 2) {
      status = 'CRITICAL';
    } else if (daysLeft <= 4 || inv.currentStock <= inv.safetyStockThreshold) {
      status = 'LOW';
    }

    inv.estimatedDaysLeft = daysLeft;
    inv.stockStatus = status;
    await inv.save();

    return { avgDailySales: inv.avgDailySales, daysLeft, status };
  }

  static async createDraftPurchaseOrder(params: {
    businessId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    reason: string;
  }) {
    const product = await Product.findById(params.productId);
    if (!product) throw new Error('Product not found');

    const inventory = await Inventory.findOne({ businessId: params.businessId, productId: params.productId }).populate('preferredSupplierId');
    const supplier = (inventory?.preferredSupplierId as any) || (await Supplier.findOne({ businessId: params.businessId }));

    if (!supplier) throw new Error('No supplier configured for this product');

    const totalAmount = params.quantity * params.unitPrice;
    const orderNumber = `PO-${Date.now().toString().slice(-6)}`;

    // Create Draft Purchase Order
    const po = await PurchaseOrder.create({
      businessId: params.businessId as any,
      supplierId: supplier._id,
      orderNumber,
      items: [
        {
          productId: product._id,
          productName: product.name,
          quantity: params.quantity,
          unit: product.unit,
          unitPrice: params.unitPrice,
          totalPrice: totalAmount,
        },
      ],
      totalAmount,
      status: 'PENDING_APPROVAL',
      triggerReason: params.reason,
    });

    // Create Approval record (Medium Risk action)
    const approval = await Approval.create({
      businessId: params.businessId as any,
      agentName: 'InventoryAgent',
      actionType: 'CREATE_PURCHASE_ORDER',
      riskLevel: 'MEDIUM',
      title: `Purchase Order for ${product.name}`,
      reason: params.reason,
      amount: totalAmount,
      proposedAction: `Place purchase order #${orderNumber} for ${params.quantity} ${product.unit} of ${product.name} with ${supplier.name} at ₹${totalAmount.toLocaleString('en-IN')}.`,
      dataPayload: {
        purchaseOrderId: po._id.toString(),
        orderNumber,
        productId: product._id.toString(),
        productName: product.name,
        quantity: params.quantity,
        unit: product.unit,
        unitPrice: params.unitPrice,
        totalAmount,
        supplierId: supplier._id.toString(),
        supplierName: supplier.name,
      },
      status: 'PENDING',
    });

    po.approvalId = approval._id as any;
    await po.save();

    await AuditService.log({
      businessId: params.businessId,
      agentName: 'InventoryAgent',
      actionType: 'CREATE_PURCHASE_ORDER_DRAFT',
      resourceType: 'PurchaseOrder',
      resourceId: po._id.toString(),
      riskLevel: 'MEDIUM',
      inputData: params,
      outputData: { purchaseOrderId: po._id.toString(), approvalId: approval._id.toString(), orderNumber },
      status: 'APPROVAL_REQUIRED',
    });

    return { po, approval, supplier, product };
  }

  static async executePurchaseOrder(purchaseOrderId: string): Promise<any> {
    const po = await PurchaseOrder.findById(purchaseOrderId).populate('supplierId');
    if (!po) throw new Error('Purchase order not found');

    const supplier = po.supplierId as any;

    // Call external supplier service (Mock / Real)
    const result = await supplierService.placePurchaseOrder({
      supplierId: supplier._id.toString(),
      orderNumber: po.orderNumber,
      items: po.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      totalAmount: po.totalAmount,
    });

    po.status = 'EXECUTED_SIMULATED';
    po.executionResponse = result.supplierNotes;
    po.deliveryExpectedDate = result.estimatedDeliveryDate;
    await po.save();

    // Increment inventory (or mark incoming order)
    for (const item of po.items) {
      const inv = await Inventory.findOne({ businessId: po.businessId, productId: item.productId });
      if (inv) {
        inv.currentStock += item.quantity;
        inv.stockStatus = 'HEALTHY';
        inv.estimatedDaysLeft = Math.round(inv.currentStock / (inv.avgDailySales || 1));
        await inv.save();
      }
    }

    await AuditService.log({
      businessId: po.businessId.toString(),
      agentName: 'InventoryAgent',
      actionType: 'EXECUTE_PURCHASE_ORDER',
      resourceType: 'PurchaseOrder',
      resourceId: po._id.toString(),
      riskLevel: 'MEDIUM',
      outputData: { result, updatedStock: true },
      status: 'SUCCESS',
    });

    return { po, result };
  }
}
