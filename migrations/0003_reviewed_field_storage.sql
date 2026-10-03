-- Field-minimized evidence path. Unlike source_observations, these tables
-- deliberately have no raw-row or blob payload column.

CREATE TABLE source_field_policy_decisions (
  decision_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  field_key TEXT NOT NULL CHECK (field_key IN (
    '__full_raw_record__', 'broker_name', 'dba', 'website_url', 'privacy_rights_url'
  )),
  source_field_label TEXT NOT NULL,
  storage_status TEXT NOT NULL CHECK (storage_status IN ('pending', 'approved', 'denied')),
  display_status TEXT NOT NULL CHECK (display_status IN ('pending', 'approved', 'denied')),
  decision_version INTEGER NOT NULL CHECK (decision_version > 0),
  decision_basis_url TEXT,
  reviewer TEXT NOT NULL,
  review_note TEXT NOT NULL,
  decided_at TEXT NOT NULL,
  UNIQUE (source_id, field_key, decision_version)
);

CREATE INDEX source_field_policy_latest
  ON source_field_policy_decisions(source_id, field_key, decision_version DESC);

CREATE TRIGGER sources_approval_requires_named_license_on_insert
BEFORE INSERT ON sources
WHEN NEW.license_status = 'approved'
 AND (NEW.license_name IS NULL OR length(trim(NEW.license_name)) = 0)
BEGIN
  SELECT RAISE(ABORT, 'approved sources must name the reviewed license');
END;

CREATE TRIGGER sources_approval_requires_named_license_on_update
BEFORE UPDATE OF license_status, license_name ON sources
WHEN NEW.license_status = 'approved'
 AND (NEW.license_name IS NULL OR length(trim(NEW.license_name)) = 0)
BEGIN
  SELECT RAISE(ABORT, 'approved sources must name the reviewed license');
END;

CREATE TRIGGER source_field_policy_requires_approved_source
BEFORE INSERT ON source_field_policy_decisions
WHEN (NEW.storage_status = 'approved' OR NEW.display_status = 'approved')
 AND NOT EXISTS (
   SELECT 1 FROM sources
   WHERE source_id = NEW.source_id AND license_status = 'approved'
 )
BEGIN
  SELECT RAISE(ABORT, 'source reuse must be approved before field approval');
END;

CREATE TRIGGER source_field_policy_no_update
BEFORE UPDATE ON source_field_policy_decisions
BEGIN
  SELECT RAISE(ABORT, 'field policy decisions are append-only');
END;

CREATE TRIGGER source_field_policy_no_delete
BEFORE DELETE ON source_field_policy_decisions
BEGIN
  SELECT RAISE(ABORT, 'field policy decisions are append-only');
END;

-- Preserve the old raw-observation table for sources that explicitly receive
-- full-payload approval, but block it by default (including for CPPA).
CREATE TRIGGER source_observations_require_full_payload_approval
BEFORE INSERT ON source_observations
WHEN NOT EXISTS (
  SELECT 1
  FROM sources s
  JOIN source_field_policy_decisions p
    ON p.source_id = s.source_id
   AND p.field_key = '__full_raw_record__'
   AND p.decision_version = (
     SELECT MAX(p2.decision_version)
     FROM source_field_policy_decisions p2
     WHERE p2.source_id = s.source_id AND p2.field_key = '__full_raw_record__'
   )
  WHERE s.source_id = NEW.source_id
    AND s.license_status = 'approved'
    AND p.storage_status = 'approved'
)
BEGIN
  SELECT RAISE(ABORT, 'full source payload is not approved for storage');
END;

-- A minimized observation stores only a digest of the approved projection.
-- It intentionally has no raw_record_json or raw snapshot payload.
CREATE TABLE minimized_observations (
  observation_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  source_record_key TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  projection_hash TEXT NOT NULL CHECK (length(projection_hash) = 64),
  ingestion_run_id TEXT NOT NULL REFERENCES ingestion_runs(ingestion_run_id),
  broker_id TEXT REFERENCES brokers(broker_id),
  UNIQUE (source_id, source_record_key, observed_at)
);

CREATE INDEX minimized_observations_by_source_key
  ON minimized_observations(source_id, source_record_key, observed_at DESC);

CREATE TRIGGER minimized_observations_requires_approved_source
BEFORE INSERT ON minimized_observations
WHEN NOT EXISTS (
  SELECT 1 FROM sources
  WHERE source_id = NEW.source_id AND license_status = 'approved'
)
BEGIN
  SELECT RAISE(ABORT, 'source reuse is not approved for storage');
END;

CREATE TRIGGER minimized_observations_no_update
BEFORE UPDATE ON minimized_observations
BEGIN
  SELECT RAISE(ABORT, 'minimized observations are immutable');
END;

CREATE TRIGGER minimized_observations_no_delete
BEFORE DELETE ON minimized_observations
BEGIN
  SELECT RAISE(ABORT, 'minimized observations are immutable');
END;

