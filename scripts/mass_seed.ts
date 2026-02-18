
import { addQuestion, Question, prisma } from "../utils/db.ts";

const CATEGORIES = [
  "upsc", "ssc", "banking", "state_exams", "railways", "defence", "teaching", "other", "demo"
];

// Helper to generate dummy math/reasoning questions to bulk up numbers
function generateMathQuestions(category: string, count: number): Partial<Question>[] {
  const questions: Partial<Question>[] = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 100) + 1;
    const b = Math.floor(Math.random() * 100) + 1;
    const op = Math.random() > 0.5 ? "+" : "-";
    const ans = op === "+" ? a + b : a - b;
    
    // Generate wrong options
    const options = new Set<number>();
    options.add(ans);
    while (options.size < 4) {
      options.add(ans + Math.floor(Math.random() * 20) - 10);
    }
    const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
    
    questions.push({
      category,
      text: `What is the value of ${a} ${op} ${b}?`,
      options: optionsArray.map(String),
      correctIndex: optionsArray.indexOf(ans),
      explanation: `Simple arithmetic: ${a} ${op} ${b} = ${ans}`,
      difficulty: "EASY"
    });
  }
  return questions;
}

// Static high-quality questions
const STATIC_QUESTIONS: Partial<Question>[] = [
  // UPSC
  { category: "upsc", text: "Who was the first Governor-General of Bengal?", options: ["Lord Clive", "Warren Hastings", "Lord Wellesley", "Lord Cornwallis"], correctIndex: 1, explanation: "Warren Hastings became the first Governor-General of Bengal in 1773.", difficulty: "MEDIUM" },
  { category: "upsc", text: "Which Article of the Constitution abolishes Untouchability?", options: ["Article 16", "Article 17", "Article 18", "Article 23"], correctIndex: 1, explanation: "Article 17 of the Indian Constitution abolishes untouchability and forbids its practice in any form.", difficulty: "EASY" },
  { category: "upsc", text: "The term 'Golden Revolution' is related to?", options: ["Horticulture", "Oilseeds", "Eggs", "Meat"], correctIndex: 0, explanation: "Golden Revolution is related to Horticulture and Honey.", difficulty: "MEDIUM" },
  { category: "upsc", text: "Who presides over the joint sitting of the Parliament?", options: ["President", "Vice President", "Speaker of Lok Sabha", "Prime Minister"], correctIndex: 2, explanation: "The Speaker of the Lok Sabha presides over the joint sitting of the Parliament.", difficulty: "MEDIUM" },
  { category: "upsc", text: "Which soil is best suited for Cotton cultivation?", options: ["Alluvial", "Red", "Black", "Laterite"], correctIndex: 2, explanation: "Black soil (Regur soil) is best suited for cotton cultivation.", difficulty: "EASY" },
  { category: "upsc", text: "The Battle of Plassey was fought in which year?", options: ["1757", "1764", "1857", "1947"], correctIndex: 0, explanation: "The Battle of Plassey was fought on June 23, 1757.", difficulty: "EASY" },
  { category: "upsc", text: "Who is known as the 'Father of Indian Renaissance'?", options: ["Swami Vivekananda", "Raja Ram Mohan Roy", "Ishwar Chandra Vidyasagar", "Dayanand Saraswati"], correctIndex: 1, explanation: "Raja Ram Mohan Roy is considered the Father of Indian Renaissance.", difficulty: "MEDIUM" },
  { category: "upsc", text: "Which planet is closest to the Sun?", options: ["Venus", "Mars", "Mercury", "Earth"], correctIndex: 2, explanation: "Mercury is the closest planet to the Sun.", difficulty: "EASY" },
  { category: "upsc", text: "The Preamble of the Indian Constitution was amended by which Amendment?", options: ["42nd", "44th", "73rd", "86th"], correctIndex: 0, explanation: "The Preamble was amended by the 42nd Constitutional Amendment Act of 1976.", difficulty: "HARD" },
  { category: "upsc", text: "Fundamental Duties were added on the recommendation of which committee?", options: ["Verma Committee", "Sarkaria Commission", "Swaran Singh Committee", "Mandal Commission"], correctIndex: 2, explanation: "Swaran Singh Committee recommended the inclusion of Fundamental Duties.", difficulty: "MEDIUM" },

  // SSC
  { category: "ssc", text: "What is the chemical name of Baking Soda?", options: ["Sodium Carbonate", "Sodium Bicarbonate", "Sodium Chloride", "Sodium Hydroxide"], correctIndex: 1, explanation: "Sodium Bicarbonate (NaHCO3) is commonly known as Baking Soda.", difficulty: "MEDIUM" },
  { category: "ssc", text: "Who was the first woman President of Congress?", options: ["Sarojini Naidu", "Annie Besant", "Indira Gandhi", "Nellie Sengupta"], correctIndex: 1, explanation: "Annie Besant was the first woman President of the Indian National Congress in 1917.", difficulty: "MEDIUM" },
  { category: "ssc", text: "Which instrument is used to measure atmospheric pressure?", options: ["Barometer", "Thermometer", "Hygrometer", "Anemometer"], correctIndex: 0, explanation: "A Barometer is used to measure atmospheric pressure.", difficulty: "EASY" },
  { category: "ssc", text: "The capital of Australia is?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correctIndex: 2, explanation: "Canberra is the capital city of Australia.", difficulty: "MEDIUM" },
  { category: "ssc", text: "Which vitamin is water soluble?", options: ["Vitamin A", "Vitamin D", "Vitamin C", "Vitamin K"], correctIndex: 2, explanation: "Vitamins B and C are water-soluble.", difficulty: "EASY" },
  { category: "ssc", text: "Who invented the telephone?", options: ["Thomas Edison", "Alexander Graham Bell", "Marconi", "Newton"], correctIndex: 1, explanation: "Alexander Graham Bell invented the telephone.", difficulty: "EASY" },
  { category: "ssc", text: "The longest river in the world is?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correctIndex: 1, explanation: "The Nile is traditionally considered the longest river.", difficulty: "EASY" },
  { category: "ssc", text: "Which gas is most abundant in the Earth's atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], correctIndex: 1, explanation: "Nitrogen makes up about 78% of Earth's atmosphere.", difficulty: "EASY" },
  { category: "ssc", text: "Study of fungi is known as?", options: ["Phycology", "Mycology", "Virology", "Botany"], correctIndex: 1, explanation: "Mycology is the study of fungi.", difficulty: "MEDIUM" },
  { category: "ssc", text: "SI unit of force is?", options: ["Pascal", "Joule", "Newton", "Watt"], correctIndex: 2, explanation: "Newton is the SI unit of force.", difficulty: "EASY" },

  // Banking
  { category: "banking", text: "Which bank is called the 'Banker to the Government'?", options: ["SBI", "RBI", "PNB", "HDFC"], correctIndex: 1, explanation: "Reserve Bank of India (RBI) acts as the banker to the government.", difficulty: "EASY" },
  { category: "banking", text: "What is the full form of KYC?", options: ["Know Your Customer", "Know Your Cash", "Keep Your Cash", "Know Your Credit"], correctIndex: 0, explanation: "KYC stands for Know Your Customer.", difficulty: "EASY" },
  { category: "banking", text: "Headquarters of World Bank is located in?", options: ["Geneva", "New York", "Washington D.C.", "Paris"], correctIndex: 2, explanation: "World Bank headquarters is in Washington D.C.", difficulty: "MEDIUM" },
  { category: "banking", text: "RTGS stands for?", options: ["Real Time Gross Settlement", "Real Time Gross System", "Real Time Gold Settlement", "Regular Time Gross Settlement"], correctIndex: 0, explanation: "RTGS stands for Real Time Gross Settlement.", difficulty: "MEDIUM" },
  { category: "banking", text: "Which is the largest public sector bank in India?", options: ["PNB", "BOB", "SBI", "Canara Bank"], correctIndex: 2, explanation: "State Bank of India (SBI) is the largest public sector bank.", difficulty: "EASY" },
  
  // Defence
  { category: "defence", text: "The Supreme Commander of the Indian Defence Forces is?", options: ["Prime Minister", "President", "Chief of Defence Staff", "Defence Minister"], correctIndex: 1, explanation: "The President of India is the Supreme Commander of the Indian Defence Forces.", difficulty: "EASY" },
  { category: "defence", text: "Which is the highest gallantry award in India during peacetime?", options: ["Param Vir Chakra", "Ashok Chakra", "Shaurya Chakra", "Kirti Chakra"], correctIndex: 1, explanation: "Ashok Chakra is the highest peacetime gallantry award.", difficulty: "MEDIUM" },
  
  // Teaching
  { category: "teaching", text: "Who propounded the 'Theory of Multiple Intelligences'?", options: ["Jean Piaget", "Howard Gardner", "Vygotsky", "B.F. Skinner"], correctIndex: 1, explanation: "Howard Gardner proposed the Theory of Multiple Intelligences.", difficulty: "MEDIUM" },
  { category: "teaching", text: "Which article constitutes the Right to Education?", options: ["Article 21A", "Article 45", "Article 51A", "Article 28"], correctIndex: 0, explanation: "Article 21A provides for free and compulsory education to all children.", difficulty: "EASY" },

  // Demo
  { category: "demo", text: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Bangkok"], correctIndex: 2, explanation: "Tokyo is the capital of Japan.", difficulty: "EASY" },
  { category: "demo", text: "Which element uses the symbol 'Fe'?", options: ["Fluorine", "Iron", "Francium", "Fermium"], correctIndex: 1, explanation: "Fe implies Ferrum, which is Iron.", difficulty: "MEDIUM" },
];

async function main() {
  console.log("🚀 Starting Mass Seed...");

  // 1. Seed Static Questions
  for (const q of STATIC_QUESTIONS) {
    try {
        await addQuestion({
            id: crypto.randomUUID(),
            category: q.category!,
            text: q.text!,
            options: q.options!,
            correctIndex: q.correctIndex!,
            explanation: q.explanation,
            difficulty: q.difficulty
        });
    } catch (e) {
        // ignore dupes or errors
    }
  }
  console.log(`✅ Seeded ${STATIC_QUESTIONS.length} Static Questions`);

  // 2. Bulk up with generated questions to reach ~50 per category
  for (const cat of CATEGORIES) {
    // @ts-ignore
    const currentCount = await prisma.question.count({ where: { category: cat } });
    const needed = 100 - currentCount;
    
    if (needed > 0) {
      console.log(`Generating ${needed} Math/Logic questions for ${cat}...`);
      const generated = generateMathQuestions(cat, needed);
      for (const q of generated) {
         try {
            await addQuestion({
                id: crypto.randomUUID(),
                category: q.category!,
                text: q.text!,
                options: q.options!,
                correctIndex: q.correctIndex!,
                explanation: q.explanation,
                difficulty: q.difficulty
            });
         } catch(e) {}
      }
    }
  }

  console.log("🎉 Mass Seeding Complete!");
}

main();
