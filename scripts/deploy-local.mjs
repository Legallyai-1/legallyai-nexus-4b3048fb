import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const stop = (message) => { console.error(message); process.exit(1); };
const output = (command, args) => execFileSync(command, args, { encoding: "utf-8" }).trim();
const run = (command, args) => {
  console.log(`\n> ${command} ${args.join(" ")}`);
  execFileSync(command, args, { stdio: "inherit" });
};
const assertClean = () => {
  if (output("git", ["status", "--porcelain", "--untracked-files=normal"])) {
    stop("Release blocked: commit approved changes and resolve untracked files before releasing. No files are staged automatically.");
  }
};

try {
  if (!process.argv.includes("--production")) {
    stop("Production release is opt-in. After reviewing the exact commit, run: npm run deploy:local -- --production. This script does not start autonomous coding agents.");
  }
  if (output("git", ["branch", "--show-current"]) !== "main") stop("Release blocked: checkout main first.");
  const remote = output("git", ["remote", "get-url", "origin"]);
  if (!/^(https:\/\/github\.com\/|git@github\.com:)Legallyai-1\/legallyai-nexus-4b3048fb(?:\.git)?\/?$/.test(remote)) {
    stop("Release blocked: origin is not the approved LegallyAI GitHub repository.");
  }
  assertClean();
  const commit = output("git", ["rev-parse", "HEAD"]);
  console.log(`Releasing committed source: ${commit}`);

  const footer = readFileSync("src/components/layout/Footer.tsx", "utf-8");
  if (!footer.toLowerCase().includes("legal advice")) stop("Audit failed: footer disclaimer is missing.");
  const adsTxt = readFileSync("public/ads.txt", "utf-8");
  const clientId = readFileSync("src/lib/env.ts", "utf-8").match(/ca-pub-\d+/)?.[0];
  if (!clientId || !adsTxt.includes(clientId.replace("ca-", ""))) stop("Audit failed: AdSense publisher IDs do not match.");
  const source = output("git", ["grep", "-I", "-h", "ca-pub-", "--", "src", "index.html"]);
  if (/ca-pub-X{6,}/.test(source)) stop("Audit failed: placeholder AdSense publisher ID found.");

  run("npm", ["run", "validate:supabase-production"]);
  run("npx", ["tsc", "-p", "tsconfig.app.json", "--noEmit"]);
  run("npm", ["run", "lint"]);
  run("npx", ["--yes", "vercel@latest", "pull", "--yes", "--environment=production"]);
  const project = JSON.parse(readFileSync(".vercel/project.json", "utf-8"));
  if (project.projectId !== "prj_KSzIDIhU2EzZo8Fr24KQOMogqEmZ" || project.orgId !== "team_ACIjhOlfoTDfEvu93dbW4ThU") {
    stop("Release blocked: Vercel is linked to a different project or team.");
  }
  run("npx", ["--yes", "vercel@latest", "build", "--prod"]);
  assertClean();
  if (output("git", ["rev-parse", "HEAD"]) !== commit) stop("Release blocked: HEAD changed during validation.");

  run("git", ["push", "origin", "HEAD:refs/heads/main"]);
  const published = output("git", ["ls-remote", "origin", "refs/heads/main"]).split(/\s+/)[0];
  if (published !== commit) stop("Release blocked: GitHub main does not match the validated commit.");
  assertClean();
  if (output("git", ["rev-parse", "HEAD"]) !== commit) stop("Release blocked: HEAD changed before deployment.");
  run("npx", ["--yes", "vercel@latest", "deploy", "--prebuilt", "--prod"]);
  run("npm", ["run", "smoke:live"]);
  console.log(`Frontend release and configured smoke checks completed for ${commit}.`);
  console.log("Supabase migrations and Edge Functions were not deployed. Review and deploy those separately. This is not proof that all application features or mobile builds work.");
} catch (error) {
  console.error("Release failed; do not treat it as complete.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
