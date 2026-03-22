import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { uploadController } from "../controllers/uploadController.js";
import { requireAuth } from "../middleware/auth.js";

export const uploadRouter = Router();

uploadRouter.post("/upload", requireAuth, upload.single("file"), uploadController);

