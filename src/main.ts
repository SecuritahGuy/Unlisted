import { sources as fallbackSources, type SourceKind, type SourceRecord } from '../data/sources';
import { workflowSamples } from './workflows/samples';
import type { PrivacyAction, PublicWorkflowEvidenceV1 } from './workflows/contracts';
import './style.css';

type View = 'overview' | 'sources' | 'workflows' | 'method';
let activeView: View = 'overview';
let activeFilter = 'All sources';
let searchTerm = '';
let sourceCatalog: SourceRecord[] = [...fallbackSources];
let verifiedBrokerCount: number | null = null;

interface ApiSource {
  source_id: string;
  name: string;
  publisher: string;
  source_kind: 'government-registry' | 'government-archive' | 'open-dataset' | 'research-reference';
  jurisdiction: string | null;
  description: string;
  source_url: string;
  license_status: 'unknown' | 'review-required' | 'approved' | 'restricted' | 'prohibited';
}

const kindLabels: Record<ApiSource['source_kind'], SourceKind> = {
  'government-registry': 'Government registry',
  'government-archive': 'Government archive',
  'open-dataset': 'Open dataset',
  'research-reference': 'Research reference',
};

const licenseLabels: Record<ApiSource['license_status'], string> = {
  unknown: 'License unknown',
  'review-required': 'License review needed',
  approved: 'Reuse approved',
  restricted: 'Restricted use',
  prohibited: 'Reuse prohibited',
};

const icon = (name: string, size = 18) => {
  const paths: Record<string, string> = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    route:
      '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M9 6h2a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h1"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
    external:
      '<path d="M14 3h7v7M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? ''}</svg>`;
};

const navItems: { id: View; label: string; glyph: string; badge?: string }[] = [
  { id: 'overview', label: 'Overview', glyph: 'grid' },
  { id: 'sources', label: 'Source library', glyph: 'layers', badge: `${sourceCatalog.length}` },
  { id: 'workflows', label: 'Request paths', glyph: 'route', badge: `${workflowSamples.length}` },
  { id: 'method', label: 'Our method', glyph: 'route' },
];

const actionLabels: Record<PrivacyAction, string> = {
  delete: 'Delete personal data',
  suppress: 'Request a safety-based suppression',
  opt_out_sale_sharing: 'Opt out of sale or sharing',
  opt_out_direct_marketing: 'Opt out of direct marketing',
  opt_out_targeted_ads: 'Opt out of targeted ads',
  limit_sensitive_use: 'Limit sensitive data use',
  access: 'Request a copy of data',
  correct: 'Correct personal data',
  unknown: 'Check available privacy choices',
};

const brokerLabels: Record<string, string> = {
  epsilon: 'Epsilon',
  'lexisnexis-risk-solutions': 'LexisNexis Risk Solutions',
  'melissa-data-corporation': 'Melissa Data Corporation',
  'common-room': 'Common Room, Inc.',
  fullenrich: 'FullEnrich Corp',
};

