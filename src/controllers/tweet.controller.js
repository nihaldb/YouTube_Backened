import { apiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const user = req.user;

  if (!content) {
    throw new apiError(401, "Please write something");
  }

  const tweet = await Tweet.create({
    content,
    owner: user._id,
  });

  if (!tweet) {
    throw new apiError(500, "error while registering tweet");
  }

  return res
    .status(200)
    .json(new apiResponse(200, { tweet }, "Tweet generated successfully"));
});

const getUserTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    throw new apiError(401, "comment id not found");
  }

  const user = await Tweet.find({ owner: new mongoose.Types.ObjectId(id) });
  if (!user) {
    throw new apiError(401, "No user");
  }

  const tweet = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "userTweets",
      },
    },
    {
      $unwind: "$userTweets",
    },
    {
      $group: {
        _id: null,
        content: { $push: "$tweet" },
        User: { $first: "$userTweets" },
      },
    },
    {
      $project: {
        content: 1,
        User: {
          fullName: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
  ]);

  if (!tweet) {
    throw new apiError(401, "Error while getting tweets");
  }

  return res
    .status(200)
    .json(new apiResponse(200, { tweet }, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;

  if (!content) {
    throw new apiError(401, "tweet can't be empty");
  }
  const comment = await Tweet.findById(tweetId);
  const user = req.user;
  if (comment.owner.toString() !== user._id.toString()) {
    throw new apiError(400, "You are not allowed to change this tweet");
  }

  try {
    const update = await Tweet.findByIdAndUpdate(
      tweetId,
      { $set: { content: content } },
      { new: true }
    );

    if (!update) {
      throw new apiError(500, "Error while updating comment");
    }

    return res
      .status(200)
      .json(new apiResponse(200, { update }, "tweet updated successfully"));
  } catch (error) {
    console.log(error, "Something went wrong");
  }
});
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new apiError(401, "invalid comment Id");
  }
  const comment = await Tweet.findById(tweetId);
  const user = req.user;
  if (comment.owner.toString() !== user._id.toString()) {
    throw new apiError(400, "You are not allowed to delete this tweet");
  }

  try {
    const update = await Tweet.findByIdAndDelete(tweetId);

    if (!update) {
      throw new apiError(500, "Error while deleting comment");
    }

    return res
      .status(200)
      .json(new apiResponse(200, "tweet deleted successfully"));
  } catch (error) {
    console.log(error, "Something went wrong");
  }
});

export { createTweet, getUserTweet, updateTweet, deleteTweet };
