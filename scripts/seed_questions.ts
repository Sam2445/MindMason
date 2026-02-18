// Master seed script - uses raw SQL to bypass Prisma client validation issues
import { prisma } from "../utils/db.ts";
import { bankingQuestions } from "./seeds/banking.ts";
import { sscQuestions } from "./seeds/ssc.ts";
import { upscQuestions } from "./seeds/upsc.ts";
import { railwaysQuestions } from "./seeds/railways.ts";
import { defenceQuestions } from "./seeds/defence.ts";

interface SeedQuestion {
  category: string;
  subject: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  difficulty?: string;
}

async function seed() {
  console.log("🌱 Starting comprehensive seed...\n");

  const allQuestions: SeedQuestion[] = [
    ...bankingQuestions,
    ...sscQuestions,
    ...upscQuestions,
    ...railwaysQuestions,
    ...defenceQuestions,
  ];

  // Group by category+subject for logging
  const groups: Record<string, number> = {};
  for (const q of allQuestions) {
    const key = `${q.category}/${q.subject}`;
    groups[key] = (groups[key] || 0) + 1;
  }

  console.log("📊 Question Summary:");
  for (const [key, count] of Object.entries(groups).sort()) {
    console.log(`   ${key}: ${count} questions`);
  }
  console.log(`   TOTAL: ${allQuestions.length} questions\n`);

  // Use raw SQL to insert questions (bypasses Prisma client validation)
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const q of allQuestions) {
    try {
      // Check if question already exists
      // @ts-ignore: Prisma raw query
      const existing = await prisma.$queryRaw`
        SELECT id FROM "Question" WHERE text = ${q.text} AND category = ${q.category} LIMIT 1
      `;

      // @ts-ignore: raw query returns array
      if (existing && existing.length > 0) {
        skipped++;
        continue;
      }

      const id = crypto.randomUUID();
      const optionsJson = JSON.stringify(q.options);
      const explanation = q.explanation || null;
      const difficulty = q.difficulty || "MEDIUM";

      // @ts-ignore: Prisma raw query
      await prisma.$executeRaw`
        INSERT INTO "Question" (id, category, subject, text, options, "correctIndex", explanation, difficulty, "createdAt")
        VALUES (${id}, ${q.category}, ${q.subject}, ${q.text}, ${optionsJson}, ${q.correctIndex}, ${explanation}, ${difficulty}, NOW())
      `;
      created++;
    } catch (e) {
      errors++;
      if (errors <= 5) {
        console.error(`❌ Failed: "${q.text.substring(0, 50)}..."`, e);
      }
    }
  }

  if (errors > 5) {
    console.log(`   ... and ${errors - 5} more errors`);
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   Created: ${created}`);
  console.log(`   Skipped (duplicates): ${skipped}`);
  console.log(`   Errors: ${errors}`);
}

seed()
  .then(() => {
    console.log("\n🎉 All done!");
    Deno.exit(0);
  })
  .catch((e) => {
    console.error("Fatal error during seeding:", e);
    Deno.exit(1);
  });
