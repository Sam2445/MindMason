/// <reference lib="deno.unstable" />

export const kv = await Deno.openKv();

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface ExamSession {
  id: string;
  userId: string;
  examCategory: string;
  startTime: number; // timestamp
  answers: Record<string, number>; // questionId -> selectedOptionIndex
}

export interface ExamResult {
  id: string;
  userId: string;
  category: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number; // in seconds
  timestamp: string;
}

export async function saveExamResult(result: ExamResult) {
  const key = ["results", result.userId, result.category, result.timestamp];
  await kv.set(key, result);
  return result;
}

// Helper to seed some data if empty
export async function seedQuestionsIfEmpty() {
  const check = await kv.get(["questions", "upsc", "1"]);
  if (!check.value) {
    console.log("Seeding Database...");
    
    // UPSC Dummy
    for (let i = 1; i <= 5; i++) {
        await kv.set(["questions", "upsc", i.toString()], {
            id: i.toString(),
            text: `UPSC Sample Question ${i}: What is the capital of India?`,
            options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
            correctIndex: 1
        });
    }

    // SSC Dummy
     for (let i = 1; i <= 5; i++) {
        await kv.set(["questions", "ssc", i.toString()], {
            id: i.toString(),
            text: `SSC Sample Question ${i}: 2 + 2 = ?`,
            options: ["3", "4", "5", "6"],
            correctIndex: 1
        });
    }

    // HPTAT Dummy
    for (let i = 1; i <= 5; i++) {
        await kv.set(["questions", "hptat", String(i)], {
            id: String(i),
            text: `HPTAT Sample Question ${i}: Capital of Himachal Pradesh?`,
            options: ["Shimla", "Dharamshala", "Manali", "Kullu"],
            correctIndex: 0
        });
    }
  }
}
