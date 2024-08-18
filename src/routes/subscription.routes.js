import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";

const subRouter = Router();

subRouter.route("/sub-or-not").post(verifyJWT, toggleSubscription);
subRouter.route("/subscribers").post(verifyJWT, getUserChannelSubscribers);
subRouter.route("/subscribed-channel").post(verifyJWT, getSubscribedChannels);


export {subRouter}