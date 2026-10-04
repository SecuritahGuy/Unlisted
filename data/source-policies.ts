export interface SourcePolicySummary {
  reuseLabel: string;
  accessSummary: string;
  reuseStatus: string;
  reviewedAt: string;
  nextStep: string;
  evidenceUrl: string;
}

const registryReviewUrl =
  'https://github.com/SecuritahGuy/Unlisted/blob/main/docs/research/registry-source-priority.md';

/** Operational access and reuse review, separate from source authority and license enums. */
export const sourcePolicies: Record<string, SourcePolicySummary> = {
  cppa: {
    reuseLabel: 'Reuse unresolved',
    accessSummary: 'Bulk registration-information download is available from the agency site.',
    reuseStatus: 'Unresolved. No registry-specific republication grant was identified.',
    reviewedAt: '2026-10-03',
    nextStep:
      'Confirm the current download and ask the agency about retaining and republishing broker-submitted fields.',
    evidenceUrl: registryReviewUrl,
  },
  'ca-ag': {
    reuseLabel: 'Reuse unreviewed',
    accessSummary:
      'Historical registry entries are publicly browsable; bulk access was not assessed.',
    reuseStatus:
      'Not reviewed for this project. Review source terms and third-party rights before reuse.',
    reviewedAt: '2026-10-03',
    nextStep: 'Assess the archive’s terms and the intended reuse of historical entries.',
    evidenceUrl: registryReviewUrl,
  },
  oregon: {
    reuseLabel: 'Reuse unresolved',
    accessSummary:
      'Search requires an interactive image CAPTCHA; the result includes broker-declared opt-out instructions.',
    reuseStatus:
      'Unresolved. Public visibility does not establish permission to copy or republish registry narratives.',
    reviewedAt: '2026-10-03',
    nextStep:
      'Use ordinary human lookup and resolve reuse terms before publishing registry-derived details.',
    evidenceUrl: registryReviewUrl,
  },
  texas: {
    reuseLabel: 'Reuse unresolved',
    accessSummary: 'Searchable online registry; no public bulk export or API was identified.',
    reuseStatus:
      'Unresolved. Public access and copying do not establish permission for a public mirror.',
    reviewedAt: '2026-10-03',
    nextStep:
      'Keep lookup targeted and clarify permitted republication of filings and broker narratives.',
    evidenceUrl: registryReviewUrl,
  },
  vermont: {
    reuseLabel: 'Reuse unresolved',
    accessSummary:
      'Interactive broker search; no bulk download was identified in the review. A downloadable spreadsheet is scheduled under 2026 Act 138 for January 1, 2027.',
    reuseStatus: 'Unresolved. Reassess the new dataset and its terms when it becomes available.',
    reviewedAt: '2026-10-03',
    nextStep:
      'Use human lookup for now; review the spreadsheet and its terms after the effective date.',
    evidenceUrl: registryReviewUrl,
  },
  cvs0: {
    reuseLabel: 'Terms not reviewed',
    accessSummary: 'Public community-maintained GitHub repository.',
    reuseStatus:
      'Not reviewed. Confirm repository license and record-level reuse conditions before copying data.',
    reviewedAt: '2026-10-03',
    nextStep: 'Review the repository license and attribution requirements.',
    evidenceUrl: 'https://github.com/cvs0/Data-Brokers-List/',
  },
  optery: {
    reuseLabel: 'Reuse unreviewed',
    accessSummary: 'Public broker directory website.',
    reuseStatus:
      'Not reviewed. Public access alone does not establish permission to republish directory records.',
    reviewedAt: '2026-10-03',
    nextStep: 'Review site terms and obtain clarity on reuse before copying entries.',
    evidenceUrl: 'https://www.optery.com/data-brokers/',
  },
  optoutrights: {
    reuseLabel: 'Terms not reviewed',
    accessSummary: 'Public community-maintained GitHub repository.',
    reuseStatus:
      'Not reviewed. Confirm repository license and record-level reuse conditions before copying data.',
    reviewedAt: '2026-10-03',
    nextStep: 'Review the repository license and attribution requirements.',
    evidenceUrl: 'https://github.com/OptOutRights/broker-directory',
  },
  prc: {
    reuseLabel: 'Research only',
    accessSummary:
      'Public directory and research reference; a downloadable dataset is described by the publisher.',
    reuseStatus:
      'Research only. The identified CC-BY-NC-SA 4.0 license is not approved for production reuse.',
    reviewedAt: '2026-10-03',
    nextStep: 'Use for research and cross-checking only unless commercial permission is obtained.',
    evidenceUrl: 'https://privacyrights.org/data-brokers',
  },
};
