
import { prisma } from "./utils/db.ts";

async function main() {
  const count = await prisma.question.count();
  console.log("Total Questions:", count);
  
  const banking = await prisma.question.count({
    where: { category: { equals: "banking", mode: "insensitive" } }
  });
  console.log("Banking Questions:", banking);

  const categories = await prisma.question.findMany({ select: { category: true }, distinct: ['category'] });
  console.log("Categories:", categories.map(c => c.category));
}

main();
