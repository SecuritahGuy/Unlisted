interface SourceRow {
  source_id: string;
  name: string;
  publisher: string;
  source_kind: 'government-registry' | 'government-archive' | 'open-dataset' | 'research-reference';
  jurisdiction: string | null;
  description: string;
  source_url: string;
  license_status: 'unknown' | 'review-required' | 'approved' | 'restricted' | 'prohibited';
  refresh_policy: 'manual' | 'scheduled' | 'unknown';
}

function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { 'Cache-Control': 'public, max-age=60' },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    if (request.method !== 'GET') {
      return json({ error: 'Method not allowed.' }, 405);
    }

    try {
      if (url.pathname === '/api/sources') {
        const result = await env.DB.prepare(
          `SELECT source_id, name, publisher, source_kind, jurisdiction,
                  description, source_url, license_status, refresh_policy
           FROM sources
           ORDER BY CASE source_kind
             WHEN 'government-registry' THEN 0
             WHEN 'government-archive' THEN 1
             WHEN 'open-dataset' THEN 2
             ELSE 3
           END, name COLLATE NOCASE`,
        ).all<SourceRow>();
        return json({ sources: result.results });
      }

      if (url.pathname === '/api/summary') {
        const result = await env.DB.prepare(
          `SELECT
             (SELECT COUNT(*) FROM sources) AS source_count,
             (SELECT COUNT(DISTINCT b.broker_id)
                FROM brokers b
                JOIN government_registrations r ON r.broker_id = b.broker_id
                JOIN source_observations o ON o.observation_id = r.source_observation_id
                JOIN sources s ON s.source_id = o.source_id
               WHERE b.review_status = 'verified'
                 AND s.license_status = 'approved') AS verified_broker_count`,
        ).first<{ source_count: number; verified_broker_count: number }>();
        return json({
          source_count: result?.source_count ?? 0,
          verified_broker_count: result?.verified_broker_count ?? 0,
        });
      }

      return json({ error: 'Not found.' }, 404);
    } catch {
      return json({ error: 'Directory data is temporarily unavailable.' }, 503);
    }
  },
};
