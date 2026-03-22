import { Router } from "express";
import { fileController } from "../controllers/fileController.js";

export const fileRouter = Router();

fileRouter.get("/file/:id", fileController);

