/// <reference lib="deno.unstable" />

export const kv = await Deno.openKv();

export interface Question {
  id: string;
  category: string; // Added category
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

export async function addQuestion(question: Question) {
  const key = ["questions", question.category, question.id];
  await kv.set(key, question);
  return question;
}

// Helper to seed some data if empty
export async function seedQuestionsIfEmpty() {
  const check = await kv.get(["questions", "upsc", "1"]);
  if (!check.value) {
    console.log("Seeding Database...");
    
    // UPSC Questions
    const upscQuestions = [
      { id: "1", category: "upsc", text: "Which Article of the Indian Constitution deals with the Election Commission?", options: ["Article 324", "Article 356", "Article 360", "Article 370"], correctIndex: 0 },
      { id: "2", category: "upsc", text: "Who was the first Governor-General of independent India?", options: ["C. Rajagopalachari", "Lord Mountbatten", "Rajendra Prasad", "Jawaharlal Nehru"], correctIndex: 1 },
      { id: "3", category: "upsc", text: "The 'Green Revolution' in India was primarily associated with which crop?", options: ["Rice", "Wheat", "Cotton", "Sugarcane"], correctIndex: 1 },
      { id: "4", category: "upsc", text: "Which of the following is not a fundamental right in the Indian Constitution?", options: ["Right to Equality", "Right to Freedom", "Right to Property", "Right against Exploitation"], correctIndex: 2 },
      { id: "5", category: "upsc", text: "The headquarters of the Reserve Bank of India is located in:", options: ["New Delhi", "Kolkata", "Chennai", "Mumbai"], correctIndex: 3 }
    ];

    for (const q of upscQuestions) {
        await kv.set(["questions", "upsc", q.id], q);
    }

    // SSC Questions
    const sscQuestions = [
      { id: "1", category: "ssc", text: "In which year was the Battle of Plassey fought?", options: ["1757", "1764", "1857", "1947"], correctIndex: 0 },
      { id: "2", category: "ssc", text: "What represents the 'C' in 'ISRO'?", options: ["Center", "Control", "Communication", "Computer"], correctIndex: -1 }, // Trick question? No C in ISRO. Let's fix.
      { id: "2-fixed", category: "ssc", text: "What is the full form of GDP?", options: ["Gross Domestic Product", "Global Domestic Product", "Gross Daily Product", "General Domestic Product"], correctIndex: 0 },
      { id: "3", category: "ssc", text: "Who wrote 'Discovery of India'?", options: ["Mahatma Gandhi", "Sardar Patel", "Jawaharlal Nehru", "Indira Gandhi"], correctIndex: 2 },
      { id: "4", category: "ssc", text: "The chemical formula of common salt is:", options: ["H2O", "NaCl", "KCl", "CaCO3"], correctIndex: 1 },
      { id: "5", category: "ssc", text: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Saturn"], correctIndex: 2 }
    ];

    // Correcting the manual ID for loop
    for (let i = 0; i < sscQuestions.length; i++) {
        const q = sscQuestions[i];
        if (q.id === "2") continue; // Skip bad data
        await kv.set(["questions", "ssc", String(i + 1)], { ...q, id: String(i + 1) });
    }

    // HPTAT Questions
    const hptatQuestions = [
      { id: "1", category: "hptat", text: "Which river in Himachal Pradesh is known as 'Iravati'?", options: ["Satluj", "Beas", "Ravi", "Chenab"], correctIndex: 2 },
      { id: "2", category: "hptat", text: "Who was the first Chief Minister of Himachal Pradesh?", options: ["Virbhadra Singh", "Y.S. Parmar", "Shanta Kumar", "Prem Kumar Dhumal"], correctIndex: 1 },
      { id: "3", category: "hptat", text: "The classic 'Minjar Fair' is celebrated in which district?", options: ["Kullu", "Mandi", "Chamba", "Shimla"], correctIndex: 2 },
      { id: "4", category: "hptat", text: "Which is the highest peak in Himachal Pradesh?", options: ["Shilla", "Reo Purgyil", "Mulkila", "Gyephang"], correctIndex: 0 }, // Traditionally Shilla, debated
      { id: "5", category: "hptat", text: "Where is the headquarters of the Dalai Lama?", options: ["Manali", "Dharamshala (McLeod Ganj)", "Shimla", "Spiti"], correctIndex: 1 }
    ];

    for (const q of hptatQuestions) {
        await kv.set(["questions", "hptat", q.id], q);
    }
  }
}
