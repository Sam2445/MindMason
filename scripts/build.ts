
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
const indexPath = "generated/client/index.js";
const indexCjsPath = "generated/client/index.cjs";
const packagePath = "generated/client/package.json";

try {
  // Rename index.js -> index.cjs if needed
  try {
    await Deno.rename(indexPath, indexCjsPath);
    console.log("  - Renamed index.js to index.cjs");
  } catch (e) {
    if (!(e instanceof Deno.errors.NotFound)) {
        // Only error if it's NOT a "not found" error. If it's effectively already renamed, we proceed.
        // But actually, generate creates index.js.
        console.log("  - index.js not found, skipping rename (or already renamed)."); 
    }
  }

  // Patch package.json
  const pkg = JSON.parse(await Deno.readTextFile(packagePath));
  if (pkg.type !== "commonjs") {
    pkg.type = "commonjs";
    pkg.main = "index.cjs";
    if (pkg.exports) {
        // recursive replace .js -> .cjs in exports
        const replaceExt = (obj: Record<string, unknown>) => {
            for (const key in obj) {
                if (typeof obj[key] === "string") {
                    obj[key] = (obj[key] as string).replace(/\.js$/, ".cjs");
                } else if (typeof obj[key] === "object" && obj[key] !== null) {
                    replaceExt(obj[key] as Record<string, unknown>);
                }
            }
        };
        replaceExt(pkg.exports as Record<string, unknown>);
    }
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
await run(["deno", "run", "-A", "--unstable-kv", "dev.ts", "build"]);

console.log("✅ Build Complete!");
