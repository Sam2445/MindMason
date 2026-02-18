# MindMason Implementation Plan

## 1. Project Overview

MindMason is a competitive exam preparation platform built with Deno Fresh,
helping aspirants prepare for exams like UPSC, SSC, Banking, and State Exams.
The platform will feature personalized content delivery based on user goals and
future AI-powered study assistance.

### Tech Stack

- **Framework**: Deno Fresh (Preact + SSR)
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: TailwindCSS
- **Deployment**: Deno Deploy

## 2. Database Schema Design

We need to enhance the current schema to support onboarding and personalized
content.

### Proposed Enums

```prisma
enum UserRole {
  USER
  ADMIN
  SUPERUSER
}

enum ExamCategory {
  UPSC
  SSC
  BANKING
  STATE_EXAMS
  TEACHING
  DEFENCE
  OTHER
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

### Schema Updates

**User Model**

- Add `targetExam`: To store the user's primary preparation goal.
- Add `secondaryExams`: Array of strings for other interests.
- Add `onboardingCompleted`: Boolean to track if the user has verified their
  info.
- Add `isPremium`: Boolean for future premium features.

**Question Model**

- Add `explanation`: detailed answer explanation (for premium users/AI
  generation).
- Add `difficulty`: to help in adaptive testing.
- Add `tags`: for granular filtering (e.g., "History", "Polity").

**New Model: Subject/Topic**

- (Optional for now) To organize questions better than just "category".

## 3. Implementation Roadmap

### Phase 1: Foundation & Onboarding (Immediate Focus)

**Goal**: Users sign up, tell us what they are preparing for, and see relevant
content.

1. **Schema Migration**:
   - Update `prisma/schema.prisma` with new fields and enums.
   - Run migration to update the database.

2. **Onboarding Workflow**:
   - create `/routes/onboarding.tsx`.
   - After signup/login, check `user.onboardingCompleted`.
   - If `false`, redirect to `/onboarding`.
   - **Onboarding UI**:
     - "What are you preparing for?" (Card selection: UPSC, SSC, etc.)
     - "What is your target year?" (Optional)
     - Save preferences to DB.

3. **Personalized Dashboard (`/dashboard`)**:
   - Replace the generic Home page or create a logged-in Dashboard.
   - Fetch questions/quizzes matching `user.targetExam`.
   - Display "Recommended for [Exam Name]" section.

4. **User Settings**:
   - Create `/routes/profile.tsx`.
   - Allow users to change `targetExam` and `secondaryExams`.

### Phase 2: Content & Quiz Experience

- **Enhanced Quiz Interface**: Timer, Question Palette, "Mark for Review".
- **Result Analytics**: Detailed breakdown of strong/weak areas.
- **Content Expansion**: Seed database with questions for different categories.

### Phase 3: Gamification (Duels & Leaderboard)
- **Global Leaderboard**: Ranking based on total score and tests taken.
- **Duel Mode (1v1)**:
    - Real-time or async battles between users.
    - Matchmaking based on exam category and **Skill Rating** (Elo-like system).
    - **Bot Matchmaking**:
      - If no real player is available, match with a **Dummy Player (Bot)**.
      - Bots will have different difficulty levels matching the user's skill.
      - Bot behavior will simulate human response times and accuracy based on level.
    - "Duel History" to track wins/losses.

### Phase 4: AI Integration (Future Premium Feature)
- **AI Explainer**:
  - Button "Explain Answer with AI" on quiz result page.
  - Checks `user.isPremium`.
  - Calls LLM API to generate detailed explanation if not present in DB.
- **Personalized Study Plan**: AI generates a weekly schedule based on
  performance.

## 4. Next Steps for Developer

1. **Update Prisma Schema**: Add `targetExam` and `onboardingCompleted` to User.
2. **Generate Client**: Run `deno task build` (or specific prisma generate
   command).
3. **Build Onboarding Page**: Create the UI for exam selection.
4. **Connect Backend**: Write API handler to update user preferences.