function workflowCard(workflow: PublicWorkflowEvidenceV1): string {
  const sourceHost = new URL(workflow.evidence.sourceUrl).hostname;
  const reviewLabel =
    workflow.reviewStatus === 'stale'
      ? 'Needs recheck'
      : workflow.reviewStatus === 'human_verified'
        ? `Reviewed ${formatObservedDate(workflow.evidence.observedAt)}`
        : 'Not verified';
  return `<article class="workflow-card">
    <div class="workflow-card-top"><span class="workflow-broker">${escapeHtml(brokerLabels[workflow.subject.id] ?? workflow.subject.id)}</span><span class="workflow-reviewed">${escapeHtml(reviewLabel)}</span></div>
    <h2>${escapeHtml(actionLabels[workflow.action])}</h2>
    <div class="workflow-route">${escapeHtml(workflow.channel.replaceAll('_', ' '))}${workflow.jurisdiction ? ` · ${escapeHtml(workflow.jurisdiction)}` : ''}</div>
    <dl class="workflow-details">
      <div><dt>Scope</dt><dd>${escapeHtml(workflow.scopeSummary ?? 'See the provider’s instructions.')}</dd></div>
      ${workflow.verificationSummary ? `<div><dt>Verification</dt><dd>${escapeHtml(workflow.verificationSummary)}</dd></div>` : ''}
      ${workflow.limitationsSummary ? `<div><dt>Limits</dt><dd>${escapeHtml(workflow.limitationsSummary)}</dd></div>` : ''}
      <div><dt>Authorized agent</dt><dd>${workflow.agentSupport === 'yes' ? 'Provider describes an agent route' : workflow.agentSupport === 'no' ? 'Provider says agents are not accepted' : 'Not confirmed in reviewed instructions'}</dd></div>
    </dl>
    <div class="workflow-card-footer"><span>Source: ${escapeHtml(sourceHost)}</span><a href="${escapeHtml(safeExternalUrl(workflow.destinationUrl ?? workflow.evidence.sourceUrl))}" target="_blank" rel="noreferrer">Open provider instructions ${icon('external', 14)}</a></div>
  </article>`;
}

function workflowsPage(): string {
  const verifiedCount = workflowSamples.filter(
    (item) => item.reviewStatus === 'human_verified',
  ).length;
  return `<section class="page-intro"><div class="eyebrow">REQUEST PATHS <span class="eyebrow-count">${verifiedCount.toString().padStart(2, '0')} REVIEWED EXAMPLES</span></div><h1>One action<br /><em>at a time.</em></h1><p>These examples show how broker privacy routes differ. Read the scope and requirements, then continue directly with the provider. Unlisted does not submit requests.</p></section>
  <section class="workflow-list">${workflowSamples.map(workflowCard).join('')}</section>
  <aside class="workflow-disclaimer"><strong>Research sample, not a complete directory.</strong><span>Broker instructions can change. These cards summarize first-party request routes and do not claim current state registration. Vermont and Oregon registry searches need interactive human verification; we did not bypass those checks.</span></aside>`;
}

function sourceCard(source: SourceRecord, index: number): string {
  const kindClass =
    source.kind === 'Government registry' || source.kind === 'Government archive'
      ? 'government'
      : source.kind === 'Research reference'
        ? 'research'
        : 'open';
  const safeHref = safeExternalUrl(source.href);
  return `<article class="source-row" style="--row:${index}">
    <div class="source-mark ${kindClass}">${source.kind.startsWith('Government') ? 'G' : source.kind === 'Open dataset' ? 'O' : 'R'}</div>
    <div class="source-main"><div class="source-title-line"><h3>${escapeHtml(source.name)}</h3><span class="source-region">${escapeHtml(source.region)}</span></div><p>${escapeHtml(source.organization)}</p><span class="source-description">${escapeHtml(source.description)}</span></div>
    <div class="source-class"><span class="kind-pill ${kindClass}">${escapeHtml(source.kind)}</span><span class="signal">${escapeHtml(source.signal)}</span></div>
    <a class="source-link" href="${escapeHtml(safeHref)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(source.name)} source">${icon('external', 16)}</a>
  </article>`;
}

function filteredSources(): SourceRecord[] {
  const q = searchTerm.trim().toLowerCase();
  return sourceCatalog.filter((s) => {
    const matchesFilter =
      activeFilter === 'All sources' ||
      (activeFilter === 'Government'
        ? s.kind.startsWith('Government')
        : activeFilter === 'Open datasets'
          ? s.kind === 'Open dataset'
          : s.kind === 'Research reference');
    const matchesSearch =
      !q ||
      [s.name, s.organization, s.region, s.kind, s.description].some((value) =>
        value.toLowerCase().includes(q),
      );
    return matchesFilter && matchesSearch;
  });
}

