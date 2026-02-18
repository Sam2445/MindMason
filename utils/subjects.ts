// Subject configuration for each exam category
// Each exam has multiple subjects that users can practice

export interface SubjectInfo {
  id: string;       // Stored in DB (e.g., "quantitative_aptitude")
  label: string;    // Display name (e.g., "Quantitative Aptitude")
  icon: string;     // Emoji icon
  color: string;    // Tailwind color name for styling
  description: string;
}

export interface ExamSubjects {
  examId: string;
  examLabel: string;
  subjects: SubjectInfo[];
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
