# Data broker records and removal workflow samples

- Reviewed: 2026-10-03
- Purpose: compare public registry disclosures with the actual routes a person can use to exercise a privacy choice.
- Scope: public business-level descriptions only. No personal profiles were searched, and no privacy request was submitted.

## What the sources tell us

| Source                                                                                                                                                                                                      | Information available                                                                                                                                                                                                                                                                                                                                                                                                                                       | What it means for Unlisted                                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Vermont Secretary of State Data Broker page](https://sos.vermont.gov/business-services/other-filings/data-broker) and [9 V.S.A. § 2446](https://legislature.vermont.gov/statutes/section/09/062/02446)     | Broker name and primary business contact details; if the broker offers opt-out, the method, activities/sales it covers, whether an authorized third party may act, and activities/data that cannot be opted out. Also registration disclosures such as purchaser credentialing, security-breach counts, and disclosures about minors where known.                                                                                                           | Treat as broker-reported registration facts. Capture removal instructions and scope as structured, separately sourced fields. Vermont law requires registrants to describe opt-out routes when offered; it is not a universal consumer deletion form. The Secretary of State search links to broker records.                                                                                |
| [Oregon DFR registry](https://dfr.oregon.gov/business/licensing/data-broker-registry/Pages/index.aspx) and [consumer guide](https://dfr.oregon.gov/financial/protect/Pages/consumer-privacy-resources.aspx) | Registration/license identity, plus a broker-written narrative (under 600 characters) describing methods consumers can use to opt out of collection, selling, and licensing. The public search is by broker name or license number; selecting the company exposes opt-out information. Oregon says disclosures should identify which activities/data segments are covered and explain how an authorized agent can act.                                      | This is close to our target workflow record: source registration ID, short declared instructions, action scope, agent support, and a direct link. The state walkthrough says a CAPTCHA is part of lookup, so do not design a crawler that tries to defeat it; use the public guide and human verification where required.                                                                   |
| [California DROP](https://privacy.ca.gov/drop/) and [DROP help for brokers](https://privacy.ca.gov/drop-for-data-brokers/help/)                                                                             | A California resident can submit one deletion request to more than 600 registered brokers. The state verifies eligibility; the person chooses how much basic profile information to provide. The state says request status can take up to 90 days to appear, with timing varying by broker.                                                                                                                                                                 | Model a state-level request channel that fans out to participating brokers, distinct from a direct broker endpoint. This is California-resident-specific, so do not imply it replaces direct routes for all users or all brokers. Any future integration needs a separate review of access, authorization, and DROP terms.                                                                  |
| [Epsilon North American Services & Products Privacy Notice](https://legal.epsilon.com/us/NA-products-privacy-policy) and [request portal](https://legal.epsilon.com/dsr/)                                   | Epsilon describes identifiers/contact details, transaction and purchase tendencies, demographics, inferences, online activity, employment, household, lifestyle, financial, property, and sensitive-data categories. It says its sources can include ad interactions, third-party partners, and public sources. The portal/phone supports access, deletion, and several opt-outs; requests are verified, and agent requests require proof of authorization. | A broker page can expose much richer declared collection categories and operational steps than a registry. Preserve the action taxonomy and verification requirements. Critically, Epsilon says its notice does not cover data processed strictly for clients; those requests may need to go to the client/controller. Record such boundaries rather than presenting deletion as universal. |

## Vermont removal guidance: what the user should expect

The Vermont source is useful because it points people to the broker record and requires eligible registration disclosures about opt-out methods and scope. It does not make one request to Vermont that removes information from every broker. A person follows the broker's stated route (or applicable privacy-rights portal), supplies whatever matching/verification information that route requests, and tracks the broker's response. Vermont's registry search is linked from its [Data Broker page](https://sos.vermont.gov/business-services/other-filings/data-broker); the current statutory disclosure is in [§ 2446](https://legislature.vermont.gov/statutes/section/09/062/02446).

The Vermont public search required an interactive validation step during this review, so we did not capture or claim a current individual broker filing. The next verification pass should manually inspect a small set of named broker records, then compare the declared method with the broker's live privacy page. Store discrepancies as separate observations, not silent corrections.

## Initial workflow record for Unlisted

Do not create a D1 migration from this sample alone. First establish a versioned workflow contract that stays separate from the registry/source record contract:

```ts
type PrivacyAction =
  | 'delete'
  | 'suppress'
  | 'opt_out_sale_sharing'
  | 'opt_out_targeted_ads'
  | 'limit_sensitive_use'
  | 'access'
  | 'correct'
  | 'unknown';

interface PublicWorkflowEvidence {
  subjectId: string; // canonical broker, brand, or shared provider
  jurisdiction?: string;
  action: PrivacyAction;
  channel: 'web_form' | 'email' | 'phone' | 'mail' | 'state_portal' | 'other';
  destination?: string;
  scopeSummary?: string;
  agentAllowed?: 'yes' | 'no' | 'unclear';
  verificationSummary?: string;
  limitationsSummary?: string;
  sourceUrl: string;
  sourceKind: 'government_registry' | 'broker_privacy_notice' | 'broker_request_portal';
  observedAt: string;
  reviewStatus: 'unreviewed' | 'human_verified' | 'stale';
}
```

The record should point to public instructions and summarize what they claim. It must not contain a user's name, address, email, profile match, government ID, verification response, or submitted request payload. `scopeSummary`, `verificationSummary`, and `limitationsSummary` are broker/state instructions, not legal advice or a guarantee of outcome.

## Suggested first user journey

1. Show a broker card with the legal name/brand, source and registration year, last-checked date, and a plain-language summary of the information categories the broker says it handles.
2. Give each action its own label: delete, suppress a public listing, opt out of sale/sharing, targeted-ad opt-out, access, or correct. Do not collapse these into one “remove everything” button.
3. Show eligibility and scope beside the route: state/jurisdiction limits, activities or data excluded, and whether the broker allows an authorized agent.
4. Open the official broker or state request page in a new tab. The user completes identity matching and any verification with that provider.
5. Let the user privately mark the action as planned, submitted, confirmed, denied, or follow-up needed, and optionally record a reminder date. Keep that tracker local to the user's account and outside public broker records.
6. Recheck public instructions periodically; mark old evidence stale and keep the prior observation for history.

## Research conclusions and next engineering step

- There are at least three distinct levels to represent: government registration, broker-published privacy instructions, and state-level request portals.
- Registry facts and broker-page instructions can differ. Preserve provenance and review state per claim.
- A user journey can be useful without automated submission: explain the action and scope, send the person to the correct first-party route, and help them keep track.
- Workflow research should remain read-only. Automated submissions require a separately approved product, identity-data, authorization, and security design under the existing [agent guide](../../AGENTS.md).
- Next: manually verify a small sample of named Vermont and Oregon records plus two broker-owned portals, then agree the workflow contract before adding adapters or migrations. Keep the existing CPPA reuse decision separate; this note does not resolve it.