function sourceList(): string {
  const records = filteredSources();
  return `<div class="source-list-head"><span>Source / publisher</span><span>Type &amp; review status</span><span></span></div>
  <div class="source-list">${records.length ? records.map(sourceCard).join('') : `<div class="empty-state">No sources match that search. Try a different name or category.</div>`}</div>`;
}

function overview(): string {
  return `<section class="welcome-row"><div><div class="eyebrow"><span class="live-dot"></span> THE OPEN PRIVACY INDEX</div><h1>Know where your data<br /><em>travels.</em></h1><p class="hero-copy">A clearer view of the companies collecting personal information—and the paths people can take to get it back.</p><div class="hero-actions"><button class="button button-dark" data-view="sources">Explore the sources ${icon('arrow', 16)}</button><a class="text-link" href="#method" data-view="method">How we build this ${icon('chevron', 15)}</a></div></div><div class="hero-art" aria-label="Abstract map of connected data sources"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit orbit-three"></div><div class="art-core"><span class="core-dot"></span><span>YOUR DATA</span></div><div class="art-node node-a">${icon('layers', 18)}</div><div class="art-node node-b">CA</div><div class="art-node node-c">OR</div><div class="art-node node-d">TX</div><div class="art-node node-e">VT</div><div class="art-caption">ONE PERSON. MANY TRAILS.</div></div></section>
  <section class="metrics" aria-label="Project progress"><article class="metric-card"><span class="metric-label">SOURCES IDENTIFIED</span><div class="metric-value">${sourceCatalog.length.toString().padStart(2, '0')}<span class="metric-unit">sources</span></div><div class="metric-foot"><span class="metric-icon green">${icon('layers', 16)}</span> Across public registries &amp; directories</div></article><article class="metric-card"><span class="metric-label">JURISDICTIONS IN SCOPE</span><div class="metric-value">04<span class="metric-unit">states</span></div><div class="metric-foot"><span class="metric-icon">${icon('route', 16)}</span> CA · OR · TX · VT</div></article><article class="metric-card metric-progress"><span class="metric-label">VERIFIED BROKER RECORDS</span><div class="metric-value">${verifiedBrokerCount === null ? '—' : verifiedBrokerCount.toLocaleString()}<span class="metric-unit">${verifiedBrokerCount === null ? 'loading' : 'verified'}</span></div><div class="progress-track"><span></span></div><div class="metric-foot">${verifiedBrokerCount === 0 ? 'Registry ingestion has not started' : 'Only verified records from approved sources are counted'}</div></article></section>
  <section class="sources-section"><div class="section-heading"><div><div class="eyebrow">THE FOUNDATION</div><h2>Sources before shortcuts.</h2><p>Every useful record starts with knowing where it came from.</p></div><button class="button button-light" data-view="sources">View source library ${icon('arrow', 15)}</button></div>
  <div class="source-tools"><label class="search-box">${icon('search', 17)}<input id="source-search" type="search" placeholder="Search sources, states, publishers..." value="${escapeHtml(searchTerm)}" /></label><div class="filter-pills">${['All sources', 'Government', 'Open datasets', 'Research'].map((f) => `<button class="filter-pill ${activeFilter === f ? 'selected' : ''}" data-filter="${f}">${f}</button>`).join('')}</div></div>
  <div id="source-results">${sourceList()}</div></section>
  <section class="principle-band"><div class="principle-icon">${icon('shield', 21)}</div><div><span class="eyebrow">A NOTE ON TRUST</span><h2>Discovery is not removal.</h2><p>We research and verify first. No request is submitted without a separate, explicit action from the person it concerns.</p></div><a href="#method" class="principle-link" data-view="method">Read our method ${icon('arrow', 15)}</a></section>`;
}

