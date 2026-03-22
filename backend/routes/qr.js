import { Router } from "express";
import { qrController } from "../controllers/qrController.js";

export const qrRouter = Router();

qrRouter.get("/qr/:id", qrController);

