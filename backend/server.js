import path from "node:path";
import { fileURLToPath } from "node:url";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { cleanupExpiredFiles } from "./services/cleanupService.js";

await connectDb();

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json({ limit: "1mb" }));

app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120
  })
);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, env: env.NODE_ENV });
});

app.use("/api", apiRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, "..", "frontend");

app.use(express.static(frontendDir));
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.use(errorHandler);

setInterval(() => {
  cleanupExpiredFiles({ limit: 50 }).catch(() => {});
}, 30 * 60 * 1000);

app.listen(env.PORT, () => {
  console.log(`Server running on ${env.APP_BASE_URL} (port ${env.PORT})`);
});

