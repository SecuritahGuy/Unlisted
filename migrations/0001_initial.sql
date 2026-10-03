-- Unlisted's first relational data contract.
-- Raw observations are append-only; normalized broker records remain reviewable.

CREATE TABLE sources (
  source_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  publisher TEXT NOT NULL,
  source_kind TEXT NOT NULL CHECK (source_kind IN (
    'government-registry', 'government-archive', 'open-dataset', 'research-reference'
  )),
  jurisdiction TEXT,
  source_url TEXT NOT NULL,
  license_status TEXT NOT NULL DEFAULT 'unknown' CHECK (license_status IN (
    'unknown', 'review-required', 'approved', 'restricted', 'prohibited'
  )),
  license_name TEXT,
  license_url TEXT,
  refresh_policy TEXT NOT NULL DEFAULT 'unknown' CHECK (refresh_policy IN (
    'manual', 'scheduled', 'unknown'
  )),
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE ingestion_runs (
  ingestion_run_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK (status IN (
    'running', 'succeeded', 'partial', 'failed', 'cancelled'
  )),
  records_seen INTEGER NOT NULL DEFAULT 0 CHECK (records_seen >= 0),
  records_added INTEGER NOT NULL DEFAULT 0 CHECK (records_added >= 0),
  records_unchanged INTEGER NOT NULL DEFAULT 0 CHECK (records_unchanged >= 0),
  error_summary TEXT
);

CREATE TABLE source_observations (
  observation_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(source_id),
  source_record_key TEXT NOT NULL,
  observed_at TEXT NOT NULL,
  record_hash TEXT NOT NULL CHECK (length(record_hash) = 64),
  raw_record_json TEXT NOT NULL CHECK (json_valid(raw_record_json)),
  source_record_url TEXT,
  raw_snapshot_key TEXT,
  ingestion_run_id TEXT NOT NULL REFERENCES ingestion_runs(ingestion_run_id),
  UNIQUE (source_id, source_record_key, observed_at)
);

CREATE INDEX source_observations_by_source_key
  ON source_observations(source_id, source_record_key, observed_at DESC);
CREATE INDEX source_observations_by_run
  ON source_observations(ingestion_run_id);

-- Source evidence is history: corrections and refreshes append new observations.
CREATE TRIGGER source_observations_no_update
BEFORE UPDATE ON source_observations
BEGIN
  SELECT RAISE(ABORT, 'source observations are immutable');
END;

CREATE TRIGGER source_observations_no_delete
BEFORE DELETE ON source_observations
BEGIN
  SELECT RAISE(ABORT, 'source observations are immutable');
END;

CREATE TABLE brokers (
  broker_id TEXT PRIMARY KEY,
  canonical_name TEXT NOT NULL,
  review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (review_status IN (
    'unreviewed', 'in-review', 'verified', 'rejected'
  )),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX brokers_by_canonical_name ON brokers(canonical_name);

CREATE TABLE broker_aliases (
  alias_id TEXT PRIMARY KEY,
  broker_id TEXT NOT NULL REFERENCES brokers(broker_id),
  alias TEXT NOT NULL,
  alias_kind TEXT NOT NULL CHECK (alias_kind IN (
    'legal-name', 'dba', 'brand', 'former-name', 'other'
  )),
  source_observation_id TEXT REFERENCES source_observations(observation_id),
  confidence REAL CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  created_at TEXT NOT NULL,
  UNIQUE (broker_id, alias, alias_kind, source_observation_id)
);

CREATE INDEX broker_aliases_by_alias ON broker_aliases(alias);
CREATE INDEX broker_aliases_by_broker ON broker_aliases(broker_id);

CREATE TABLE government_registrations (
  registration_id TEXT PRIMARY KEY,
  source_observation_id TEXT NOT NULL UNIQUE REFERENCES source_observations(observation_id),
  broker_id TEXT REFERENCES brokers(broker_id),
  jurisdiction TEXT NOT NULL,
  registered_name TEXT NOT NULL,
  registration_status TEXT,
  registration_year INTEGER,
  created_at TEXT NOT NULL,
  CHECK (registration_year IS NULL OR registration_year BETWEEN 1900 AND 2200)
);

CREATE INDEX government_registrations_by_jurisdiction
  ON government_registrations(jurisdiction, registered_name);
CREATE INDEX government_registrations_by_broker
  ON government_registrations(broker_id);
