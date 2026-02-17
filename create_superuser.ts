
import { createRequire } from "node:module";
import * as bcrypt from "npm:bcryptjs";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("./generated/client/index.cjs");
const prisma = new PrismaClient();

const username = Deno.args[0];
const password = Deno.args[1];

if (!username || !password) {
  console.log("Usage: deno run -A --unstable-kv create_superuser.ts <username> <password>");
  Deno.exit(1);
}

// Generate Hash
console.log(`Creating Superuser: ${username}`);
const hash = await bcrypt.hash(password, 10);

try {
  const user = await prisma.user.upsert({
    where: { username },
    update: {
        passwordHash: hash,
        role: "SUPERUSER"
    },
    create: {
      username,
      passwordHash: hash,
      role: "SUPERUSER"
    }
  });
  console.log(`✅ Superuser '${user.username}' created successfully!`);
} catch (e) {
  console.error("❌ Error creating user:", e);
} finally {
  await prisma.$disconnect();
}
