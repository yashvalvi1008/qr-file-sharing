import { Router } from "express";
import { uploadRouter } from "./upload.js";
import { fileRouter } from "./file.js";
import { downloadRouter } from "./download.js";
import { qrRouter } from "./qr.js";
import { authRouter } from "./auth.js";

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(uploadRouter);
apiRouter.use(fileRouter);
apiRouter.use(downloadRouter);
apiRouter.use(qrRouter);

