import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedComment,
  getLikedTweet,
  getLikedVideo,
} from "../controllers/like.controller.js";

const likeRouter = Router();

likeRouter.route("/change-comment-like").post(verifyJWT, toggleCommentLike);
likeRouter.route("/change-tweet-like").post(verifyJWT, toggleTweetLike);
likeRouter.route("/change-video-like").post(verifyJWT, toggleVideoLike);
likeRouter.route("/get-liked-comment").post(verifyJWT, getLikedComment);
likeRouter.route("/get-liked-tweet").post(verifyJWT, getLikedTweet);
likeRouter.route("/get-liked-video").post(verifyJWT, getLikedVideo);

export { likeRouter };
