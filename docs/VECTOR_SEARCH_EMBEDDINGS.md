# Documentation Vector Search with Embeddings

This project uses Supabase's embeddings generator to enable AI-powered vector similarity search across all documentation.

## Overview

The embeddings generator automatically:
- Converts all markdown files in `docs/` and `README.md` into vector embeddings
- Stores embeddings in your Supabase/Postgres database
- Enables semantic search capabilities for documentation
- Updates automatically when documentation changes

## How It Works

1. **Automatic Generation**: When you push changes to `docs/**` or `README.md`, GitHub Actions triggers the embeddings workflow
2. **OpenAI Processing**: Documents are processed using OpenAI's `text-embedding-3-small` model
3. **Storage**: Embeddings are stored in Supabase with metadata (path, content, checksum)
4. **Search**: Users can perform vector similarity search to find relevant documentation

## Setup

### Required GitHub Secrets

Configure these secrets in your repository (Settings → Secrets → Actions):

| Secret Name | Description | Where to Get |
|------------|-------------|--------------|
| `VITE_SUPABASE_URL` | Supabase project URL | Already configured |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (admin access) | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI API key | https://platform.openai.com/api-keys |

### Get Your Keys

**Supabase Service Role Key:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to Settings → API
4. Copy the `service_role` key (keep this secret!)

**OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "LegallyAI Embeddings"
4. Copy the key (shown only once)

### Database Setup

The embeddings generator requires specific database tables. Follow the setup from the [headless-vector-search](https://github.com/supabase-community/headless-vector-search) repository:

1. **Create the embeddings table:**

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table for embeddings
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- For text-embedding-3-small
  metadata JSONB,
  checksum TEXT,
  path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on path for efficient lookups
CREATE INDEX ON documents (path);
```

2. **Create similarity search function:**

```sql
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(1536),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  path TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    documents.path,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
```

## Workflow Configuration

The workflow is configured in `.github/workflows/generate-embeddings.yml`:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'docs/**'
      - 'README.md'
  workflow_dispatch:  # Manual trigger
```

**Triggers:**
- Automatic: When documentation files change on `main` branch
- Manual: Via GitHub Actions tab → "Generate Documentation Embeddings" → Run workflow

## Embedding Model

We use `text-embedding-3-small` which offers:
- **Dimensions:** 1536
- **Cost:** $0.02 per 1M tokens (~$0.0001 per doc)
- **Performance:** Fast and efficient for documentation
- **Quality:** Good semantic understanding

**Alternative models:**
- `text-embedding-3-large` - Higher quality, higher cost (3072 dimensions)
- `text-embedding-ada-002` - Legacy model (1536 dimensions)

To change the model, update the workflow:

```yaml
embedding-model: 'text-embedding-3-large'
```

And update the database:

```sql
ALTER TABLE documents ALTER COLUMN embedding TYPE VECTOR(3072);
```

## Using the Embeddings

### Frontend Search Implementation

Add to your application to enable documentation search:

```typescript
import { supabase } from '@/integrations/supabase/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side (use edge function in production)
});

async function searchDocs(query: string) {
  // 1. Generate embedding for search query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  
  const queryEmbedding = embeddingResponse.data[0].embedding;
  
  // 2. Search for similar documents
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.78, // Similarity threshold (0-1)
    match_count: 5 // Number of results
  });
  
  if (error) {
    console.error('Search error:', error);
    return [];
  }
  
  return data;
}
```

### Edge Function for Search

**Better approach:** Create a Supabase Edge Function to keep API keys secure:

`supabase/functions/search-docs/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    // Generate embedding
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!,
    });
    
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });
    
    const queryEmbedding = embeddingResponse.data[0].embedding;
    
    // Search documents
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.78,
      match_count: 5,
    });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ results: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Cost Estimation

Based on your current documentation (~2,600 lines):

**Initial Generation:**
- ~12 documents × ~500 tokens/doc = ~6,000 tokens
- Cost: ~$0.0001 (essentially free)

**Monthly Updates:**
- Assuming 10 doc updates/month: ~$0.001/month
- Annual cost: ~$0.01/year

**Search Queries:**
- Per query: 1 embedding generation = ~$0.00002
- 1,000 queries/month: ~$0.02/month

**Total estimated cost:** < $0.05/month 💰

## Monitoring

### Check Embeddings Status

**Via Supabase Dashboard:**
1. Go to Table Editor → `documents` table
2. View all generated embeddings
3. Check `created_at` and `updated_at` timestamps

**Via SQL:**

```sql
-- Count total embeddings
SELECT COUNT(*) FROM documents;

-- Recent embeddings
SELECT path, created_at, updated_at 
FROM documents 
ORDER BY updated_at DESC 
LIMIT 10;

-- Check embedding dimensions
SELECT path, array_length(embedding, 1) as dimensions
FROM documents
LIMIT 5;
```

### GitHub Actions Logs

1. Go to Actions tab in repository
2. Click "Generate Documentation Embeddings"
3. View workflow runs and logs

## Troubleshooting

### Embeddings Not Generated

1. **Check GitHub Actions logs** for errors
2. **Verify secrets** are set correctly
3. **Check database** has required tables and functions
4. **Verify OpenAI API key** has credits

### Search Not Working

1. **Check function exists:** `SELECT * FROM pg_proc WHERE proname = 'match_documents';`
2. **Verify pgvector extension:** `SELECT * FROM pg_extension WHERE extname = 'vector';`
3. **Test query directly:** `SELECT * FROM match_documents('[0.1, 0.2, ...]', 0.5, 5);`

### Rate Limits

OpenAI rate limits (free tier):
- 3 requests/minute
- 200 requests/day

If you hit limits:
- Upgrade OpenAI plan
- Reduce update frequency
- Batch document updates

## Best Practices

1. **Keep docs organized:** Use clear directory structure
2. **Good content:** Well-written docs = better search results
3. **Regular updates:** Push changes to keep embeddings current
4. **Monitor costs:** Check OpenAI usage monthly
5. **Test search:** Verify results are relevant

## Related Documentation

- [Supabase Embeddings Generator](https://github.com/supabase/embeddings-generator)
- [Headless Vector Search](https://github.com/supabase-community/headless-vector-search)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

---

**Last Updated:** 2026-02-09  
**Model:** text-embedding-3-small  
**Workflow:** `.github/workflows/generate-embeddings.yml`
