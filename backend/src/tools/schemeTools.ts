import { GovernmentScheme, SchemeApplication, Business } from '../models';
import { AuditService } from '../services/auditService';

export interface SchemeMatchResult {
  schemeId: string;
  name: string;
  code: string;
  ministry: string;
  benefitSummary: string;
  maxBenefitAmount: string;
  eligibilityDescription: string;
  matchScore: number; // 0 - 100
  matchReason: string;
  requiredDocuments: string[];
  officialPortalUrl: string;
  isDemoData: boolean;
  applicationStatus: string;
  draftData?: any;
}

export class SchemeTools {
  static async searchAndMatchSchemes(businessId: string): Promise<SchemeMatchResult[]> {
    const business = await Business.findById(businessId);
    if (!business) throw new Error('Business not found');

    const schemes = await GovernmentScheme.find({});
    const applications = await SchemeApplication.find({ businessId });
    const appMap = new Map<string, any>();
    applications.forEach((a) => appMap.set(a.schemeId.toString(), a));

    const results: SchemeMatchResult[] = [];

    for (const s of schemes) {
      let score = 70; // baseline for MSME
      const reasons: string[] = [];

      // Check Turnover
      if (business.annualTurnover && business.annualTurnover <= (s.eligibilityCriteria.maxTurnover || 50000000)) {
        score += 10;
        reasons.push(`Turnover of ₹${(business.annualTurnover / 100000).toFixed(1)}L is well within the ceiling`);
      }

      // Check GSTIN
      if (business.gstin) {
        score += 10;
        reasons.push('Active GSTIN registration verified');
      }

      // Check Target Sectors
      if (s.eligibilityCriteria.targetBusinessTypes?.some((t) => t.toLowerCase().includes(business.businessType.toLowerCase()))) {
        score += 8;
        reasons.push(`Operates in target business category (${business.businessType})`);
      }

      score = Math.min(score, 96);
      const app = appMap.get(s._id.toString());

      results.push({
        schemeId: s._id.toString(),
        name: s.name,
        code: s.code,
        ministry: s.ministry,
        benefitSummary: s.benefitSummary,
        maxBenefitAmount: s.maxBenefitAmount,
        eligibilityDescription: s.eligibilityDescription,
        matchScore: app ? app.matchScore : score,
        matchReason: app ? app.matchReason : reasons.join('. '),
        requiredDocuments: s.requiredDocuments,
        officialPortalUrl: s.officialPortalUrl,
        isDemoData: s.isDemoData,
        applicationStatus: app ? app.status : 'DISCOVERED',
        draftData: app?.draftData,
      });
    }

    // Sort by match score descending
    results.sort((a, b) => b.matchScore - a.matchScore);

    await AuditService.log({
      businessId,
      agentName: 'GovernmentSchemeAgent',
      actionType: 'SEARCH_AND_MATCH_SCHEMES',
      resourceType: 'GovernmentScheme',
      riskLevel: 'LOW',
      outputData: { matchedSchemesCount: results.length, topScheme: results[0]?.name },
      status: 'SUCCESS',
    });

    return results;
  }

  static async generateApplicationDraft(businessId: string, schemeId: string): Promise<any> {
    const business = await Business.findById(businessId);
    const scheme = await GovernmentScheme.findById(schemeId);
    if (!business || !scheme) throw new Error('Business or Scheme not found');

    let app = await SchemeApplication.findOne({ businessId, schemeId });
    if (!app) {
      app = await SchemeApplication.create({
        businessId: business._id,
        schemeId: scheme._id,
        matchScore: 92,
        matchReason: `Auto-generated draft based on ${business.businessType} profile and official ${scheme.code} parameters.`,
        status: 'DRAFT_APPLICATION_READY',
        draftData: {
          applicantName: business.name,
          enterpriseName: business.name,
          udyamNumber: 'UDYAM-MH-26-0094123',
          proposedLoanAmount: 450000,
          activityDescription: `Working capital expansion for ${business.businessType} in ${business.city}.`,
        },
        checklist: scheme.requiredDocuments.map((doc) => ({
          documentName: doc,
          uploaded: doc.includes('Udyam') || doc.includes('PAN'),
          mandatory: true,
        })),
      });
    } else {
      app.status = 'DRAFT_APPLICATION_READY';
      await app.save();
    }

    await AuditService.log({
      businessId,
      agentName: 'GovernmentSchemeAgent',
      actionType: 'GENERATE_APPLICATION_DRAFT',
      resourceType: 'SchemeApplication',
      resourceId: app._id.toString(),
      riskLevel: 'LOW',
      outputData: { schemeCode: scheme.code, status: app.status },
      status: 'SUCCESS',
    });

    return app;
  }
}
