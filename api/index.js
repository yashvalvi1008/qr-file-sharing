import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import mongoose from "mongoose";
import { env } from "../backend/config/env.js";
import { apiRouter } from "../backend/routes/index.js";
import { errorHandler } from "../backend/middleware/errorHandler.js";

let connecting;

async function connectDbOnce() {
  if (mongoose.connection?.readyState === 1) return;
  if (!connecting) {
    if (!env.MONGODB_URI) {
      throw new Error("MONGODB_URI is required on Vercel (MongoDB Atlas).");
    }
    connecting = mongoose.connect(env.MONGODB_URI);
  }
  await connecting;
}

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

app.get("/api/health", async (req, res, next) => {
  try {
    await connectDbOnce();
    res.json({ ok: true, env: env.NODE_ENV });
  } catch (e) {
    next(e);
  }
});

app.use("/api", async (req, res, next) => {
  try {
    await connectDbOnce();
    next();
  } catch (e) {
    next(e);
  }
});

app.use("/api", apiRouter);

app.use(errorHandler);

export default app;

