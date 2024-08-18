import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboard.controller.js";

const dashRouter = Router();

dashRouter.route("/channel-stats").post(verifyJWT, getChannelStats);
dashRouter.route("/channel-videos").post(verifyJWT, getChannelVideos);

export { dashRouter };
