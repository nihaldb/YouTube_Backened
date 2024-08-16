import mongoose from "mongoose";
import { like } from "../models/like.model.js";
import { apiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(401, "Can't get the video");
  }
  const user = req.user;
  const liked = await like.findOne({
    video: videoId,
    likedBy: user._id,
  });

  if (liked) {
    const unlike = await like.deleteOne({
      video: videoId,
      likedBy: user._id,
    });

    return res
      .status(200)
      .json(new apiResponse(200, "Video like removed successfully"));
  }

  if (!liked) {
    const liking = await like.create({
      video: videoId,
      likedBy: user._id,
    });

    return res.status(200).json(new apiResponse(200, "Video liked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new apiError(401, "No video found");
  }
  const user = req.user;

  const liked = await like.findOne({
    comment: commentId,
    likedBy: user._id,
  });

  if (liked) {
    const unlike = await like.deleteOne({
      comment: commentId,
      likedBy: user._id,
    });

    return res.status(200).json(new apiResponse(200, "Comment like removed"));
  }

  if (!liked) {
    const liking = await like.create({
      comment: commentId,
      likedBy: user._id,
    });

    return res.status(200).json(new apiResponse(200, "Comment liked"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const user = req.user;

  if (!tweetId) {
    throw new apiError(401, "No such tweet found");
  }

  const liked = await like.findOne({
    tweet: tweetId,
    likedBy: user._id,
  });

  if (liked) {
    const unlike = await like.deleteOne({
      tweet: tweetId,
      likedBy: user.id,
    });

    return res.status(200).json(new apiResponse(200, "tweet like removed"));
  }

  if (!liked) {
    const liking = await like.create({
      tweet: tweetId,
      likedBy: user.id,
    });

    return res.status(200).json(new apiResponse(200, "tweet liked"));
  }
});

const getLikedVideo = asyncHandler(async (req, res) => {
  const { Id } = req.params;

  if (!Id) {
    throw new apiError(401, "No such User");
  }

  const likedVideo = await like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "userLike",
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "likedBy",
        foreignField: "owner",
        as: "likedVideo",
      },
    },
    {
      $group: {
        _id: null,
        video: { $push: "$likedVideo" },
        User: { $first: "$userLike" },
      },
    },
    {
      $project: {
        video: 1,
        User: {
          fullName: 1,
          avatar: 1,
          username: 1,
        },
      },
    },
  ]);

  if (!likedVideo) {
    throw new apiError(500, "Error while retrieving videos");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Videos retrieved successfully"));
});

const getLikedTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new apiError(401, "No such user");
  }

  const likedTweet = await like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(Id),
      },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "tweet",
        foreignField: "_id",
        as: "likedTweet",
      },
    },
    {
      $group: {
        _id: null,
        tweets: { $push: "$likedTweet" },
      },
    },
    {
      $project: {
        tweets: 1,
        likedBy: 1,
      },
    },
  ]);

  if (!likedTweet) {
    throw new apiError(500, "error in retrieving liked tweets");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "liked tweets retrieved successfully"));
});

const getLikedComment = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new apiError(401, "No such user");
  }

  const likedComment = await like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(Id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedUserComment",
      },
    },

    {
      $lookup: {
        from: "Comments",
        localField: "tweet",
        foreignField: "_id",
        as: "likedComment",
      },
    },
    {
      $group: {
        _id: null,
        tweets: { $push: "$likedTweet" },
        Users: { $first: "$likedUserComment" },
      },
    },
    {
      $project: {
        tweets: 1,
        Users: {
          username: 1,
          avatar: 1,
          fullName: 1,
        },
      },
    },
  ]);

  if (!likedComment) {
    throw new apiError(500, "error in retrieving liked comment");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "liked comments retrieved successfully"));
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedComment,
  getLikedTweet,
  getLikedVideo,
};
