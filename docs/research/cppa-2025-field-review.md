# CPPA 2025 field and reuse review

- Reviewed: 2026-10-03
- Source: [CPPA 2025 Data Broker Registry](https://cppa.ca.gov/data_broker_registry/)
- Dataset: [2025 registry CSV](https://cppa.ca.gov/data_broker_registry/registry2025.csv)
- Disposition: **Proposed only; reuse approval remains unresolved.**

## What the official notices establish

CPPA says the registry contains information submitted during registration, is made accessible to the public through its website, and can be downloaded as all submitted responses. This establishes CPPA's public access and display of the registration information. The notice does not grant an explicit downstream republication license.

California's general [Conditions of Use](https://www.ca.gov/legal/conditions-of-use/) says state website information is generally in the public domain and may be copied as permitted by law, while cautioning that copyrighted or third-party-owned content may require permission. Because this dataset contains broker-submitted answers, that general statement does not resolve the rights to every submitted value. No CPPA-specific 2025 dataset license or republication terms were located in the public registry materials reviewed.

**Decision:** keep `cppa-2025` at `review-required`. Do not persist the full CSV, create a public broker directory from it, or change its D1 license status based on public availability alone. A CPPA-specific reuse determination or legal review is still needed before persistent ingestion.

## Field instructions in the CSV

The first CSV row contains form guidance. Eight cells state: “If not answered by DB, do not surface in website.” They apply to:

| Column | Header                                                                     | Handling implied by the instruction |
| ------ | -------------------------------------------------------------------------- | ----------------------------------- |
| B      | Doing Business As (DBA), if applicable                                     | Never display when blank            |
| E      | Data broker primary phone number: [optional]                               | Never display when blank            |
| K      | Data broker primary address, if it does not comport to the format provided | Never display when blank            |
| Q      | FCRA-covered personal-information types                                    | Never display when blank            |
| U      | GLBA-covered PI types                                                      | Never display when blank            |
| Y      | IIPPA-covered PI types                                                     | Never display when blank            |
| AC     | CMIA-covered PI types                                                      | Never display when blank            |
| AG     | HIPAA-covered PI types                                                     | Never display when blank            |

These are website-display instructions, not a blanket reuse grant. A populated value in one of these columns is not automatically approved for Unlisted to republish.

## Proposed minimum projection

This is a field-minimization proposal for a later approved projection, **not authorization to persist or publish these fields**.

| Column | Field                                                                   | Proposed treatment                                       |
| ------ | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| A      | Data broker name                                                        | Candidate for a broker-reported directory entry          |
| B      | Doing Business As (DBA), if applicable                                  | Candidate only when nonblank; honor the guidance row     |
| C      | Data broker primary website                                             | Candidate for a source-linked company website            |
| O      | Primary site explaining how consumers exercise CA CCPA rights/delete PI | Candidate for a source-linked privacy-rights destination |

Initial exclusions: D/E contact details, F–K addresses, L–N sensitive-data flags, P–AI regulatory and data-category disclosures, AJ–BN request metrics, and BO–BP free-text explanations. In particular, AJ–BN are request metrics labeled 2023 and are stale signals in this historical snapshot; free-text values can contain material that needs separate review. Revisit exclusions only with a documented product purpose and source-specific approval.

Every future displayed value should be labeled as broker-reported, cite the CPPA as its source, and identify the 2025 snapshot year. This is separate from Unlisted's verification status: a registry submission is not an independently verified current fact.

## Persistence design implication

The current `source_observations.raw_record_json` column represents a full raw source row. It must not be used to store the complete CPPA row if the approved disposition only permits a reduced projection. Before persistence, decide whether to retain a permitted full snapshot or instead store a digest and approved-field evidence separately, then make the schema and retention behavior match that decision. Preserve the public CSV's full-row hash for integrity only if approved; a hash is not a substitute for retaining reviewable evidence.

## Remaining review questions

1. Does CPPA explicitly permit third parties to reuse/re-publish the registrant-submitted fields, including in a commercial public directory?
2. Are A/B/C/O allowed to be stored and redistributed by Unlisted, and are there additional form/portal terms not shown on the public download page?
3. May Unlisted retain full submitted rows for provenance, or must it retain only approved fields and a digest/reference?
4. What refresh/revision policy applies to the historical 2025 file, and how should corrected submissions be represented?

No request has been sent to CPPA. This document records public-source findings and a proposed minimization boundary; it is not a legal determination.
