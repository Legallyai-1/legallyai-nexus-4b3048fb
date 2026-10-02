// Zero-credit local release: validate, build, deploy to Vercel, sync Supabase, smoke test, commit and push the current branch.
import { execSync } from "node:child_process";

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

console.log("[1/6] Validate");
run("npm run validate:supabase-production");
run("npx tsc -p tsconfig.app.json --noEmit");
run("npm run lint", { optional: true });

console.log("[2/6] Supabase");
if (process.env.SUPABASE_DB_PASSWORD) {
  run("npx supabase db push --yes");
} else {
  console.log("SUPABASE_DB_PASSWORD not set; skipping db push.");
}

console.log("[3/6] Vercel build");
run(`npx vercel pull --yes --environment=production${tokenFlag}`);
run(`npx vercel build --prod${tokenFlag}`);

console.log("[4/6] Vercel deploy");
run(`npx vercel deploy --prebuilt --prod${tokenFlag}`);

console.log("[5/6] Live smoke test");
run("npm run smoke:live", { optional: true });

console.log("[6/6] Git");
// Tracked files only, on the current branch, so untracked secrets and .env files are never swept in.
run("git add -u");
if (out("git status --porcelain --untracked-files=no")) {
  run(`git commit -m "auto: local release ${new Date().toISOString()}"`);
  run("git push", { optional: true });
} else {
  console.log("No tracked changes to commit.");
}

console.log("\nDone.");
