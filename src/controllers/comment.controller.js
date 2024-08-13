import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const getVideoComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId) {
    throw new apiError(401, " Invalid video Id");
  }

  const offset = (Number(page) - 1) * Number(limit);

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $project: {
        content: 1,
        video: 1,
        owner: 1,
      },
    },
    {
      $skip: Number(offset),
    },
    {
      $limit: Number(page),
    },
  ]);

  if (!comments) {
    throw new apiError(401, "No comment yet");
  }

  return res
    .status(200)
    .json(new apiResponse(200, { comments }, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(401, "Invalid videoId");
  }
  if (!content.trim()) {
    throw new apiError(401, "add some comment");
  }
  const user = req.user;

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: user._id,
  });

  if (!comment) {
    throw new apiError(500, "Error while adding comment");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Comment added successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new apiError(401, "Invalid commentId");
  }

  const comment = await Comment.findByIdAndDelete(commentId);

  if (!comment) {
    throw new apiError(401, "Error while deleting comment");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Comment deleted Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const newContent = req.body;

  if (!commentId) {
    throw new apiError(401, "Invalid commentId");
  }

  const comment = await Comment.findById(commentId);
  const user = req.user;
  if (!comment) {
    throw new apiError(401, "No comment found");
  }

  const update = await Comment.findByIdAndUpdate(
    commentId,
    {
      content: newContent,
    },
    {
      new: true,
    }
  );

  if (!update) {
    throw new apiError(500, "Error while updating comment");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Comment updated Successfully"));
});

export { getVideoComment, addComment, deleteComment, updateComment };