function sourcesPage(): string {
  return `<section class="page-intro"><div class="eyebrow">SOURCE LIBRARY <span class="eyebrow-count">${sourceCatalog.length.toString().padStart(2, '0')} CANDIDATES</span></div><h1>Evidence has<br /><em>a starting point.</em></h1><p>These are the registries, directories, and research references identified for the first ingestion phase. Listing here does not mean a source has been ingested or approved for reuse.</p></section><section class="sources-section library-section"><div class="source-tools"><label class="search-box">${icon('search', 17)}<input id="source-search" type="search" placeholder="Search sources, states, publishers..." value="${escapeHtml(searchTerm)}" /></label><div class="filter-pills">${['All sources', 'Government', 'Open datasets', 'Research'].map((f) => `<button class="filter-pill ${activeFilter === f ? 'selected' : ''}" data-filter="${f}">${f}</button>`).join('')}</div></div><div id="source-results">${sourceList()}</div><div class="license-note"><span class="license-mark">i</span><p><strong>License review is part of ingestion.</strong> Open and research datasets can have reuse restrictions. We’ll record source terms before copying or redistributing data.</p></div></section>`;
}

function methodPage(): string {
  return `<section class="page-intro"><div class="eyebrow">HOW WE BUILD THIS</div><h1>Make the trail<br /><em>traceable.</em></h1><p>A reliable privacy directory depends on more than collecting names. Each claim needs a source, a date, and a clear path back to the evidence.</p></section><section class="method-grid"><article class="method-card"><span class="step-number">01</span><div class="method-symbol">${icon('layers', 22)}</div><h2>Ingest the record</h2><p>Start with government registries and compatible public datasets. Keep each original observation so future changes can be compared.</p><span class="method-tag">SOURCE FIRST</span></article><article class="method-card"><span class="step-number">02</span><div class="method-symbol">${icon('route', 22)}</div><h2>Connect the entities</h2><p>Resolve legal entities, brands, domains, and shared removal providers without flattening their relationships.</p><span class="method-tag">EVIDENCE LINKED</span></article><article class="method-card"><span class="step-number">03</span><div class="method-symbol">${icon('shield', 22)}</div><h2>Verify the workflow</h2><p>Inspect public privacy paths and record what they require. Discovery stays read-only; a person remains in control of any request.</p><span class="method-tag">HUMAN IN CONTROL</span></article></section><section class="method-callout"><div class="callout-index">OUR RULE</div><p>We don't turn a discovered form into a submitted request. A person must explicitly authorize each action.</p></section><section class="sources-section method-sources"><div class="section-heading"><div><div class="eyebrow">THE EVIDENCE STANDARD</div><h2>Every field keeps its receipts.</h2><p>Source, license, confidence, and verification date travel with the data.</p></div></div><div class="evidence-example"><div class="evidence-top"><span class="evidence-label">FIELD PROVENANCE · EXAMPLE</span><span class="evidence-demo">ILLUSTRATIVE</span></div><div class="evidence-field"><span>opt_out_url</span><strong>https://broker.example/privacy</strong></div><div class="evidence-meta"><span>Source <b>Broker website</b></span><span>Verified <b>Not yet</b></span><span>Confidence <b>Unreviewed</b></span></div></div></section>`;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ??
      character,
  );
}

function safeExternalUrl(value: string): string {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? parsed.href : '#';
  } catch {
    return '#';
  }
}

function formatObservedDate(value: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value));
}

async function loadPublicDirectoryData(): Promise<void> {
  try {
    const [sourcesResponse, summaryResponse] = await Promise.all([
      fetch('/api/sources'),
      fetch('/api/summary'),
    ]);
    if (!sourcesResponse.ok || !summaryResponse.ok) return;
    const sourceData = (await sourcesResponse.json()) as { sources: ApiSource[] };
    const summary = (await summaryResponse.json()) as { verified_broker_count: number };
    if (!Array.isArray(sourceData.sources)) return;
    sourceCatalog = sourceData.sources.map((source) => ({
      id: source.source_id,
      name: source.name,
      organization: source.publisher,
      kind: kindLabels[source.source_kind],
      region: source.jurisdiction ?? 'Multi-region',
      description: source.description,
      href: source.source_url,
      signal: licenseLabels[source.license_status],
    }));
    verifiedBrokerCount = summary.verified_broker_count;
    render();
  } catch {
    // The bundled catalog remains available if the API cannot be reached.
  }
}

