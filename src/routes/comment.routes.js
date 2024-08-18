import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoComment,
  addComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";

const commentRouter = Router();

commentRouter.route("/add-comment").post(verifyJWT, addComment);
commentRouter.route("/delete-comment").post(verifyJWT, deleteComment);
commentRouter.route("/update-comment").post(verifyJWT, updateComment);
commentRouter.route("/get-comment").post(verifyJWT, getVideoComment);

export { commentRouter };
