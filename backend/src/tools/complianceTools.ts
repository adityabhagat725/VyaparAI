import { ComplianceTask } from '../models';
import { AuditService } from '../services/auditService';

export interface ComplianceSummaryDTO {
  taskId: string;
  title: string;
  category: string;
  formType: string;
  period: string;
  dueDate: Date;
  daysRemaining: number;
  status: string;
  requiredDocuments: string[];
  missingDocuments: string[];
  preparedData: any;
  filingDisclaimer: string;
  approvedByOwner: boolean;
}

export class ComplianceTools {
  static async getUpcomingDeadlines(businessId: string): Promise<ComplianceSummaryDTO[]> {
    const tasks = await ComplianceTask.find({ businessId }).sort({ dueDate: 1 });
    const now = new Date();

    const dtos: ComplianceSummaryDTO[] = tasks.map((t) => {
      const diffTime = new Date(t.dueDate).getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      return {
        taskId: t._id.toString(),
        title: t.title,
        category: t.category,
        formType: t.formType,
        period: t.period,
        dueDate: t.dueDate,
        daysRemaining,
        status: t.status,
        requiredDocuments: t.requiredDocuments,
        missingDocuments: t.missingDocuments,
        preparedData: t.preparedData,
        filingDisclaimer: t.filingDisclaimer,
        approvedByOwner: t.approvedByOwner,
      };
    });

    await AuditService.log({
      businessId,
      agentName: 'ComplianceAgent',
      actionType: 'GET_COMPLIANCE_DEADLINES',
      resourceType: 'ComplianceTask',
      riskLevel: 'LOW',
      outputData: { upcomingCount: dtos.length },
      status: 'SUCCESS',
    });

    return dtos;
  }

  static async prepareComplianceDraft(taskId: string): Promise<any> {
    const task = await ComplianceTask.findById(taskId);
    if (!task) throw new Error('Compliance task not found');

    task.status = 'PENDING_REVIEW';
    task.preparedData.summaryNotes = `Reconciliation completed by ComplianceAgent on ${new Date().toLocaleDateString('en-IN')}. Ready for business owner review.`;
    await task.save();

    await AuditService.log({
      businessId: task.businessId.toString(),
      agentName: 'ComplianceAgent',
      actionType: 'PREPARE_COMPLIANCE_DRAFT',
      resourceType: 'ComplianceTask',
      resourceId: task._id.toString(),
      riskLevel: 'LOW',
      outputData: { taskId, formType: task.formType },
      status: 'SUCCESS',
    });

    return task;
  }
}
