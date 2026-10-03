export type SourceKind =
  'Government registry' | 'Government archive' | 'Open dataset' | 'Research reference';

export interface SourceRecord {
  id: string;
  name: string;
  organization: string;
  kind: SourceKind;
  region: string;
  description: string;
  href: string;
  signal: string;
}

// Source candidates identified in the project roadmap. Listing a source here
// does not mean its records have been ingested, licensed, or independently verified.
export const sources: SourceRecord[] = [
  {
    id: 'cppa',
    name: 'California Data Broker Registry',
    organization: 'California Privacy Protection Agency',
    kind: 'Government registry',
    region: 'California',
    description: 'Current and historical state broker registration records.',
    href: 'https://cppa.ca.gov/data_broker_registry/',
    signal: 'Primary source',
  },
  {
    id: 'ca-ag',
    name: 'Legacy California AG Registry',
    organization: 'California Department of Justice',
    kind: 'Government archive',
    region: 'California',
    description: 'Historical entries with broker contact and privacy-request details.',
    href: 'https://oag.ca.gov/data-brokers',
    signal: 'Historical source',
  },
  {
    id: 'oregon',
    name: 'Oregon Data Broker Registry',
    organization: 'Oregon Division of Financial Regulation',
    kind: 'Government registry',
    region: 'Oregon',
    description: 'Broker registrations and descriptions of consumer opt-out methods.',
    href: 'https://dfr.oregon.gov/business/licensing/data-broker-registry/Pages/index.aspx',
    signal: 'Primary source',
  },
  {
    id: 'texas',
    name: 'Texas Data Broker Registry',
    organization: 'Texas Secretary of State',
    kind: 'Government registry',
    region: 'Texas',
    description: 'Searchable registrations and broker disclosures.',
    href: 'https://www.sos.state.tx.us/statdoc/data-brokers.shtml',
    signal: 'Primary source',
  },
  {
    id: 'vermont',
    name: 'Vermont Data Broker Registry',
    organization: 'Vermont Secretary of State',
    kind: 'Government registry',
    region: 'Vermont',
    description: 'State registration records, including historical coverage.',
    href: 'https://sos.vermont.gov/business-services/other-filings/data-broker/',
    signal: 'Primary source',
  },
  {
    id: 'cvs0',
    name: 'Data Brokers List',
    organization: 'cvs0 / GitHub',
    kind: 'Open dataset',
    region: 'Multi-region',
    description: 'Community-maintained privacy and opt-out target list.',
    href: 'https://github.com/cvs0/Data-Brokers-List/',
    signal: 'License review needed',
  },
  {
    id: 'optery',
    name: 'Open Data Broker Directory',
    organization: 'Optery',
    kind: 'Open dataset',
    region: 'Multi-region',
    description: 'Public broker directory with categories and removal information.',
    href: 'https://www.optery.com/data-brokers/',
    signal: 'License review needed',
  },
  {
    id: 'optoutrights',
    name: 'Broker Directory',
    organization: 'OptOutRights / GitHub',
    kind: 'Open dataset',
    region: 'Multi-region',
    description: 'Community directory spanning multiple broker categories.',
    href: 'https://github.com/OptOutRights/broker-directory',
    signal: 'License review needed',
  },
  {
    id: 'prc',
    name: 'Data Broker Directory',
    organization: 'Privacy Rights Clearinghouse',
    kind: 'Research reference',
    region: 'Multi-region',
    description:
      'Government-registry aggregation; roadmap flags a noncommercial license for review.',
    href: 'https://privacyrights.org/data-brokers',
    signal: 'Research only',
  },
];
