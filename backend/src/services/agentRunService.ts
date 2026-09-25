import { AgentRun, IAgentStep } from '../models';

export class AgentRunService {
  static async startRun(params: {
    businessId: string;
    orchestratorIntent: string;
    triggerSource?: 'USER_CHAT' | 'WHATSAPP' | 'SCHEDULED_BACKGROUND_WORKER' | 'SYSTEM_EVENT';
    userQuery?: string;
  }) {
    return await AgentRun.create({
      businessId: params.businessId as any,
      orchestratorIntent: params.orchestratorIntent,
      triggerSource: params.triggerSource || 'USER_CHAT',
      status: 'STARTED',
      userQuery: params.userQuery,
      steps: [],
    });
  }

  static async addStep(runId: string, step: Omit<IAgentStep, 'stepNumber' | 'timestamp'>) {
    try {
      const run = await AgentRun.findById(runId);
      if (!run) return;

      const stepNumber = run.steps.length + 1;
      run.steps.push({
        ...step,
        stepNumber,
        timestamp: new Date(),
      });
      run.status = 'IN_PROGRESS';
      await run.save();
    } catch (err) {
      console.error('Failed to append step to agent run:', err);
    }
  }

  static async completeRun(runId: string, summaryResult: string, approvalId?: string) {
    try {
      const run = await AgentRun.findById(runId);
      if (!run) return;

      run.status = approvalId ? 'WAITING_APPROVAL' : 'COMPLETED';
      run.summaryResult = summaryResult;
      if (approvalId) {
        run.approvalId = approvalId as any;
      }
      run.durationMs = Date.now() - new Date(run.createdAt).getTime();
      await run.save();
    } catch (err) {
      console.error('Failed to complete agent run:', err);
    }
  }

  static async failRun(runId: string, error: string) {
    try {
      const run = await AgentRun.findById(runId);
      if (!run) return;

      run.status = 'FAILED';
      run.summaryResult = `Error: ${error}`;
      run.durationMs = Date.now() - new Date(run.createdAt).getTime();
      await run.save();
    } catch (err) {
      console.error('Failed to mark run as failed:', err);
    }
  }
}
