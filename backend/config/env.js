import dotenv from "dotenv";

dotenv.config();

function optionalEnv(name) {
  const v = process.env[name];
  return v && String(v).trim() ? v : undefined;
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  APP_BASE_URL: process.env.APP_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`,

  // If omitted, we fall back to an in-memory MongoDB for local dev.
  MONGODB_URI: optionalEnv("MONGODB_URI"),
  USE_IN_MEMORY_DB: (process.env.USE_IN_MEMORY_DB ?? "true").toLowerCase() === "true",

  // Auth
  JWT_SECRET: process.env.JWT_SECRET ?? "dev-secret-change-me",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",

  // Storage: "s3" or "local". If not provided, it auto-selects based on AWS vars.
  STORAGE_PROVIDER: (process.env.STORAGE_PROVIDER ?? "auto").toLowerCase(),
  AWS_REGION: optionalEnv("AWS_REGION"),
  AWS_ACCESS_KEY_ID: optionalEnv("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: optionalEnv("AWS_SECRET_ACCESS_KEY"),
  S3_BUCKET_NAME: optionalEnv("S3_BUCKET_NAME"),

  MAX_FILE_SIZE_MB: Number(process.env.MAX_FILE_SIZE_MB ?? 100),
  FILE_TTL_HOURS: Number(process.env.FILE_TTL_HOURS ?? 24)
};

