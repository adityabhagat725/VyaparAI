import { SchemeTools } from '../tools/schemeTools';
import { AgentRunService } from '../services/agentRunService';
import { AgentResponse } from './inventoryAgent';

export class GovernmentSchemeAgent {
  static async handle(params: {
    businessId: string;
    query: string;
    runId: string;
    phoneNumber?: string;
  }): Promise<AgentResponse> {
    const { businessId, runId } = params;

    const startTime = Date.now();
    await AgentRunService.addStep(runId, {
      agentName: 'GovernmentSchemeAgent',
      action: 'TOOL: searchAndMatchSchemes',
      toolCalled: 'searchAndMatchSchemes',
      reasoning: 'Matching enterprise profile (turnover, sector, registration) against MSME credit, subsidy, and modernization schemes.',
      durationMs: Date.now() - startTime,
    });

    const schemes = await SchemeTools.searchAndMatchSchemes(businessId);
    const topSchemes = schemes.slice(0, 3);

    let messageText = `🏛️ *Government Scheme Matching for Your Business:*\n\n` +
      `I found *${topSchemes.length} potentially relevant schemes* based on your business profile:\n\n`;

    topSchemes.forEach((s, idx) => {
      messageText += `${idx + 1}. *${s.name}*\n` +
        `   • *AI Relevance Match:* ${s.matchScore}%\n` +
        `   • *Potential Benefit:* ${s.benefitSummary}\n` +
        `   • *Max Benefit:* ${s.maxBenefitAmount}\n` +
        `   • *Why you qualify:* ${s.matchReason}\n` +
        `   • *Key Documents:* ${s.requiredDocuments.slice(0, 3).join(', ')}\n\n`;
    });

    messageText += `_Note: Relevance matches are AI indicators based on published guidelines. DEMO DATA — replace with verified government data before production._`;

    await AgentRunService.completeRun(runId, `Found ${topSchemes.length} matched schemes. Top: ${topSchemes[0]?.name} (${topSchemes[0]?.matchScore}%)`);

    return {
      agentName: 'GovernmentSchemeAgent',
      text: messageText,
      data: { schemes: topSchemes },
      buttons: [
        { label: `📝 Prepare ${topSchemes[0]?.code} Application`, payload: `DRAFT_SCHEME:${topSchemes[0]?.schemeId}`, style: 'primary' },
        { label: '📋 View All Schemes', payload: 'VIEW_SCHEMES', style: 'secondary' },
      ],
    };
  }
}
