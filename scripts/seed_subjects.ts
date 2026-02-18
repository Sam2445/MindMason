
import { addQuestion, Question, prisma } from "../utils/db.ts";
import { EXAM_SUBJECTS } from "../utils/subjects.ts";

// Helper to generate dummy math questions
function generateMathQuestion(category: string, subject: string, index: number): Question {
  const a = Math.floor(Math.random() * 100) + 1;
  const b = Math.floor(Math.random() * 100) + 1;
  const ops = ["+", "-", "*"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  
  let ans = 0;
  if (op === "+") ans = a + b;
  if (op === "-") ans = a - b;
  if (op === "*") ans = a * b;

  const options = new Set<number>();
  options.add(ans);
  while(options.size < 4) {
      options.add(ans + Math.floor(Math.random() * 20) - 10);
  }
  
  return {
    id: crypto.randomUUID(),
    category,
    subject,
    text: `Q${index}: What is ${a} ${op} ${b}?`,
    options: Array.from(options).sort(() => Math.random() - 0.5).map(String),
    correctIndex: Array.from(options).indexOf(ans),
    explanation: `The correct answer is ${ans}.`,
    difficulty: "EASY"
  };
}

// Helper to generate dummy generic questions
function generateGenericQuestion(category: string, subject: string, label: string, index: number): Question {
    const options = [
        `Option A for ${label} ${index}`,
        `Option B for ${label} ${index}`,
        `Option C for ${label} ${index}`,
        `Option D for ${label} ${index}`,
    ];
    // Randomize correct index
    const correct = Math.floor(Math.random() * 4);
    
    return {
        id: crypto.randomUUID(),
        category,
        subject,
        text: `Mock Question ${index} for ${label} (${category}): What is the correct option?`,
        options: options,
        correctIndex: correct,
        explanation: `This is a mock explanation for question ${index} in ${label}.`,
        difficulty: "MEDIUM"
    };
}

async function main() {
  console.log("🚀 Starting Subject Seeding...");

  // @ts-ignore
  for (const examKey in EXAM_SUBJECTS) {
      // @ts-ignore
      const exam = EXAM_SUBJECTS[examKey];
      console.log(`\nProcessing Exam Category: ${exam.examLabel} (${exam.examId})`);
      
      for (const subject of exam.subjects) {
          // Check count
          // @ts-ignore
          const count = await prisma.question.count({
              where: {
                  category: { equals: exam.examId, mode: "insensitive" },
                  subject: { equals: subject.id, mode: "insensitive" }
              }
          });
          
          console.log(`  - ${subject.label} (${subject.id}): Found ${count} questions.`);
          
          if (count < 50) {
              const needed = 50 - count;
              console.log(`    -> Generating ${needed} questions...`);
              
              for (let i = 0; i < needed; i++) {
                  let q: Question;
                  if (subject.id.includes("quantitative") || subject.id.includes("math") || subject.id.includes("reasoning")) {
                      q = generateMathQuestion(exam.examId, subject.id, i + 1 + count);
                  } else {
                      q = generateGenericQuestion(exam.examId, subject.id, subject.label, i + 1 + count);
                  }
                  
                  try {
                      await addQuestion(q);
                  } catch (e) {
                      console.error(`Failed to add question`, e);
                  }
              }
          }
      }
  }

  console.log("\n🎉 Subject Seeding Complete!");
}

main();
