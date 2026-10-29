import type { VercelRequest, VercelResponse } from '@vercel/node';

// Minimal CSP violation sink. Logs a trimmed, query-stripped summary to Vercel function logs.
// Accepts legacy report-uri (application/csp-report) and Reporting API (application/reports+json).
const MAX_BYTES = 64 * 1024;
const MAX_REPORTS = 20;

const stripQuery = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const v = value.slice(0, 500);
  try {
    const u = new URL(v);
    return `${u.origin}${u.pathname}`;
  } catch {
    return v.split(/[?#]/)[0]; // 'inline', 'eval', 'data', etc.
  }
};

async function readBody(req: VercelRequest): Promise<string> {
  const b: unknown = (req as any).body;
  if (typeof b === 'string') return b.slice(0, MAX_BYTES);
  if (Buffer.isBuffer(b)) return b.subarray(0, MAX_BYTES).toString('utf8');
  if (b && typeof b === 'object') return JSON.stringify(b).slice(0, MAX_BYTES);
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX_BYTES) break;
    chunks.push(buf);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const len = Number(req.headers['content-length'] ?? 0);
  if (len > MAX_BYTES) return res.status(413).end();

  let parsed: unknown;
  try {
    parsed = JSON.parse(await readBody(req));
  } catch {
    return res.status(400).end();
  }

  const items: any[] = Array.isArray(parsed) ? parsed : [parsed];
  for (const item of items.slice(0, MAX_REPORTS)) {
    const r = item?.['csp-report'] ?? item?.body ?? item ?? {};
    console.log('[csp-report]', JSON.stringify({
      mode: r.disposition ?? 'report',
      directive: String(r['effective-directive'] ?? r.effectiveDirective ?? r['violated-directive'] ?? '').slice(0, 100),
      blocked: stripQuery(r['blocked-uri'] ?? r.blockedURL),
      page: stripQuery(r['document-uri'] ?? r.documentURL ?? item?.url),
      source: stripQuery(r['source-file'] ?? r.sourceFile),
      line: Number(r['line-number'] ?? r.lineNumber) || undefined,
    }));
  }
  return res.status(204).end();
}