function render(focusHeading = false): void {
  const content =
    activeView === 'sources'
      ? sourcesPage()
      : activeView === 'workflows'
        ? workflowsPage()
        : activeView === 'method'
          ? methodPage()
          : overview();
  document.querySelector<HTMLDivElement>('#app')!.innerHTML =
    `<div class="app-shell"><aside class="sidebar"><a class="brand" href="#overview" data-view="overview"><span class="brand-mark"><span></span><span></span><span></span></span><span>unlisted<span class="brand-period">.</span></span></a><div class="workspace-label">PUBLIC DIRECTORY</div><nav class="main-nav" aria-label="Main navigation">${navItems.map((item) => `<button class="nav-item ${activeView === item.id ? 'active' : ''}" data-view="${item.id}" ${activeView === item.id ? 'aria-current="page"' : ''}><span class="nav-glyph">${icon(item.glyph, 17)}</span><span>${item.label}</span>${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="sidebar-status"><span class="status-mark"><span></span></span><div><strong>Research phase</strong><small>Registry ingestion next</small></div></div><a href="https://github.com/SecuritahGuy/Unlisted" class="github-link" target="_blank" rel="noreferrer">Open project on GitHub ${icon('external', 14)}</a><div class="sidebar-foot">BUILT FOR CLARITY <span>·</span> 2026</div></div></aside><main class="main-content"><header class="topbar"><div class="breadcrumb"><span>UNLISTED</span>${icon('chevron', 13)}<strong>${activeView === 'overview' ? 'Overview' : activeView === 'sources' ? 'Source library' : activeView === 'workflows' ? 'Request paths' : 'Our method'}</strong></div><div class="topbar-right"><span class="public-badge"><span></span> RESEARCH PREVIEW</span><button class="mobile-menu" aria-label="Open navigation">${icon('menu', 19)}</button><div class="avatar">U</div></div></header><div class="content-wrap">${content}<footer class="page-footer"><span>UNLISTED © 2026</span><span>Privacy intelligence, with receipts.</span><a href="https://github.com/SecuritahGuy/Unlisted" target="_blank" rel="noreferrer">Open source project ${icon('external', 13)}</a></footer></div></main></div>`;
  const pageHeading = document.querySelector<HTMLElement>('.content-wrap h1');
  pageHeading?.setAttribute('tabindex', '-1');
  if (focusHeading) pageHeading?.focus({ preventScroll: true });
  bindEvents();
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>('[data-view]').forEach((element) =>
    element.addEventListener('click', (event) => {
      event.preventDefault();
      activeView = element.dataset.view as View;
      if (activeView !== 'overview') searchTerm = '';
      render(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }),
  );
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((button) =>
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter ?? 'All sources';
      refreshSourceResults();
    }),
  );
  document.querySelector<HTMLInputElement>('#source-search')?.addEventListener('input', (event) => {
    searchTerm = (event.currentTarget as HTMLInputElement).value;
    refreshSourceResults();
  });
  document
    .querySelector<HTMLButtonElement>('.mobile-menu')
    ?.addEventListener('click', () => document.querySelector('.sidebar')?.classList.toggle('open'));
}

function refreshSourceResults(): void {
  const results = document.querySelector<HTMLDivElement>('#source-results');
  if (results) results.innerHTML = sourceList();
  document
    .querySelectorAll<HTMLButtonElement>('[data-filter]')
    .forEach((button) =>
      button.classList.toggle('selected', button.dataset.filter === activeFilter),
    );
}

render();
void loadPublicDirectoryData();
