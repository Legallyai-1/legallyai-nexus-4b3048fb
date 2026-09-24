const baseUrl = (process.env.SMOKE_BASE_URL || "https://www.legallyai.ai").replace(/\/$/, "");
const supabaseUrl = (process.env.VITE_SUPABASE_URL || "https://whdljtbtqisoszbrzdwq.supabase.co").replace(/\/$/, "");

const checks = [
  { name: "homepage", url: `${baseUrl}/`, expected: [200] },
  { name: "auth route", url: `${baseUrl}/auth`, expected: [200] },
  { name: "pricing route", url: `${baseUrl}/pricing`, expected: [200] },
  { name: "dashboard route", url: `${baseUrl}/dashboard`, expected: [200] },
  { name: "lawyer route", url: `${baseUrl}/lawyer`, expected: [200] },
  { name: "AdSense authorization", url: `${baseUrl}/ads.txt`, expected: [200] },
  { name: "Stripe webhook route", url: `${baseUrl}/api/webhooks/stripe`, expected: [405] },
  { name: "Supabase REST protection", url: `${supabaseUrl}/rest/v1/`, expected: [401] },
  { name: "Supabase JWKS", url: `${supabaseUrl}/auth/v1/.well-known/jwks.json`, expected: [200] },
];

let failures = 0;

for (const check of checks) {
  try {
    const response = await fetch(check.url, { redirect: "manual" });
    const passed = check.expected.includes(response.status);
    console.log(`${passed ? "PASS" : "FAIL"} ${check.name}: ${response.status}`);
    if (!passed) failures += 1;
  } catch (error) {
    failures += 1;
    console.log(`FAIL ${check.name}: ${error instanceof Error ? error.message : "request failed"}`);
  }
}

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`All ${checks.length} smoke checks passed.`);
}