
import { prisma, getRandomQuestions } from "../utils/db.ts";

async function main() {
  const duels = await prisma.duel.findMany({
    where: { 
        status: { in: ["WAITING", "ACTIVE"] },
        questions: { equals: "[]" }
    }
  });

  console.log(`Found ${duels.length} duels with empty questions.`);

  for (const duel of duels) {
    // try fetching with case insensitive
    const questions = await getRandomQuestions(duel.category, 5);
    
    if (questions.length > 0) {
        // @ts-ignore
        await prisma.duel.update({
            where: { id: duel.id },
            data: {
                questions: JSON.stringify(questions)
            }
        });
        console.log(`Fixed duel ${duel.id} with ${questions.length} questions.`);
    } else {
        console.log(`Could not find questions for category ${duel.category} (duel ${duel.id})`);
    }
  }
}

main();
