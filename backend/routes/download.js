import { Router } from "express";
import { downloadController } from "../controllers/downloadController.js";

export const downloadRouter = Router();

downloadRouter.get("/download/:id", downloadController);

