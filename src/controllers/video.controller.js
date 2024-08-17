import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  if (!userId) {
    throw new apiError(401, "You must be logged in");
  }

  const findUser = await User.findById(userId);

  if (!findUser) {
    throw new apiError(401, "No user found");
  }

  const offset = (Number(page) - 1) * Number(limit);
  // Very Important
  const filter = userId ? { owner: userId } : {};
  const sort = sortBy ? { [sortBy]: sortType === "desc" ? -1 : 1 } : {};

  const videos = await Video.find(filter)
    .skip(offset)
    .limit(parseInt(limit))
    .sort(sort)
    .exec();

  if (!videos) {
    throw new apiError(500, "Error while retrieving videos ");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Videos retrieved successfully"));
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

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, thumbnail, description } = req.body;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new apiError(401, "No video found");
  }

  const thumbnailLocalFilePath = req.files?.thumbnail[0].path;
  const thumb = await uploadOnCloudinary(thumbnailLocalFilePath);

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumb.url,
      },
    },
    {
      new: true,
    }
  );

  if (!updatedVideo) {
    throw new apiError(500, "Error in updating video");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(401, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(401, "Video not found");
  }

  const delVideo = await Video.findByIdAndDelete(videoId);

  if (!delVideo) {
    throw new apiError(500, "Error while deleting video");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Video deleted successfully"));
});

const togglePublish = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(401, " Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new apiError(401, "No such video");
  }

  const toggle = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !Video.isPublished,
      },
    },
    {
      new: true,
    }
  );

  if (!toggle) {
    throw new apiError(500, "Error in updating publish status");
  }

  return res
    .status(200)
    .json(new apiResponse(200, "Video publish status updated successfully"));
});

export { getAllVideos, publishAVideo, updateVideo, deleteVideo, togglePublish };
