import { AuditLog } from '../models';

export interface IAuditEntry {
  businessId: string;
  userId?: string;
  agentName: string;
  actionType: string;
  resourceType: string;
  resourceId?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  inputData?: Record<string, any>;
  outputData?: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE' | 'APPROVAL_REQUIRED' | 'PENDING';
  errorMessage?: string;
}

export class AuditService {
  static async log(entry: IAuditEntry) {
    try {
      return await AuditLog.create({
        ...entry,
        businessId: entry.businessId as any,
        userId: entry.userId as any,
        resourceId: entry.resourceId as any,
        timestamp: new Date(),
      });
    } catch (err) {
      console.error('Audit logging error:', err);
      return null;
    }
  }
}
