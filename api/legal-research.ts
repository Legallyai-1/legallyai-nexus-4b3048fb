import type { VercelRequest, VercelResponse } from '@vercel/node';

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';
const MAX_QUERY_LENGTH = 1000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;

const rateLimitEntries = new Map<string, { count: number; resetAt: number }>();

function getClientKey(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return ip || req.socket?.remoteAddress || 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitEntries.get(key);

  if (!entry || entry.resetAt <= now) {
    rateLimitEntries.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Legal research is temporarily unavailable.' });
  }

  const clientKey = getClientKey(req);
  if (isRateLimited(clientKey)) {
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
  if (!query) {
    return res.status(400).json({ error: 'Please enter a legal-information question.' });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return res.status(400).json({ error: `Please keep your question under ${MAX_QUERY_LENGTH} characters.` });
  }

  try {
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        temperature: 0.2,
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content:
              'You are LegallyAI, an educational legal-information assistant. Research reputable primary and official sources, including government, court, legislature, and bar-associated resources. Explain general legal information in plain language. Always identify the relevant jurisdiction when known, include direct source citations, distinguish general information from legal advice, and recommend consulting a licensed attorney for case-specific advice. Never predict case outcomes or tell the user to ignore deadlines.',
          },
          {
            role: 'user',
            content: query,
          },
        ],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error('Perplexity request failed', response.status, detail);
      return res.status(502).json({ error: 'The research service did not return a valid response.' });
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content;
    const citations = Array.isArray(data?.citations) ? data.citations : [];

    if (!answer) {
      return res.status(502).json({ error: 'The research service returned an empty response.' });
    }

    return res.status(200).json({
      answer,
      citations,
      disclaimer:
        'This is AI-generated legal information, not legal advice. Verify important information with the relevant court or government agency and consult a licensed attorney for advice about your situation.',
    });
  } catch (error) {
    console.error('Legal research error', error);
    return res.status(500).json({ error: 'Unable to complete the research request.' });
  }
}