CREATE TABLE observation_fields (
  observation_id TEXT NOT NULL REFERENCES minimized_observations(observation_id),
  field_key TEXT NOT NULL CHECK (field_key IN (
    'broker_name', 'dba', 'website_url', 'privacy_rights_url'
  )),
  value_text TEXT NOT NULL CHECK (length(trim(value_text)) > 0),
  source_field_label TEXT NOT NULL,
  PRIMARY KEY (observation_id, field_key)
);

CREATE INDEX observation_fields_by_key ON observation_fields(field_key);

CREATE TRIGGER observation_fields_require_storage_approval
BEFORE INSERT ON observation_fields
WHEN NOT EXISTS (
  SELECT 1
  FROM minimized_observations o
  JOIN sources s ON s.source_id = o.source_id
  JOIN source_field_policy_decisions p
    ON p.source_id = o.source_id
   AND p.field_key = NEW.field_key
   AND p.decision_version = (
     SELECT MAX(p2.decision_version)
     FROM source_field_policy_decisions p2
     WHERE p2.source_id = o.source_id AND p2.field_key = NEW.field_key
   )
  WHERE o.observation_id = NEW.observation_id
    AND s.license_status = 'approved'
    AND p.storage_status = 'approved'
    AND p.source_field_label = NEW.source_field_label
)
BEGIN
  SELECT RAISE(ABORT, 'field is not approved for storage');
END;

CREATE TRIGGER observation_fields_no_update
BEFORE UPDATE ON observation_fields
BEGIN
  SELECT RAISE(ABORT, 'observation fields are immutable');
END;

CREATE TRIGGER observation_fields_no_delete
BEFORE DELETE ON observation_fields
BEGIN
  SELECT RAISE(ABORT, 'observation fields are immutable');
END;

-- This view is the only proposed public read path. It fails closed unless both
-- source reuse and the latest per-field storage/display decisions are approved.
CREATE VIEW verified_public_observation_fields AS
SELECT
  b.broker_id,
  b.canonical_name,
  o.observation_id,
  o.source_record_key,
  o.observed_at,
  s.source_id,
  s.name AS source_name,
  s.source_url,
  f.field_key,
  f.value_text,
  f.source_field_label
FROM observation_fields f
JOIN minimized_observations o ON o.observation_id = f.observation_id
JOIN sources s ON s.source_id = o.source_id
JOIN brokers b ON b.broker_id = o.broker_id
JOIN source_field_policy_decisions p
  ON p.source_id = o.source_id
 AND p.field_key = f.field_key
 AND p.decision_version = (
   SELECT MAX(p2.decision_version)
   FROM source_field_policy_decisions p2
   WHERE p2.source_id = o.source_id AND p2.field_key = f.field_key
 )
WHERE s.license_status = 'approved'
  AND p.storage_status = 'approved'
  AND p.display_status = 'approved'
  AND p.source_field_label = f.source_field_label
  AND b.review_status = 'verified'
  AND length(trim(f.value_text)) > 0;

-- CPPA field candidates are pending, never approved by migration defaults.
INSERT INTO source_field_policy_decisions (
  decision_id, source_id, field_key, source_field_label,
  storage_status, display_status, decision_version,
  decision_basis_url, reviewer, review_note, decided_at
) VALUES
  (
    'cppa-2025-full-row-v1', 'cppa-2025', '__full_raw_record__', 'Complete 67-column registry row',
    'pending', 'denied', 1,
    'https://cppa.ca.gov/data_broker_registry/', 'unlisted',
    'Do not retain full rows unless CPPA reuse, third-party content, and retention are explicitly reviewed.',
    '2026-10-03T00:00:00.000Z'
  ),
  (
    'cppa-2025-broker-name-v1', 'cppa-2025', 'broker_name', 'Data broker name',
    'pending', 'pending', 1,
    'https://cppa.ca.gov/data_broker_registry/', 'unlisted',
    'Proposed minimum projection only; source reuse and field review unresolved.',
    '2026-10-03T00:00:00.000Z'
  ),
  (
    'cppa-2025-dba-v1', 'cppa-2025', 'dba', 'Doing Business As (DBA), if applicable',
    'pending', 'pending', 1,
    'https://cppa.ca.gov/data_broker_registry/', 'unlisted',
    'Proposed only; must be nonblank and source guidance must be honored.',
    '2026-10-03T00:00:00.000Z'
  ),
  (
    'cppa-2025-website-v1', 'cppa-2025', 'website_url', 'Data broker primary website',
    'pending', 'pending', 1,
    'https://cppa.ca.gov/data_broker_registry/', 'unlisted',
    'Proposed minimum projection only; source reuse and field review unresolved.',
    '2026-10-03T00:00:00.000Z'
  ),
  (
    'cppa-2025-rights-url-v1', 'cppa-2025', 'privacy_rights_url',
    'Primary site explaining how consumers exercise CA CCPA rights/delete PI',
    'pending', 'pending', 1,
    'https://cppa.ca.gov/data_broker_registry/', 'unlisted',
    'Proposed minimum projection only; source reuse and field review unresolved.',
    '2026-10-03T00:00:00.000Z'
  );
