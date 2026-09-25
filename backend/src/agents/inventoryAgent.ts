import { InventoryTools } from '../tools/inventoryTools';
import { AgentRunService } from '../services/agentRunService';
import { whatsappService } from '../services/whatsappService';

export interface AgentResponse {
  agentName: string;
  text: string;
  actionRequired?: boolean;
  approvalId?: string;
  data?: any;
  buttons?: Array<{ label: string; payload: string; style?: 'primary' | 'danger' | 'secondary' }>;
}

export class InventoryAgent {
  static async handle(params: {
    businessId: string;
    query: string;
    runId: string;
    phoneNumber?: string;
  }): Promise<AgentResponse> {
    const { businessId, query, runId, phoneNumber } = params;
    const lower = query.toLowerCase();

    // Check if user specifically requested to order an item (e.g. "Order the rice", "Buy more cooking oil", "Order 50kg rice", "Handle the low stock")
    if (lower.includes('order') || lower.includes('buy') || lower.includes('reorder') || lower.includes('handle')) {
      const startTime = Date.now();
      await AgentRunService.addStep(runId, {
        agentName: 'InventoryAgent',
        action: 'OBSERVE: Target product identification',
        reasoning: 'User asked to prepare procurement for inventory.',
        durationMs: Date.now() - startTime,
      });

      // Target specific item or pick the most critical low stock item
      let targetProduct = null;
      if (lower.includes('oil')) {
        targetProduct = await InventoryTools.findProductByName(businessId, 'Cooking Oil');
      } else if (lower.includes('rice')) {
        targetProduct = await InventoryTools.findProductByName(businessId, 'Rice');
      } else if (lower.includes('sugar')) {
        targetProduct = await InventoryTools.findProductByName(businessId, 'Sugar');
      } else {
        // Find most critical item
        const inventory = await InventoryTools.getInventory(businessId, 'CRITICAL');
        if (inventory.length > 0) {
          targetProduct = inventory[0];
        } else {
          const lowItems = await InventoryTools.getInventory(businessId, 'LOW');
          if (lowItems.length > 0) targetProduct = lowItems[0];
        }
      }

      if (!targetProduct) {
        return {
          agentName: 'InventoryAgent',
          text: 'All product inventory levels are currently healthy! No reorder is needed at this time.',
        };
      }

      // Step 2: Forecast & Supplier identification
      const s2Start = Date.now();
      await AgentRunService.addStep(runId, {
        agentName: 'InventoryAgent',
        action: 'PLAN & TOOL: calculateReorderQuantity & getPreferredSupplier',
        toolCalled: 'createDraftPurchaseOrder',
        toolInput: {
          productName: targetProduct.name,
          currentStock: targetProduct.currentStock,
          daysLeft: targetProduct.estimatedDaysLeft,
          preferredSupplier: targetProduct.preferredSupplier?.name,
        },
        durationMs: Date.now() - s2Start,
      });

      const reorderQty = targetProduct.safetyStockThreshold > 0 ? targetProduct.safetyStockThreshold * 2 : 50;
      const unitPrice = targetProduct.basePurchasePrice;
      const totalAmount = reorderQty * unitPrice;

      // Create draft PO and approval
      const { po, approval, supplier } = await InventoryTools.createDraftPurchaseOrder({
        businessId,
        productId: targetProduct.productId,
        quantity: reorderQty,
        unitPrice,
        reason: `${targetProduct.name} has only ${targetProduct.estimatedDaysLeft} days of stock remaining (${targetProduct.currentStock} ${targetProduct.unit} left).`,
      });

      const messageText = `⚠️ *${targetProduct.name}* may run out in approximately *${targetProduct.estimatedDaysLeft} days* (${targetProduct.currentStock} ${targetProduct.unit} remaining).\n\nYour preferred supplier *${supplier.name}* can provide ${reorderQty} ${targetProduct.unit} for *₹${totalAmount.toLocaleString('en-IN')}* (Delivery in ${supplier.avgDeliveryLeadDays || 2} days).\n\nPurchase order #${po.orderNumber} prepared.\n\nApprove order?`;

      if (phoneNumber) {
        await whatsappService.sendApprovalPrompt({
          toPhone: phoneNumber,
          businessId,
          text: messageText,
          approvalId: approval._id.toString(),
          agentName: 'InventoryAgent',
        });
      }

      await AgentRunService.completeRun(runId, `Purchase order #${po.orderNumber} prepared and awaiting owner approval.`, approval._id.toString());

      return {
        agentName: 'InventoryAgent',
        text: messageText,
        actionRequired: true,
        approvalId: approval._id.toString(),
        data: { po, approval, supplier, targetProduct },
        buttons: [
          { label: '✅ Approve ₹' + totalAmount.toLocaleString('en-IN'), payload: `APPROVE:${approval._id}`, style: 'primary' },
          { label: '❌ Reject', payload: `REJECT:${approval._id}`, style: 'danger' },
        ],
      };
    }

    // Check stock / Inventory query (e.g. "How much rice do I have?", "Check my inventory", "How much stock is low?")
    const startTime = Date.now();
    await AgentRunService.addStep(runId, {
      agentName: 'InventoryAgent',
      action: 'TOOL: getInventory',
      toolCalled: 'getInventory',
      durationMs: Date.now() - startTime,
    });

    // Check if query is about a specific item
    if (lower.includes('rice') || lower.includes('oil') || lower.includes('sugar') || lower.includes('tea') || lower.includes('atta')) {
      let queryItem = 'Rice';
      if (lower.includes('oil')) queryItem = 'Cooking Oil';
      else if (lower.includes('sugar')) queryItem = 'Sugar';
      else if (lower.includes('tea')) queryItem = 'Tea';
      else if (lower.includes('atta')) queryItem = 'Atta';

      const item = await InventoryTools.findProductByName(businessId, queryItem);
      if (item) {
        let msg = `You currently have *${item.currentStock} ${item.unit}* of ${item.name}. Based on your average daily sales of ${item.avgDailySales} ${item.unit}/day, the stock may last approximately *${item.estimatedDaysLeft} days*.`;
        if (item.stockStatus === 'CRITICAL' || item.stockStatus === 'LOW') {
          const suppName = item.preferredSupplier?.name || 'regular supplier';
          const recQty = item.safetyStockThreshold * 2;
          const recCost = recQty * item.basePurchasePrice;
          msg += `\n\n⚠️ Stock is low! Your regular supplier *${suppName}* can provide ${recQty} ${item.unit} for *₹${recCost.toLocaleString('en-IN')}*. Would you like me to prepare the purchase order?`;
          return {
            agentName: 'InventoryAgent',
            text: msg,
            buttons: [{ label: `📦 Prepare Order (${recQty} ${item.unit})`, payload: `ORDER:${item.productId}`, style: 'primary' }],
          };
        }
        return {
          agentName: 'InventoryAgent',
          text: msg,
        };
      }
    }

    // Broad inventory check
    const items = await InventoryTools.getInventory(businessId);
    const lowStockItems = items.filter((i) => i.stockStatus === 'LOW' || i.stockStatus === 'CRITICAL');

    let responseText = '';
    if (lowStockItems.length > 0) {
      responseText = `📦 *${lowStockItems.length} products* are below their reorder threshold:\n\n` +
        lowStockItems
          .map(
            (i) =>
              `• *${i.name}* — ${i.currentStock} ${i.unit} left (~${i.estimatedDaysLeft} days remaining) [${i.stockStatus}]`
          )
          .join('\n') +
        `\n\nWould you like me to prepare purchase orders for the critical items?`;

      return {
        agentName: 'InventoryAgent',
        text: responseText,
        buttons: [{ label: '⚡ Reorder Low Stock', payload: 'HANDLE_LOW_STOCK', style: 'primary' }],
      };
    } else {
      responseText = `✅ All ${items.length} products in your inventory are at healthy stock levels. No reorders needed right now!`;
      return {
        agentName: 'InventoryAgent',
        text: responseText,
      };
    }
  }
}
