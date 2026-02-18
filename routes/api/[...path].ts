import { type ExamResult, saveExamResult } from "../../utils/db.ts";
import { Hono } from "hono";

const app = new Hono().basePath("/api");

// Example complex route using Hono
app.get("/status", (c) => {
  return c.json({
    status: "ok",
    service: "MindMason API",
    timestamp: new Date().toISOString(),
  });
});

app.post("/submit-score", async (c) => {
  const body = await c.req.json() as ExamResult;
  console.log("Score received:", body);

  try {
    await saveExamResult(body);
    return c.json({ success: true, message: "Score saved successfully" });
  } catch (error) {
    console.error("Error saving score:", error);
    return c.json({ success: false, message: "Failed to save score" }, 500);
  }
});

// Standard Web Fetch Handler
export const handler = (req: Request) => app.fetch(req);
