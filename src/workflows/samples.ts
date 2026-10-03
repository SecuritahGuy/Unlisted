import type { PublicWorkflowEvidenceV1 } from './contracts.ts';
import { validatePublicWorkflowEvidence } from './contracts.ts';

/** Small, manually reviewed examples of distinct request routes and scopes. */
export const workflowSamples: PublicWorkflowEvidenceV1[] = [
  {
    schemaVersion: 1,
    evidenceId: 'epsilon-delete-us-v1',
    subject: { kind: 'broker', id: 'epsilon' },
    jurisdiction: 'United States',
    action: 'delete',
    channel: 'web_form',
    destinationUrl: 'https://legal.epsilon.com/dsr/',
    scopeSummary:
      'Epsilon says U.S. residents may request deletion of personal data it obtained; legal exceptions may apply. Client-controlled data may need to be handled by the client.',
    agentSupport: 'yes',
    verificationSummary:
      'Epsilon says it verifies identity; its current notice describes an email confirmation link for deletion. Agents must provide written proof of authority.',
    limitationsSummary:
      'Applies to Epsilon-controlled processing covered by its notice. Data Epsilon processes as a client service provider is handled under the client relationship.',
    evidence: {
      sourceUrl: 'https://legal.epsilon.com/us/NA-products-privacy-policy',
      sourceKind: 'broker_privacy_notice',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
  {
    schemaVersion: 1,
    evidenceId: 'epsilon-marketing-suppression-consumer-info-v1',
    subject: { kind: 'broker', id: 'epsilon' },
    jurisdiction: 'United States',
    action: 'opt_out_direct_marketing',
    channel: 'web_form',
    destinationUrl: 'https://legal.epsilon.com/dsr/',
    scopeSummary:
      'Epsilon’s consumer information page describes a marketing opt-out that marks records “Do Not Share”; it does not delete the information and covers Epsilon marketing databases only.',
    agentSupport: 'yes',
    verificationSummary: 'The current privacy notice says agents need written proof of authority.',
    limitationsSummary:
      'Does not remove records held by other companies. Treat this marketing-database explanation separately from the broader rights listed in the current privacy notice.',
    evidence: {
      sourceUrl: 'https://legal.epsilon.com/us/consumer-information',
      sourceKind: 'broker_privacy_notice',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
  {
    schemaVersion: 1,
    evidenceId: 'lexisnexis-risk-full-sale-optout-v1',
    subject: { kind: 'broker', id: 'lexisnexis-risk-solutions' },
    jurisdiction: 'United States; state privacy-law eligibility varies',
    action: 'opt_out_sale_sharing',
    channel: 'web_form',
    destinationUrl: 'https://consumer.risk.lexisnexis.com/request',
    scopeSummary:
      'The portal offers a full opt-out of sale/sharing, subject to legal exceptions. A separate partial option allows sale of professional information while opting out other covered data.',
    agentSupport: 'yes',
    verificationSummary:
      'The portal says an SSN or driver’s license is not required for an opt-out; identity matching still applies. Authorized-agent rules may require identity proof and written authorization.',
    limitationsSummary:
      'Applies to information covered by applicable state privacy law and does not include exempt information.',
    evidence: {
      sourceUrl: 'https://consumer.risk.lexisnexis.com/request',
      sourceKind: 'broker_request_portal',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
  {
    schemaVersion: 1,
    evidenceId: 'lexisnexis-risk-delete-v1',
    subject: { kind: 'broker', id: 'lexisnexis-risk-solutions' },
    jurisdiction: 'United States; state privacy-law eligibility varies',
    action: 'delete',
    channel: 'web_form',
    destinationUrl: 'https://consumer.risk.lexisnexis.com/request',
    scopeSummary:
      'The portal offers deletion of personal information maintained about the consumer, subject to applicable state privacy law.',
    agentSupport: 'yes',
    verificationSummary:
      'The portal says deletion requires either an SSN or a driver’s license number and state, followed by identity matching. Authorized-agent requests may require written authorization and should use the contact route in the privacy notice.',
    limitationsSummary:
      'The state-privacy portal request does not promise deletion of exempt information or records held by other companies.',
    evidence: {
      sourceUrl: 'https://consumer.risk.lexisnexis.com/request',
      sourceKind: 'broker_request_portal',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
  {
    schemaVersion: 1,
    evidenceId: 'lexisnexis-risk-safety-suppression-v1',
    subject: { kind: 'broker', id: 'lexisnexis-risk-solutions' },
    action: 'suppress',
    channel: 'web_form',
    destinationUrl: 'https://consumer.risk.lexisnexis.com/opt',
    scopeSummary:
      'Safety-based suppression covers specified LexisNexis Risk Solutions FL Inc. public-record products and requires documentation supporting eligibility and safety risk.',
    agentSupport: 'unclear',
    verificationSummary:
      'The provider reviews supporting documentation; this research did not submit a request or inspect form fields.',
    limitationsSummary:
      'The page says this does not cover law-enforcement or FCRA-regulated products and cannot stop other companies or public-record agencies from sharing information.',
    evidence: {
      sourceUrl: 'https://consumer.risk.lexisnexis.com/opt',
      sourceKind: 'broker_request_portal',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
];

for (const sample of workflowSamples) validatePublicWorkflowEvidence(sample);
