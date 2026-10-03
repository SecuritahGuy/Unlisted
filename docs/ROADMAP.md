Yes. I started mapping this as a **data-ingestion problem first and a removal-automation problem second**, and that looks like the right approach.

One important correction from the earlier concept: we should **not scrape just one “master list.”** The strongest registry will combine authoritative government sources, open-source datasets, and direct verification against each broker's own privacy/opt-out page.

### The sources I would ingest

Our highest-trust sources should be government registries.

**California CPPA** should be Source #1. Its registry exposes the complete registration dataset as a download and includes much more than company names: broker websites, contact information, categories of information collected, who information is shared/sold to, and other disclosures. The current CPPA page is a little confusing because its 2026 display currently shows zero registrations while directing users to the businesses that operated as brokers in 2025; importantly, the historical 2024/2025 datasets remain downloadable. [California Privacy Protection Agency](https://cppa.ca.gov/data_broker_registry/?referral=lp-affiliate-promo-2f71ee960bd8\&utm_source=chatgpt.com)

[California Data Broker Registry](https://cppa.ca.gov/data_broker_registry/?referral=lp-affiliate-promo-2f71ee960bd8&utm_source=chatgpt.com)

**Oregon DFR** is particularly valuable because Oregon requires each broker to provide a short description of the methods consumers can use to opt out of collection, sale and licensing. That's exactly the metadata we need for building adapters. [Oregon Division of Financial Regulation](https://dfr.oregon.gov/business/licensing/data-broker-registry/Pages/index.aspx?utm_source=chatgpt.com)

[Oregon Data Broker Registry](https://dfr.oregon.gov/business/licensing/data-broker-registry/Pages/index.aspx?utm_source=chatgpt.com)

**Texas SOS** has a searchable central registry. Texas gives us legal name/contact information, data categories, transfer information, information about children's data, security-breach disclosures and additional broker-provided information. [Texas Secretary of State](https://www.sos.state.tx.us/statdoc/faqs4000.shtml?utm_source=chatgpt.com)

[Texas Data Broker Registry](https://www.sos.state.tx.us/statdoc/data-brokers.shtml?utm_source=chatgpt.com)

**Vermont SOS** is the fourth authoritative source. Vermont's registry is particularly useful historically because its broker-registration regime dates back further than the newer Oregon/Texas systems. [Vermont SOS](https://sos.vermont.gov/business-services/other-filings/data-broker?utm_source=chatgpt.com)

[Vermont Data Broker Registry](https://sos.vermont.gov/business-services/other-filings/data-broker?utm_source=chatgpt.com)

And there's a fifth useful government dataset: **California's old Attorney General registry**. Historical entries frequently contain the broker's website, privacy contact email and actual instructions/URLs for submitting CCPA requests. [California Attorney General](https://oag.ca.gov/data-brokers/common?combine=\&order=field_dbr_email\&page=13\&sort=asc\&utm_source=chatgpt.com)

### Someone has already proved our ingestion strategy works

Privacy Rights Clearinghouse did almost exactly the government-registry aggregation we're contemplating.

They combined **California CPPA + legacy California AG + Vermont + Texas + Oregon** and identified **750 unique broker groups** in their April 2025 dataset. They used direct CSV downloads for California, web scraping for Vermont and Texas, and multiple Oregon sources including license-portal XML. [Privacy Rights Clearinghouse](https://privacyrights.org/data-brokers?order=field_data_broker_allows_opt_out\&page=3\&sort=desc\&terms=\&utm_source=chatgpt.com)

That's extremely useful intelligence for us because it tells us where structured data exists and where scraping will be necessary.

There's also a fascinating finding in their data: registration lists differ substantially. Of those 750 groups, their 2025 snapshot found 459 registered in California, 441 Vermont, 275 Oregon and only 226 Texas. [Privacy Rights Clearinghouse](https://privacyrights.org/data-brokers?order=field_data_broker_allows_opt_out\&page=3\&sort=desc\&terms=\&utm_source=chatgpt.com)

So:

```text
CA ───────┐
OR ───────┤
TX ───────┼──► ENTITY RESOLUTION ──► MASTER BROKER
VT ───────┤
CA legacy ┘
```

rather than trusting any single state's list.

---

# Then augment government data with open datasets

This is where we can bootstrap incredibly quickly.

The `cvs0/Data-Brokers-List` project currently reports **1,122 privacy/opt-out targets**, including 165 people-search, 62 background-check, 171 marketing, 18 financial and 94 public-record targets. Its URLs were checked October 1, 2026. [GitHub](https://github.com/cvs0/Data-Brokers-List/?utm_source=chatgpt.com)

[Data-Brokers-List GitHub repository](https://github.com/cvs0/Data-Brokers-List/?utm_source=chatgpt.com)

Optery's public directory now reports **955 brokers** and provides categories and removal information; Optery says its open-source dataset includes direct opt-out links, instructions and contact information. [Optery](https://www.optery.com/opterys-open-source-data-broker-directory-is-now-live-on-github/?utm_source=chatgpt.com)

[Optery Data Broker Directory](https://www.optery.com/data-brokers/?utm_source=chatgpt.com)

There's another open directory currently reporting **1,002 entries**, including 359 people-search companies, 512 marketing brokers, 32 financial, 30 real-estate, 30 risk-mitigation, 25 recruitment and 14 health-related companies. [GitHub](https://github.com/OptOutRights/broker-directory?utm_source=chatgpt.com)

And Privacy Rights Clearinghouse lets us download its normalized 750-broker government dataset, although there's an important licensing consideration: it's **CC-BY-NC-SA 4.0** and explicitly tells commercial users to contact them if that license doesn't work for their implementation. Since we're contemplating ad revenue, I would use their dataset for **research and cross-validation**, not automatically incorporate it into our production database until we've resolved licensing. [Privacy Rights Clearinghouse](https://privacyrights.org/data-brokers?order=field_data_broker_allows_opt_out\&page=3\&sort=desc\&terms=\&utm_source=chatgpt.com)

That's exactly the sort of provenance our ingestion system should track.

---

# Our ingestion hierarchy

I'd assign every fact a source and confidence rather than indiscriminately merging everything:

```text
TIER 1 — AUTHORITATIVE
★★★★★

California CPPA
California AG legacy
Oregon DFR
Texas SOS
Vermont SOS
Broker's own website


TIER 2 — VERIFIED OPEN SOURCE
★★★★☆

Open-source broker directories
Maintained privacy projects


TIER 3 — SECONDARY
★★★☆☆

Privacy organizations
Published research


TIER 4 — DISCOVERY ONLY
★☆☆☆☆

Search engines
Blogs
Reddit
Old opt-out lists
```

And individual fields retain provenance:

```json
{
  "broker": "Example Data LLC",

  "website": {
    "value": "https://example.com",
    "source": "california_cppa",
    "verified": "2026-10-02"
  },

  "opt_out_url": {
    "value": "...",
    "source": "broker_website",
    "verified": "2026-10-02"
  }
}
```

That becomes extremely valuable later.

---

# Now: who should we actually remove people from?

There are really **two different universes**.

## A. People-search sites

These are our highest-priority automation targets because people actually see their information there.

The existing current dataset gives us an excellent initial list. [GitHub](https://github.com/cvs0/Data-Brokers-List/?utm_source=chatgpt.com)

| Target | Published removal mechanism | Initial automation assessment |
|---|---|---|
| BeenVerified | Opt-out search | 🟡 |
| Spokeo | Opt-out page | 🟢 |
| Whitepages | Suppression request | 🟡 |
| Intelius | PeopleConnect suppression | 🟡 |
| Instant Checkmate | PeopleConnect suppression | 🟡 |
| TruthFinder | Opt-out/suppression | 🟡 |
| CheckPeople | Opt-out | 🟢 candidate |
| MyLife | Privacy request | 🟡 |
| Nuwber | Removal URL | 🟢 candidate |
| TruePeopleSearch | Removal | 🟢 candidate |
| FastPeopleSearch | Opt-out | 🟢 candidate |
| PeopleFinders | Opt-out | 🟢 candidate |
| SmartBackgroundChecks | Opt-out | 🟢 candidate |
| FamilyTreeNow | Opt-out | 🟢 candidate |
| USPhoneBook | Opt-out | 🟢 candidate |
| Radaris | Privacy/control | 🟡 |

Those 🟢/🟡 labels are **engineering hypotheses, not verified classifications yet**. Our crawler needs to actually inspect each workflow before we assign the production value.

But there's an immediate optimization.

### Corporate families should be modeled

Intelius and Instant Checkmate, for example, point into the same PeopleConnect suppression infrastructure in the current dataset. [GitHub](https://github.com/cvs0/Data-Brokers-List/?utm_source=chatgpt.com)

Therefore don't model:

```text
Intelius adapter
InstantCheckmate adapter
PeopleLooker adapter
USSearch adapter
...
```

independently if they ultimately share infrastructure.

Model:

```text
Organization
    PeopleConnect

Brands
    ├── Intelius
    ├── Instant Checkmate
    ├── TruthFinder
    └── ...

Removal Provider
    └── PeopleConnect Suppression
```

Then one adapter potentially knocks out several brands.

That's a major efficiency gain.

---

# B. Traditional data brokers

Completely different removal strategy.

Companies like:

**Acxiom
Epsilon
LiveRamp
The Trade Desk
ZoomInfo**

aren't primarily public people-search pages.

Their published privacy mechanisms include dedicated privacy/DSR portals and advertising-choice mechanisms. [GitHub](https://github.com/cvs0/Data-Brokers-List/?utm_source=chatgpt.com)

Here our workflow becomes:

```text
Determine jurisdiction
        ↓
Determine applicable privacy right
        ↓
Broker DSR mechanism
        ↓
DELETE
+
OPT OUT OF SALE/SHARING
+
SUPPRESS FUTURE COLLECTION
        ↓
Identity verification
        ↓
Track response
```

We should distinguish those requests in our schema:

```typescript
enum PrivacyAction {
    DELETE,
    SUPPRESS,
    OPT_OUT_SALE,
    OPT_OUT_SHARE,
    ACCESS,
    CORRECT,
    LIMIT_SENSITIVE_DATA,
    GPC
}
```

A broker may support several simultaneously.

---

# California is special

For a California resident, we shouldn't run 600 individual automations if DROP can accomplish the same thing more reliably.

DROP now sends one request to **600+ registered brokers**, and since August 1, 2026 participating brokers have been required to retrieve deletion requests at least every 45 days. [privacy.ca.gov](https://privacy.ca.gov/drop/?utm_source=chatgpt.com)

So we'd detect:

```text
Resident = California
          ↓
       DROP?
       /   \
     YES    NO
      │
      ▼
Direct user to DROP
      │
      ▼
Run our people-search
removals separately
```

One limitation is crucial: the DROP API documentation we're seeing is **broker-facing**. It's designed for registered brokers to download hashed consumer deletion lists, match them against records, and upload results. It's not a public API through which our service can submit arbitrary consumer requests. [privacy.ca.gov](https://privacy.ca.gov/drop-for-data-brokers/technical-specifications/getting-started/?utm_source=chatgpt.com)

So we shouldn't architect around an imaginary consumer DROP API.

---

# I want our scraper to do more than collect names

This is where the project becomes really powerful.

For each government registry entry:

```text
INGEST
  │
  ├─ legal name
  ├─ DBA
  ├─ domain
  ├─ privacy policy
  ├─ privacy email
  ├─ opt-out URL
  ├─ state registrations
  ├─ data categories
  └─ declared practices
          │
          ▼
     DOMAIN CRAWLER
          │
          ├─ /privacy
          ├─ /privacy-policy
          ├─ /ccpa
          ├─ /your-privacy-choices
          ├─ /do-not-sell
          ├─ /opt-out
          └─ sitemap.xml
```

The crawler then classifies discovered endpoints:

```text
OPT_OUT_FORM
DSR_FORM
EMAIL
PHONE
MAIL
COOKIE_OPT_OUT
PEOPLE_SEARCH_REMOVAL
AUTHORIZED_AGENT
UNKNOWN
```

But **do not automatically submit anything during discovery**.

That's critical.

Crawling/classification is separate from executing a user-authorized privacy request.

---

# And I want a workflow analyzer

Once we discover an opt-out page, a controlled browser visits it and records what is required:

```text
Spokeo
──────────────

Search required:       YES
Listing URL required:  YES
Email required:        YES
Phone required:        NO
Address required:      NO

CAPTCHA:                YES
Email confirmation:    YES
Account required:      NO

Authorized agent:      UNKNOWN

Automation:
DISCOVERY               ✓
SUBMISSION              ?
VERIFICATION            USER
RECHECK                 ✓
```

Then calculate an **automation class**, rather than a subjective score/ranking:

```text
A0 — informational only
A1 — direct HTTP/API
A2 — browser form
A3 — browser + email verification
A4 — user interaction required
A5 — identity documentation required
A6 — manual/offline process
```

That's much more useful to our engine.

---

# There's another dataset I want to create

**Removal providers.**

Because I strongly suspect we'll discover that 1,000 "brokers" collapse into substantially fewer unique removal systems.

For example:

```text
BROKERS
1,100+
   │
   ▼
CORPORATE GROUPS
???
   │
   ▼
UNIQUE REMOVAL PORTALS
???
```

Finding that bottom number is extremely important.

If 1,100 brokers ultimately use, say, 250 unique workflows, we've dramatically reduced the engineering problem.

---

# Proposed production database

I would now change our original schema to something like:

```text
brokers
broker_aliases
broker_domains
corporate_groups

government_registrations
registration_sources

privacy_endpoints
privacy_actions

removal_providers
removal_workflows
workflow_steps

required_identifiers
verification_methods

adapter_versions
adapter_tests

scan_results
removal_requests
removal_events

evidence
monitoring_jobs
```

And every broker gets a globally unique ID independent of its name.

For example:

```text
broker_00000412

Legal name:
Example Data Holdings LLC

Brands:
ExamplePeople
FindAName
WhoLivesThere

Parent:
Example Holdings Inc.

Domains:
examplepeople.com
findaname.com

Registrations:
CA ✓
OR ✓
TX ✓
VT —

Removal provider:
privacy.exampleholdings.com

Adapter:
example-holdings-v2

Last tested:
2026-10-02
```

Now we're building an actual **privacy intelligence database**, not a spreadsheet.

---

# The ingestion pipeline I'd implement

```text
                 GOVERNMENT
        ┌──────────┼───────────┐
        CA         OR       TX / VT
        │          │           │
        └──────────┼───────────┘
                   ▼
             RAW INGESTION
                   │
                   ▼
            NORMALIZATION
                   │
                   ▼
           ENTITY RESOLUTION
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   Open-source             Broker
    datasets               websites
        │                     │
        └──────────┬──────────┘
                   ▼
             ENRICHMENT
                   │
                   ▼
          WORKFLOW ANALYSIS
                   │
                   ▼
            HUMAN REVIEW
                   │
                   ▼
             VERIFIED
                   │
                   ▼
             ADAPTER CI
```

Raw source records should **never be overwritten**. Normalize them into separate tables so when Texas changes something we can rerun entity resolution without destroying historical evidence.

---

## First concrete research backlog

We're now far enough along that I'd divide the next investigation into four datasets.

**Dataset 1 — Government Master Registry:** California CPPA + legacy CA AG + Oregon + Texas + Vermont. Deduplicate corporate entities while retaining every original registration.

**Dataset 2 — People Search Master List:** merge the 165+ known people-search targets with Optery's people-search catalog and government records, then resolve parent companies and shared removal systems.

**Dataset 3 — Removal Matrix:** for each high-priority target, actually inspect its current opt-out workflow and record required fields, verification, CAPTCHA, form technology, endpoints, authorized-agent support and automation class.

**Dataset 4 — Adapter Queue:** turn that research into something directly actionable:

```text
Broker             Discovery   Removal    Verify      Adapter
─────────────────────────────────────────────────────────────
Example A           Browser     HTTP       Email       A3
Example B           Browser     Browser    Recheck     A2
Example C           None        DSR form   Email       A3
Example D           Browser     Manual     Phone       A4
```

And I think **government master registry + people-search master list should become the first two actual datasets in the GitHub repo**, with automated source refreshes. The public website can then expose the same database.

One licensing point from this research is especially important: we'll keep **source/provenance/license metadata at the record level**. That lets an ad-supported hosted version exclude noncommercial-licensed derived records while the open research project can still reference compatible sources appropriately.

At this point I'd move from researching individual examples to **systematically enumerating the first ~200 high-value targets and their exact removal workflows**. That's where we'll discover how many genuinely unique adapters we need—and I suspect that number will be much smaller than the raw broker count.
