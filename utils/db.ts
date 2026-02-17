
import { createRequire } from "node:module";
import * as bcrypt from "npm:bcryptjs";
import type { PrismaClient as PrismaClientType } from "../generated/client/index.d.ts";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../generated/client/index.cjs");

// Initialize Prisma Client
const prisma = new PrismaClient() as PrismaClientType;

export interface Question {
  id: string;
  category: string;
  text: string;
  options: string[];
  correctIndex: number;
}

export interface ExamResult {
  id: string;
  userId: string;
  category: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  userId: string;
  totalScore: number;
  testsTaken: number;
  averageScore: number;
}

// ---- Database Operations ----

export async function checkUser(username: string, password: string): Promise<boolean> {
  try {
     // @ts-ignore - Prisma client types might not be fully synced in IDE yet
     const user = await prisma.user.findUnique({ where: { username } });
     if (!user) return false;
     return await bcrypt.compare(password, user.passwordHash);
  } catch (e) {
     console.error("Auth error", e);
     return false;
  }
}

export async function addQuestion(q: Question) {
  try {
    const created = await prisma.question.create({
      data: {
        id: q.id || crypto.randomUUID(),
        category: q.category,
        text: q.text,
        options: JSON.stringify(q.options), // Store options as JSON string
        correctIndex: q.correctIndex,
      },
    });
    return { ...created, options: JSON.parse(created.options) };
  } catch (e) {
    console.error("Error adding question:", e);
    throw e;
  }
}

export async function getQuestions(category?: string): Promise<Question[]> {
  try {
    const where = category ? { category } : {};
    const rawQuestions = await prisma.question.findMany({ where });
    
    return rawQuestions.map((q: any) => {
      let options = [];
      try {
        options = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
      } catch (e) {
        console.error(`Failed to parse options for question ${q.id}`, e);
        options = ["Error loading options"];
      }
      return {
        id: q.id,
        category: q.category,
        text: q.text,
        options,
        correctIndex: q.correctIndex,
      };
    });
  } catch (e) {
    console.error("Error fetching questions:", e);
    return [];
  }
}

export async function getRandomQuestions(category: string, count: number): Promise<Question[]> {
  const all = await getQuestions(category);
  // Fisher-Yates Shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count);
}

export async function clearQuestions() {
  await prisma.question.deleteMany();
}

export async function saveExamResult(result: ExamResult) {
  try {
    await prisma.examResult.create({
      data: {
        id: result.id || crypto.randomUUID(),
        userId: result.userId,
        category: result.category,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        timeTaken: result.timeTaken,
        timestamp: new Date(result.timestamp), // Ensure Date object
      },
    });
  } catch (e) {
    console.error("Error saving result:", e);
    throw e;
  }
}

export async function getExamResults(): Promise<ExamResult[]> {
  try {
    const rawResults = await prisma.examResult.findMany({
      orderBy: { timestamp: "desc" },
    });

    return rawResults.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      category: r.category,
      score: r.score,
      totalQuestions: r.totalQuestions,
      correctAnswers: r.correctAnswers,
      timeTaken: r.timeTaken,
      timestamp: r.timestamp.toISOString(),
    }));
  } catch (e) {
    console.error("Error fetching results:", e);
    return [];
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const results = await getExamResults();
  
  const stats: Record<string, { total: number, count: number }> = {};
  
  for (const r of results) {
    const name = r.userId || "Anonymous";
    if (name === "guest-user") continue; // Optionally skip guests
    
    if (!stats[name]) stats[name] = { total: 0, count: 0 };
    stats[name].total += r.score;
    stats[name].count += 1;
  }
  
  return Object.entries(stats)
    .map(([userId, data]) => ({
      userId,
      totalScore: data.total,
      testsTaken: data.count,
      averageScore: Math.round(data.total / data.count)
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 50);
}

export async function seedQuestionsIfEmpty() {
  const count = await prisma.question.count();
  if (count === 0) {
    console.log("Seeding Database...");
    await addQuestion({ id: "1", category: "upsc", text: "Sample Question?", options: ["A","B","C","D"], correctIndex: 0 });
  }
}
