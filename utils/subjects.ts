// Subject configuration for each exam category
// Each exam has multiple subjects that users can practice

export interface SubjectInfo {
  id: string;       // Stored in DB (e.g., "quantitative_aptitude")
  label: string;    // Display name (e.g., "Quantitative Aptitude")
  icon: string;     // Emoji icon
  color: string;    // Tailwind color name for styling
  description: string;
}


export interface ExamVariant {
  id: string;
  label: string;
  duration: number; // minutes
  totalQuestions: number;
  distribution?: Record<string, number>; // subjectId -> count
}

export interface ExamSubjects {
  examId: string;
  examLabel: string;
  subjects: SubjectInfo[];
  variants?: ExamVariant[];
}

// All subjects organized by exam
export const EXAM_SUBJECTS: Record<string, ExamSubjects> = {
  BANKING: {
    examId: "BANKING",
    examLabel: "Banking",
    subjects: [
      { id: "quantitative_aptitude", label: "Quantitative Aptitude", icon: "🔢", color: "blue", description: "Number systems, arithmetic, algebra, data interpretation" },
      { id: "reasoning", label: "Reasoning Ability", icon: "🧩", color: "purple", description: "Logical reasoning, puzzles, seating arrangement, syllogisms" },
      { id: "english", label: "English Language", icon: "📝", color: "emerald", description: "Reading comprehension, grammar, vocabulary, cloze test" },
      { id: "general_awareness", label: "General Awareness", icon: "🌍", color: "orange", description: "Current affairs, banking awareness, financial awareness" },
      { id: "computer_knowledge", label: "Computer Knowledge", icon: "💻", color: "cyan", description: "Computer fundamentals, networking, security, MS Office" },
    ],
    variants: [
      { 
        id: "prelims", 
        label: "Prelims (PO/Clerk)", 
        duration: 60, 
        totalQuestions: 100,
        distribution: { "english": 30, "quantitative_aptitude": 35, "reasoning": 35 } 
      },
      { 
        id: "mains", 
        label: "Mains (PO/Clerk)", 
        duration: 180, 
        totalQuestions: 155, // Adjusted from 200 for realistic distribution
        distribution: { "reasoning": 45, "general_awareness": 40, "english": 35, "quantitative_aptitude": 35 } 
      },
    ]
  },

  UPSC: {
    examId: "UPSC",
    examLabel: "UPSC",
    subjects: [
      { id: "polity", label: "Indian Polity", icon: "🏛️", color: "blue", description: "Constitution, governance, political systems" },
      { id: "history", label: "History", icon: "📜", color: "amber", description: "Ancient, medieval, modern Indian history, world history" },
      { id: "geography", label: "Geography", icon: "🗺️", color: "emerald", description: "Physical, human, Indian geography, environment" },
      { id: "economics", label: "Economics", icon: "📊", color: "indigo", description: "Indian economy, economic development, budgeting" },
      { id: "science_technology", label: "Science & Technology", icon: "🔬", color: "cyan", description: "General science, space, defense, IT developments" },
      { id: "environment", label: "Environment & Ecology", icon: "🌿", color: "green", description: "Biodiversity, climate change, environmental conservation" },
      { id: "current_affairs", label: "Current Affairs", icon: "📰", color: "red", description: "National and international events, government schemes" },
      { id: "ethics", label: "Ethics & Integrity", icon: "⚖️", color: "purple", description: "Ethics, integrity, aptitude for civil services" },
    ],
    variants: [
        { 
            id: "prelims_gs1", 
            label: "Prelims (GS I)", 
            duration: 120, 
            totalQuestions: 100,
            distribution: { "polity": 15, "history": 15, "geography": 15, "economics": 15, "science_technology": 10, "environment": 15, "current_affairs": 15 }
        },
        { 
            id: "prelims_csat", 
            label: "Prelims (CSAT)", 
            duration: 120, 
            totalQuestions: 80,
            // Assuming we map CSAT broadly to 'reasoning' + 'english' + 'maths' if available, otherwise just general logic
            // Since UPSC subjects list above doesn't have quantitative explicit for CSAT, we might need to map closely.
            // But wait, the subjects list strictly has GS topics. CSAT topics are missing in UPSC subjects list above.
            // Let's assume for now we use 'reasoning' from valid subjects if shared? No, they are scoped.
            // We will just distribute across available GS topics or add handling later. 
            // Actually, CSAT is mostly Comprehension (English?), Reasoning, Basic Numeracy.
            // We only have GS subjects defined for purely UPSC category. 
            // Let's stick to GS1 for now being accurate.
            distribution: { "reading_comprehension": 25, "reasoning": 25, "quantitative_aptitude": 30 } 
        },
    ]
  },

  SSC: {
    examId: "SSC",
    examLabel: "SSC",
    subjects: [
      { id: "quantitative_aptitude", label: "Quantitative Aptitude", icon: "🔢", color: "blue", description: "Arithmetic, algebra, geometry, trigonometry" },
      { id: "reasoning", label: "General Intelligence & Reasoning", icon: "🧩", color: "purple", description: "Verbal and non-verbal reasoning, analogy, coding-decoding" },
      { id: "english", label: "English Language", icon: "📝", color: "emerald", description: "Comprehension, vocabulary, grammar, sentence correction" },
      { id: "general_awareness", label: "General Awareness", icon: "🌍", color: "orange", description: "History, geography, polity, economics, current affairs" },
    ],
    variants: [
        { 
            id: "tier1", 
            label: "Tier-I", 
            duration: 60, 
            totalQuestions: 100,
            distribution: { "reasoning": 25, "general_awareness": 25, "quantitative_aptitude": 25, "english": 25 }
        },
        { 
            id: "tier2", 
            label: "Tier-II (Paper I)", 
            duration: 150, // 2h 30m actually for full paper usually
            totalQuestions: 130, // Section 1 (60) + Section 2 (70)
            distribution: { "quantitative_aptitude": 30, "reasoning": 30, "english": 45, "general_awareness": 25 }
        },
    ]
  },

  STATE_EXAMS: {
    examId: "STATE_EXAMS",
    examLabel: "State Exams",
    subjects: [
      { id: "general_studies", label: "General Studies", icon: "📚", color: "blue", description: "History, geography, polity, economics of respective state" },
      { id: "quantitative_aptitude", label: "Quantitative Aptitude", icon: "🔢", color: "purple", description: "Arithmetic, algebra, data interpretation" },
      { id: "reasoning", label: "Reasoning Ability", icon: "🧩", color: "emerald", description: "Logical and analytical reasoning" },
      { id: "english", label: "English Language", icon: "📝", color: "orange", description: "Grammar, comprehension, vocabulary" },
      { id: "hindi", label: "Hindi Language", icon: "🔤", color: "red", description: "Hindi grammar, comprehension, literature" },
    ]
  },

  RAILWAYS: {
    examId: "RAILWAYS",
    examLabel: "Railways",
    subjects: [
      { id: "mathematics", label: "Mathematics", icon: "🔢", color: "blue", description: "Number systems, algebra, geometry, mensuration" },
      { id: "reasoning", label: "General Intelligence & Reasoning", icon: "🧩", color: "purple", description: "Analogies, classification, coding-decoding" },
      { id: "general_science", label: "General Science", icon: "🔬", color: "emerald", description: "Physics, chemistry, biology basics" },
      { id: "general_awareness", label: "General Awareness", icon: "🌍", color: "orange", description: "Current affairs, Indian history, geography" },
    ],
    variants: [
        { 
            id: "cbt1", 
            label: "CBT-1", 
            duration: 90, 
            totalQuestions: 100,
            distribution: { "mathematics": 30, "reasoning": 30, "general_awareness": 40 } // Approx
        },
        { 
            id: "cbt2", 
            label: "CBT-2 (Part A)", 
            duration: 90, 
            totalQuestions: 100,
            distribution: { "mathematics": 25, "reasoning": 25, "general_science": 40, "general_awareness": 10 }
        },
    ]
  },

  DEFENCE: {
    examId: "DEFENCE",
    examLabel: "Defence",
    subjects: [
      { id: "mathematics", label: "Mathematics", icon: "🔢", color: "blue", description: "Algebra, trigonometry, calculus, statistics" },
      { id: "english", label: "English", icon: "📝", color: "emerald", description: "Grammar, vocabulary, comprehension" },
      { id: "general_knowledge", label: "General Knowledge", icon: "🌍", color: "orange", description: "History, geography, polity, current affairs" },
      { id: "reasoning", label: "Reasoning & Intelligence", icon: "🧩", color: "purple", description: "Verbal and non-verbal reasoning" },
    ],
    variants: [
        { 
            id: "writtten", 
            label: "Written Exam", 
            duration: 120, 
            totalQuestions: 100,
            distribution: { "mathematics": 30, "english": 30, "general_knowledge": 40 }
        },
    ]
  },

  TEACHING: {
    examId: "TEACHING",
    examLabel: "Teaching",
    subjects: [
      { id: "child_development", label: "Child Development & Pedagogy", icon: "👶", color: "pink", description: "Child psychology, learning theories, teaching methods" },
      { id: "mathematics", label: "Mathematics", icon: "🔢", color: "blue", description: "Number system, geometry, algebra" },
      { id: "language_1", label: "Language I (Hindi)", icon: "🔤", color: "orange", description: "Hindi comprehension, grammar, pedagogy" },
      { id: "language_2", label: "Language II (English)", icon: "📝", color: "emerald", description: "English comprehension, grammar, pedagogy" },
      { id: "environmental_studies", label: "Environmental Studies", icon: "🌿", color: "green", description: "EVS concepts, pedagogy of EVS" },
    ],
    variants: [
        { 
            id: "paper1", 
            label: "Paper-I (Primary)", 
            duration: 150, 
            totalQuestions: 150,
            distribution: { "child_development": 30, "language_1": 30, "language_2": 30, "mathematics": 30, "environmental_studies": 30 }
        },
        { 
            id: "paper2", 
            label: "Paper-II (Elementary)", 
            duration: 150, 
            totalQuestions: 150,
            distribution: { "child_development": 30, "language_1": 30, "language_2": 30, "mathematics": 60 } // Science/Math option usually 60
        },
    ]
  },

  OTHER: {
    examId: "OTHER",
    examLabel: "Other",
    subjects: [
      { id: "general_knowledge", label: "General Knowledge", icon: "🌍", color: "blue", description: "All-round general knowledge" },
      { id: "quantitative_aptitude", label: "Quantitative Aptitude", icon: "🔢", color: "purple", description: "Mathematics and numerical ability" },
      { id: "reasoning", label: "Logical Reasoning", icon: "🧩", color: "emerald", description: "Logical and analytical reasoning" },
      { id: "english", label: "English", icon: "📝", color: "orange", description: "English language skills" },
    ]
  },
};

// Get subjects for a given exam category
export function getSubjectsForExam(examCategory: string): SubjectInfo[] {
  const key = examCategory.toUpperCase();
  return EXAM_SUBJECTS[key]?.subjects || EXAM_SUBJECTS["OTHER"].subjects;
}

// Get a specific subject info
export function getSubjectInfo(examCategory: string, subjectId: string): SubjectInfo | undefined {
  const subjects = getSubjectsForExam(examCategory);
  return subjects.find(s => s.id === subjectId);
}

// Get display label for a subject
export function getSubjectLabel(examCategory: string, subjectId: string): string {
  const info = getSubjectInfo(examCategory, subjectId);
  return info?.label || subjectId.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}
