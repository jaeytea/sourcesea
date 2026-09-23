import cors from "cors";
import express from "express";
import { config } from "./config";
import { resourcesRouter } from "./routes/resources.routes";
import { requireAuth } from "./middleware/auth.middleware";
import { pool } from "./db";
import { scheduleReminderEmail } from "./services/email.service";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/db-health", async (_req, res) => {
  try {
    const result = await pool.query("select now()");
    res.json({ ok: true, time: result.rows[0].now });
  } catch (error) {
    console.error("DB health check failed:", error);
    res.status(500).json({ ok: false });
  }
});
app.use("/api/resources", requireAuth, resourcesRouter);

app.listen(config.port, () => {
  console.log(`SourceSea API listening on http://localhost:${config.port}`);
});

app.post("/test-email", async (_req, res) => {
  try {
    const scheduledAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    const result = await scheduleReminderEmail({
      to: "jaagritiwork@gmail.com",
      title: "SourceSea email test",
      url: "https://sourcesea-chi.vercel.app",
      notes: "If you're reading this, scheduled email works.",
      remindAt: scheduledAt,
    });

    res.json({
      ok: true,
      scheduledAt,
      result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
