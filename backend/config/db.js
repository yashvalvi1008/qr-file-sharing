import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { env } from "./env.js";

let memoryServer;

export async function connectDb() {
  mongoose.set("strictQuery", true);

  if (env.MONGODB_URI) {
    await mongoose.connect(env.MONGODB_URI);
    return;
  }

  if (!env.USE_IN_MEMORY_DB) {
    throw new Error("MONGODB_URI is missing and USE_IN_MEMORY_DB is false.");
  }

  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri, { dbName: "qr_filesharing" });
}

