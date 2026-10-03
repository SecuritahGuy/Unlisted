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
  {
    schemaVersion: 1,
    evidenceId: 'melissa-data-delete-v1',
    subject: { kind: 'broker', id: 'melissa-data-corporation' },
    jurisdiction: 'United States; Melissa says any individual may request',
    action: 'delete',
    channel: 'web_form',
    destinationUrl: 'https://apps.melissa.com/user/consumerprivacy.aspx',
    scopeSummary:
      'Melissa says any individual may request deletion of their personal information from Melissa Lookups and its other database products.',
    agentSupport: 'unclear',
    verificationSummary:
      'Melissa says it verifies identity. It describes proportionate checks and says it does not require government ID for simple opt-out requests; higher-risk access requests may need more authentication.',
    limitationsSummary:
      'Applies to data in Melissa’s products, not other companies’ databases. Melissa may retain records needed to honor requests or meet legal duties.',
    evidence: {
      sourceUrl: 'https://www.melissa.com/state-law-privacy-notice',
      sourceKind: 'broker_privacy_notice',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
  {
    schemaVersion: 1,
    evidenceId: 'melissa-data-sale-optout-v1',
    subject: { kind: 'broker', id: 'melissa-data-corporation' },
    jurisdiction: 'United States; Melissa says any individual may request',
    action: 'opt_out_sale_sharing',
    channel: 'web_form',
    destinationUrl: 'https://apps.melissa.com/user/consumerprivacy.aspx',
    scopeSummary:
      'Melissa says any individual may request to opt out of sale or sharing of personal information in Melissa Lookups and its other database products.',
    agentSupport: 'unclear',
    verificationSummary:
      'Melissa says it verifies identity and honors recognized opt-out preference signals, including Global Privacy Control, for the applicable browser.',
    limitationsSummary:
      'The request affects Melissa’s processing only. It does not remove information held by other companies.',
    evidence: {
      sourceUrl: 'https://www.melissa.com/state-law-privacy-notice',
      sourceKind: 'broker_privacy_notice',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
  {
    schemaVersion: 1,
    evidenceId: 'common-room-prospector-sale-optout-v1',
    subject: { kind: 'broker', id: 'common-room' },
    jurisdiction: 'United States; rights depend on applicable law',
    action: 'opt_out_sale_sharing',
    channel: 'web_form',
    destinationUrl: 'https://app.commonroom.io/remove-my-info',
    scopeSummary:
      'Common Room says its Prospector product provides business contact information to customers and that, where applicable law gives the right, a person may request that it not sell their data.',
    agentSupport: 'unclear',
    verificationSummary:
      'Common Room says it will take steps to verify identity before fulfilling a request.',
    limitationsSummary:
      'This route concerns Common Room’s Prospector data. Its privacy notice excludes customer data processed on behalf of customers; requests about that data go to the relevant customer.',
    evidence: {
      sourceUrl: 'https://www.commonroom.io/privacy-policy/',
      sourceKind: 'broker_privacy_notice',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
  {
    schemaVersion: 1,
    evidenceId: 'fullenrich-delete-v1',
    subject: { kind: 'broker', id: 'fullenrich' },
    jurisdiction: 'United States; rights depend on applicable law',
    action: 'delete',
    channel: 'web_form',
    destinationUrl: 'https://dsar.fullenrich.com/',
    scopeSummary:
      'FullEnrich’s privacy-rights form offers a request to delete personal data from its systems.',
    agentSupport: 'unclear',
    verificationSummary:
      'The form requires an email address and phone number and says it uses dual verification before processing the request.',
    limitationsSummary:
      'This is a request to FullEnrich about data in its systems; it does not promise removal from other companies or downstream copies.',
    evidence: {
      sourceUrl: 'https://dsar.fullenrich.com/',
      sourceKind: 'broker_request_portal',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
  {
    schemaVersion: 1,
    evidenceId: 'fullenrich-sale-optout-v1',
    subject: { kind: 'broker', id: 'fullenrich' },
    jurisdiction: 'United States; rights depend on applicable law',
    action: 'opt_out_sale_sharing',
    channel: 'web_form',
    destinationUrl: 'https://dsar.fullenrich.com/',
    scopeSummary:
      'FullEnrich’s privacy-rights form offers a sale/sharing opt-out and says a submitted opt-out request adds the person to its opt-out list.',
    agentSupport: 'unclear',
    verificationSummary:
      'The form requires an email address and phone number and says it uses dual verification before processing the request.',
    limitationsSummary:
      'This is an opt-out from FullEnrich’s sale or sharing; it does not remove information held by other companies.',
    evidence: {
      sourceUrl: 'https://dsar.fullenrich.com/',
      sourceKind: 'broker_request_portal',
      observedAt: '2026-10-03T00:00:00.000Z',
    },
    reviewStatus: 'human_verified',
  },
];

for (const sample of workflowSamples) validatePublicWorkflowEvidence(sample);
