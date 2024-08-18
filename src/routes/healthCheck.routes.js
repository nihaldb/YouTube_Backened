import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getStatus } from "../controllers/healthcheck.controller.js";

const healthRouter = Router();

healthRouter.route("/health").post(verifyJWT, getStatus);

export { healthRouter };
