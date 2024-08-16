import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    
    
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, video, thumbnail } = req.body;
  const user = req.user;
  if (!(title || description)) {
    throw new apiError(401, "all fields are required");
  }

  if (!video) {
    throw new apiError(401, "Video file is required");
  }
  if (!thumbnail) {
    throw new apiError(401, "Thumbnail file is required");
  }

  const videoLocalFilePath = req.files?.video[0]?.path;
  const thumbnailLocalFilePath = req.files?.thumbnail[0]?.path;

  if (!videoLocalFilePath) {
    throw new apiError(401, "video is required");
  }
  if (!thumbnailLocalFilePath) {
    throw new apiError(401, "thumbnail is required");
  }

  const videoLink = await uploadOnCloudinary(videoLocalFilePath);
  const thumbLink = await uploadOnCloudinary(thumbnailLocalFilePath);

  if (!videoLink) {
    throw new apiError(401, "video is required");
  }
  if (!thumbLink) {
    throw new apiError(401, "thumbnail is required");
  }

  const createdVideo = await Video.create({
    title,
    description,
    video: videoLink.url,
    thumbnail: thumbLink.url,
    owner: user._id,
    isPublished: true,
    views: video.views,
    duration: video.duration,
  });

  if (!createdVideo) {
    throw new apiError(500, "Error while creating video object");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Video uploaded successfully"));
});
