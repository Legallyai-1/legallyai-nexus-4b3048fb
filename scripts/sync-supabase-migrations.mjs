import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";

const projectRef = process.env.SUPABASE_PROJECT_REF || "whdljtbtqisoszbrzdwq";
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!accessToken) {
  console.error("SUPABASE_ACCESS_TOKEN is required to sync migrations.");
  process.exit(1);
}

async function query(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const result = await response.json();
  if (!response.ok || (result && typeof result.message === "string")) {
    throw new Error(result.message || `Supabase Management API returned ${response.status}`);
  }
  return result;
}

try {
  const applied = new Set(
    (await query("select version from supabase_migrations.schema_migrations")).map((row) => row.version),
  );
  const latestApplied = [...applied].sort().at(-1) || "";
  const files = (await readdir("supabase/migrations"))
    .filter((file) => file.endsWith(".sql") && file.split("_")[0] > latestApplied && !applied.has(file.split("_")[0]))
    .sort();

  for (const file of files) {
    const [version, ...nameParts] = file.replace(/\.sql$/, "").split("_");
    console.log(`Applying ${file}`);
    await query(await readFile(`supabase/migrations/${file}`, "utf8"));
    const name = nameParts.join("_").replaceAll("'", "''");
    await query(`insert into supabase_migrations.schema_migrations(version, name) values ('${version}', '${name}') on conflict do nothing`);
  }

  if (files.length === 0) console.log("No pending Supabase migrations.");
  await query("NOTIFY pgrst, 'reload schema'");
} catch (error) {
  console.error(`Supabase migration sync failed: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exit(1);
}