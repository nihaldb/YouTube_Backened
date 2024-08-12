import mongoose, { Mongoose } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const channel = await Subscription.findById(channelId);
  const user = req.user;
  if (!channel) {
    throw new apiError(400, "No such channel found");
  }

  const subscribed = await Subscription.findOne({
    subscriber: user._id,
    channel: channel,
  });

  if (subscribed) {
    const del = await Subscription.deleteOne({
      subscriber: user._id,
      channel: channelId,
    });
    return res.status(200).json(new apiResponse(200, "Channel unsubscribed"));
  }

  const sub = await Subscription.create({
    subscription: user._id,
    channel: channelId,
  });

  return res.status(200).json(new apiResponse(200, "Channel subscribed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new apiError(401, "Invalid channelId");
  }

  const gotChannel = await Subscription.findById(channelId);

  if (!gotChannel) {
    new apiError(400, "Channel does not exist");
  }

  const subs = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscribers",
      },
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$subscribers.username",
        },
        usernames: { $push: "$subscribers.username" },
      },
    },
    {
      $project: {
        total: 1,
        usernames: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(200, { subs }, " User subscribers fetched successfully")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new apiError(401, "Invalid subscriberId");
  }

  const subscribedChannel = await Subscription.aggregate([
    {
      match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelsSubscribed",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        usernames: { $push: "$channelsSubscribed.username" },
      },
    },
    {
      $project: {
        total: 1,
        usernames: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { subscribedChannel },
        "subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
