import cors from "cors";
import express from "express";
import { config } from "./config";
import { resourcesRouter } from "./routes/resources.routes";
import { requireAuth } from "./middleware/auth.middleware";

const app = express();

app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/resources", requireAuth, resourcesRouter);

app.listen(config.port, () => {
  console.log(`SourceSea API listening on http://localhost:${config.port}`);
});
