/**
 * scripts/sync-railway.js
 *
 * Node script to call the Railway API and then POST to a Supabase edge function.
 *
 * Required env:
 * - RAILWAY_API_TOKEN
 * - RAILWAY_PROJECT_ID
 * - RAILWAY_ENVIRONMENT_ID
 * - SUPABASE_FUNCTION_URL
 */

import fetch from 'node-fetch';

const RAILWAY_API = 'https://backboard.railway.app/graphql/v1';

const {
  RAILWAY_API_TOKEN,
  RAILWAY_PROJECT_ID,
  RAILWAY_ENVIRONMENT_ID,
  SUPABASE_FUNCTION_URL,
} = process.env;

if (!RAILWAY_API_TOKEN || !RAILWAY_PROJECT_ID || !RAILWAY_ENVIRONMENT_ID || !SUPABASE_FUNCTION_URL) {
  console.error('Missing required env vars. See README or .env.example');
  process.exit(1);
}

async function fetchRailwayDeployments() {
  const query = `
    query GetDeployments($projectId: String!, $environmentId: String!) {
      project(id: $projectId) {
        environment(id: $environmentId) {
          deployments {
            edges {
              node {
                id
                status
                createdAt
                updatedAt
                meta
              }
            }
          }
        }
      }
    }
  `;

  const body = JSON.stringify({
    query,
    variables: {
      projectId: RAILWAY_PROJECT_ID,
      environmentId: RAILWAY_ENVIRONMENT_ID,
    },
  });

  const res = await fetch(RAILWAY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RAILWAY_API_TOKEN}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Railway API error: ${res.status} ${text}`);
  }

  const json = await res.json();
  return json.data;
}

async function callSupabaseFunction(payload) {
  const res = await fetch(SUPABASE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase function error: ${res.status} ${text}`);
  }

  return res.json();
}

(async () => {
  try {
    console.log('Fetching Railway deployments...');
    const data = await fetchRailwayDeployments();

    const edges = data?.project?.environment?.deployments?.edges || [];
    const deployments = edges.map(e => e.node);
    console.log(`Found ${deployments.length} deployments`);

    const payload = { 
      project_id: RAILWAY_PROJECT_ID, 
      environment_id: RAILWAY_ENVIRONMENT_ID, 
      deployments 
    };

    console.log('Calling Supabase function at', SUPABASE_FUNCTION_URL);
    const out = await callSupabaseFunction(payload);
    console.log('Supabase function response:', out);
  } catch (err) {
    console.error('Error during sync:', err.message || err);
    process.exit(2);
  }
})();
