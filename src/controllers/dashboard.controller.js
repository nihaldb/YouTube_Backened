import { apiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new apiError(401, "Invalid userId or you must be logged in");
    }

    const subStats = await Subscription.aggregate([
      {
        $match: {
          channel: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "subscribers",
        },
      },
      {
        $addFields: {
          subscribersCount: {
            $size: "$subscribers",
          },
        },
      },
      {
        $project: {
          username: 1,
          avatar: 1,
          subscribersCount: 1,
        },
      },
    ]);

    const VideoStats = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "videoLike",
        },
      },
      {
        $project: {
          totalLike: { $size: videoLike },
          totalViews: $views,
          totalVideos: 1,
        },
      },
      {
        $group: {
          _id: null,
          totalLike: { $sum: "$totalLike" },
          totalViews: { $sum: "$totalViews" },
          totalVideos: { $sum: 1 },
        },
      },
    ]);

    const channelStats = {
      totalSubscribers: subStats[0]?.subscribersCount || 0,
      totalLike: VideoStats[0]?.totalLike || 0,
      totalViews: VideoStats[0]?.totalViews || 0,
      totalVideos: VideoStats[0]?.totalVideos || 0,
    };

    return res
      .status(200)
      .json(
        new apiResponse(200, channelStats, "Channel data fetched successfully")
      );
  } catch (error) {
    console.log(error);

    return res.status(500).json(new apiResponse(500, "Internal server error"));
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new apiError(401, "Invalid id");
  }

  const channelVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "videos",
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$videos",
        },
      },
    },
    {
      $project: {
        _id: 1,
        "videoFile.url": 1,
        "thumbnail.url": 1,
        title: 1,
        description: 1,
        createdAt: 1,
        isPublished: 1,
        totalCount: 1,
      },
    },
  ]);

  if (!channelVideos) {
    throw new apiError(500, "Internal server error");
  }

  return res
    .status(200)
    .json(new apiResponse(200, channelVideos, "videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
