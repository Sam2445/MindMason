
import { Handlers } from "$fresh/server.ts";
import { getDuelStatus } from "../../../utils/duels.ts";
import { prisma } from "../../../utils/db.ts";

export const handler: Handlers = {
  async GET(req) {
    const url = new URL(req.url);
    const duelId = url.searchParams.get("id");
    
    if (!duelId) return new Response("Missing ID", { status: 400 });

    try {
        const duel = await getDuelStatus(duelId);
        if (!duel) return new Response("Not Found", { status: 404 });

        // Check if results exist
        // @ts-ignore
        const results = await prisma.examResult.findMany({
            where: { duelId: duel.id }
        });

        // Determine if duel is complete
        let isComplete = false;
        let winner = null;
        let p1Score = 0;
        let p2Score = 0;

        // Parse progress if available
        const p1Progress = duel.player1Progress ? JSON.parse(duel.player1Progress) : null;
        const p2Progress = duel.player2Progress ? JSON.parse(duel.player2Progress) : null;
        
        let questions: any[] = [];
        try {
            if (duel.questions) {
                questions = JSON.parse(duel.questions);
            }
        } catch (e) {
            console.error("Failed to parse duel questions", e);
        }

        // Check for BOT opponent simulation if needed
        if (duel.player2Id && !p2Progress) {
             // @ts-ignore
             const p2User = await prisma.user.findUnique({ where: { id: duel.player2Id } });
             if (p2User && p2User.isBot) {
                  // Initialize bot progress
                  const botProgress = { currentQuestionIndex: 0, answers: {}, score: 0 };
                  // @ts-ignore
                  await prisma.duel.update({
                      where: { id: duel.id },
                      data: { player2Progress: JSON.stringify(botProgress) }
                  });
             }
        }
        
        // Dynamic Bot Play: If player 1 has answered X questions, ensure Bot answers X questions too (approx)
        if (p1Progress && duel.player2Id) {
             // @ts-ignore
             const p2User = await prisma.user.findUnique({ where: { id: duel.player2Id } });
             if (p2User && p2User.isBot) {
                 const currentP2 = duel.player2Progress ? JSON.parse(duel.player2Progress) : { currentQuestionIndex: 0, answers: {}, score: 0 };
                 
                 if (currentP2.currentQuestionIndex < p1Progress.currentQuestionIndex || (p1Progress.currentQuestionIndex > 0 && currentP2.currentQuestionIndex === 0)) {
                      // Bot catches up
                      const targetIndex = p1Progress.currentQuestionIndex;
                      // Logic: Bot answers questions up to targetIndex
                      // Need total questions?
                      // We don't have questions array easily here unless we fetch them or they are in duel.questions
                      // Just simulate score increment for now
                      let newScore = currentP2.score;
                      const newAnswers = { ...currentP2.answers };
                      
                      for (let i = currentP2.currentQuestionIndex; i < targetIndex; i++) {
                           // Bot logic: Random correct/wrong based on skill?
                           // Simple 50/50 for now or based on skill
                           const isCorrect = Math.random() > 0.4; // 60% correct rate
                           if (isCorrect) newScore++;
                           newAnswers[i] = { answerIndex: isCorrect ? 0 : 1, isCorrect }; // Dummy index
                      }
                      
                      const updatedBotProgress = {
                          currentQuestionIndex: targetIndex,
                          answers: newAnswers,
                          score: newScore
                      };
                      
                      // @ts-ignore
                      await prisma.duel.update({
                          where: { id: duel.id },
                          data: { player2Progress: JSON.stringify(updatedBotProgress) }
                      });
                      
                      // Update local var for response
                      p2Score = newScore;
                 } else {
                     p2Score = currentP2.score;
                 }
             } else if (p2Progress) {
                 p2Score = p2Progress.score;
             }
        } else if (p2Progress) {
            p2Score = p2Progress.score;
        }

        if (p1Progress) p1Score = p1Progress.score;

        // Completion check (if both finished all questions?)
        // For now, rely on explicit finish or max questions. 
        // If results exist in ExamResult table, it's definitely done.
        
        if (duel.player2Id && results.length >= 2) {
             isComplete = true;
             const r1 = results.find((r: any) => r.userId === duel.player1Id);
             const r2 = results.find((r: any) => r.userId === duel.player2Id);
             if (r1 && r2) {
                  p1Score = r1.score;
                  p2Score = r2.score;
                  winner = (r1.score > r2.score) ? duel.player1Id : (r2.score > r1.score ? duel.player2Id : "DRAW");
             }
        }
        
        // Secondary Completion Check based on Progress (Handling Bots or non-submitted states)
        if (questions && !isComplete && p1Progress && p2Progress) {
            const totalQ = questions.length;
            const p1Done = p1Progress.score !== undefined && Object.keys(p1Progress.answers || {}).length >= totalQ;
            const p2Done = p2Progress.score !== undefined && Object.keys(p2Progress.answers || {}).length >= totalQ;
            
            if (p1Done && p2Done) {
                isComplete = true;
                p1Score = p1Progress.score;
                p2Score = p2Progress.score;
                 winner = (p1Score > p2Score) ? duel.player1Id : (p2Score > p1Score ? duel.player2Id : "DRAW");
            }
        }

        // --- NEW LOGIC: Trigger Completion & ELO Update ---
        if (isComplete && duel.status !== "COMPLETED" && winner) {
            // This is where we update ELO and mark duel COMPLETED in DB
            // We use a small timeout or non-blocking call to avoid holding up the response?
            // Or just await it, it should be fast.
            try {
                // Determine completion
                const { completeDuel } = await import("../../../utils/duels.ts");
                await completeDuel(duel.id, winner);
                // The duel object in memory `duel` is now stale regarding status, but we return `isComplete` flag anyway.
            } catch (err) {
                console.error("Failed to complete duel stats:", err);
            }
        }

        return new Response(JSON.stringify({ 
            ...duel, 
            isComplete, 
            winner,
            p1Score,
            p2Score
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        console.error(e);
        return new Response("Error", { status: 500 });
    }
  }
};
