import { Router } from "express";
import { loginController, meController, registerController } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

authRouter.post("/auth/register", registerController);
authRouter.post("/auth/login", loginController);
authRouter.get("/auth/me", requireAuth, meController);

