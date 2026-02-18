// scripts/build.ts

async function run(cmd: string[]) {
  const p = new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    stdout: "inherit",
    stderr: "inherit",
  });
  const output = await p.output();
  if (!output.success) Deno.exit(output.code);
}

console.log("🚀 Starting Build Process...");

// 1. Generate Prisma Client
console.log("📦 Generating Prisma Client...");
await run(["deno", "run", "-A", "npm:prisma", "generate"]);

// 2. Fix CommonJS Issue
console.log("🔧 Fixing CommonJS Compatibility...");
const packagePath = "generated/client/package.json";

try {
  // Rename index.js -> index.cjs if needed
  // SKIPPED: Renaming causes issues with utils/db.ts import. 
  // We rely on package.json "type": "commonjs" instead.
  /*
  try {
    await Deno.rename(indexPath, indexCjsPath);
    console.log("  - Renamed index.js to index.cjs");
  } catch (e) { ... }
  */

  // Patch package.json
  const pkg = JSON.parse(await Deno.readTextFile(packagePath));
  let changed = false;

  if (pkg.type !== "commonjs") {
    pkg.type = "commonjs";
    changed = true;
  }
  
  // Ensure main points to index.js since we aren't renaming
  if (pkg.main !== "index.js") {
      pkg.main = "index.js";
      changed = true;
  }
  
  // Clean up exports if they point to .cjs (from previous runs or manual edits)
  if (pkg.exports) {
      // deno-lint-ignore no-explicit-any
      const fixExt = (obj: any) => {
          for (const key in obj) {
              if (typeof obj[key] === 'string') {
                  obj[key] = obj[key].replace(/\.cjs$/, ".js");
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                  fixExt(obj[key]);
              }
          }
      };
      fixExt(pkg.exports);
      changed = true; 
  }

  if (changed) {
    await Deno.writeTextFile(packagePath, JSON.stringify(pkg, null, 2));
    console.log("  - Updated package.json with type: commonjs");
  } else {
    console.log("  - package.json already patched.");
  }
} catch (e) {
  console.error("❌ Failed to patch Prisma Client:", e);
  Deno.exit(1);
}

// 3. Build Fresh App
console.log("🏗️  Building Fresh App...");
await run(["deno", "run", "-A", "--unstable-kv", "--unstable-detect-cjs", "dev.ts", "build"]);

console.log("✅ Build Complete!");
