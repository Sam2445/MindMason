
import { prisma } from "../utils/db.ts";

async function main() {
  console.log("Seeding bots...");
  const bots = [
    { username: "Bot_Beginner", skillRating: 800, isBot: true, passwordHash: "BOT", targetExam: "ALL" },
    { username: "Bot_Intermediate", skillRating: 1200, isBot: true, passwordHash: "BOT", targetExam: "ALL" },
    { username: "Bot_Advanced", skillRating: 1600, isBot: true, passwordHash: "BOT", targetExam: "ALL" },
    { username: "Bot_Expert", skillRating: 2000, isBot: true, passwordHash: "BOT", targetExam: "ALL" },
    { username: "Bot_Master", skillRating: 2400, isBot: true, passwordHash: "BOT", targetExam: "ALL" },
  ];

  for (const bot of bots) {
    try {
      // @ts-ignore
      await prisma.user.upsert({
        where: { username: bot.username },
        update: {},
        create: bot,
      });
      console.log(`Upserted bot: ${bot.username}`);
    } catch (e) {
      console.error(`Error upserting bot ${bot.username}:`, e);
    }
  }
  
  console.log("Bot seeding complete!");
}

main();
