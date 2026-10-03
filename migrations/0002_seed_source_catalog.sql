-- Curated source metadata for the public source library. No registry records
-- or broker personal data are included in this catalog seed.
INSERT INTO sources (
  source_id, name, publisher, source_kind, jurisdiction, description,
  source_url, license_status, license_name, license_url, refresh_policy,
  notes, created_at, updated_at
) VALUES
  (
    'cppa-2025', 'California Data Broker Registry (2025 snapshot)',
    'California Privacy Protection Agency', 'government-registry', 'California',
    'Official historical state broker registration records.',
    'https://cppa.ca.gov/data_broker_registry/registry2025.csv',
    'review-required', NULL, NULL, 'manual',
    'Review reuse terms and field-level display instructions before importing records.',
    '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'
  ),
  (
    'ca-ag-legacy', 'Legacy California AG Registry',
    'California Department of Justice', 'government-archive', 'California',
    'Historical entries with broker contact and privacy-request details.',
    'https://oag.ca.gov/data-brokers',
    'review-required', NULL, NULL, 'manual',
    'Historical source identified in the project roadmap; reuse review pending.',
    '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'
  ),
  (
    'oregon-dfr', 'Oregon Data Broker Registry',
    'Oregon Division of Financial Regulation', 'government-registry', 'Oregon',
    'Broker registrations and descriptions of consumer opt-out methods.',
    'https://dfr.oregon.gov/business/licensing/data-broker-registry/Pages/index.aspx',
    'review-required', NULL, NULL, 'manual',
    'Source identified in the project roadmap; format and reuse review pending.',
    '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'
  ),
  (
    'texas-sos', 'Texas Data Broker Registry',
    'Texas Secretary of State', 'government-registry', 'Texas',
    'Searchable registrations and broker disclosures.',
    'https://www.sos.state.tx.us/statdoc/data-brokers.shtml',
    'review-required', NULL, NULL, 'manual',
    'Source identified in the project roadmap; format and reuse review pending.',
    '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'
  ),
  (
    'vermont-sos', 'Vermont Data Broker Registry',
    'Vermont Secretary of State', 'government-registry', 'Vermont',
    'State registration records, including historical coverage.',
    'https://sos.vermont.gov/business-services/other-filings/data-broker/',
    'review-required', NULL, NULL, 'manual',
    'Source identified in the project roadmap; format and reuse review pending.',
    '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'
  ),
  (
    'cvs0-directory', 'Data Brokers List', 'cvs0 / GitHub', 'open-dataset', NULL,
    'Community-maintained privacy and opt-out target list.',
    'https://github.com/cvs0/Data-Brokers-List/',
    'review-required', NULL, NULL, 'manual',
    'Open-source dataset identified in the project roadmap; license review pending.',
    '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'
  ),
  (
    'optery-directory', 'Open Data Broker Directory', 'Optery', 'open-dataset', NULL,
    'Public broker directory with categories and removal information.',
    'https://www.optery.com/data-brokers/',
    'review-required', NULL, NULL, 'manual',
    'Open dataset identified in the project roadmap; license review pending.',
    '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'
  ),
  (
    'optoutrights-directory', 'Broker Directory', 'OptOutRights / GitHub', 'open-dataset', NULL,
    'Community directory spanning multiple broker categories.',
    'https://github.com/OptOutRights/broker-directory',
    'review-required', NULL, NULL, 'manual',
    'Open dataset identified in the project roadmap; license review pending.',
    '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'
  ),
  (
    'prc-directory', 'Data Broker Directory', 'Privacy Rights Clearinghouse', 'research-reference', NULL,
    'Government-registry aggregation used as a research and cross-validation reference.',
    'https://privacyrights.org/data-brokers',
    'restricted', 'CC-BY-NC-SA 4.0', 'https://creativecommons.org/licenses/by-nc-sa/4.0/', 'manual',
    'Research-only reference; do not include in commercial production without license review.',
    '2026-10-03T00:00:00.000Z', '2026-10-03T00:00:00.000Z'
  );
