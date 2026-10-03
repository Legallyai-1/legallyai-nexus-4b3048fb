// Zero-credit autonomous release: audit, validate, sync Supabase, deploy to Vercel, smoke test, commit and push the current branch.
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
const run = (cmd, { optional = false } = {}) => {
  console.log(`\n> ${cmd}`);
  try {
    execSync(cmd, { stdio: "inherit" });
    return true;
  } catch {
    console.error(`FAILED: ${cmd}`);
    if (!optional) process.exit(1);
    return false;
  }
};
const out = (cmd) => execSync(cmd, { encoding: "utf-8" }).trim();
const tokenFlag = process.env.VERCEL_TOKEN ? ' --token "$VERCEL_TOKEN"' : "";

console.log("[1/7] Audit (legal disclaimers, AdSense, placeholders)");
const failures = [];
if (!readFileSync("src/components/layout/Footer.tsx", "utf-8").toLowerCase().includes("legal advice")) {
  failures.push("Footer is missing the 'not legal advice' disclaimer");
}
const adsTxt = readFileSync("public/ads.txt", "utf-8");
const clientId = readFileSync("src/lib/env.ts", "utf-8").match(/ca-pub-\d+/)?.[0];
if (!clientId || !adsTxt.includes(clientId.replace("ca-", ""))) {
  failures.push("public/ads.txt does not match the AdSense client ID in src/lib/env.ts");
}
if (/ca-pub-X{6,}/.test(execSync("git grep -I -h 'ca-pub-' -- src index.html || true", { encoding: "utf-8" }))) {
  failures.push("Placeholder AdSense client ID found in source");
}
if (failures.length) {
  failures.forEach((f) => console.error(`AUDIT FAIL: ${f}`));
  process.exit(1);
}
console.log("Audit passed.");

console.log("[2/7] Validate");
run("npm run validate:supabase-production");
run("npx tsc -p tsconfig.app.json --noEmit");
run("npm run lint", { optional: true });

console.log("[3/7] Supabase migrations");
if (process.env.SUPABASE_ACCESS_TOKEN) {
  run("node scripts/sync-supabase-migrations.mjs");
} else {
  console.log("No SUPABASE_ACCESS_TOKEN; skipping migrations.");
}

console.log("[4/7] Vercel build");
run(`npx --yes vercel@latest pull --yes --environment=production${tokenFlag}`);
run(`npx --yes vercel@latest build --prod${tokenFlag}`);

console.log("[5/7] Vercel deploy");
run(`npx --yes vercel@latest deploy --prebuilt --prod${tokenFlag}`);

console.log("[6/7] Live smoke test");
run("npm run smoke:live");

console.log("[7/7] Git");
// Tracked files only, on the current branch, so untracked secrets and .env files are never swept in.
run("git add -u");
if (out("git status --porcelain --untracked-files=no")) {
  run(`git commit -m "auto: release ${new Date().toISOString()}"`);
  run("git push", { optional: true });
} else {
  console.log("No tracked changes to commit.");
}

console.log("\nDone.");
