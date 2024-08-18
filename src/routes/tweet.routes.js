import { Router } from "express";
import {
  createTweet,
  getUserTweet,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

tweetRouter = Router();

tweetRouter.route("/create-tweet").post(verifyJWT, createTweet);
tweetRouter.route("/get-tweet").post(verifyJWT, getUserTweet);
tweetRouter.route("/update-tweet").post(verifyJWT, updateTweet);
tweetRouter.route("/delete-tweet").post(verifyJWT, deleteTweet);

export { tweetRouter };
