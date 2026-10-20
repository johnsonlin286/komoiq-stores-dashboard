// Runs the sample-data generators in the order they depend on each other:
// Layar B first, then Layar A (which draws its tasks from Layar B's
// Pondok Indah products — see generate-layar-a-data.mjs).
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));

for (const script of ["generate-layar-b-data.mjs", "generate-layar-a-data.mjs"]) {
  execFileSync(process.execPath, [path.join(root, script)], { stdio: "inherit" });
}
