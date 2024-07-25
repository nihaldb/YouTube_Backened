import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model";
import { apiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// TODO : CReate playlist
const createPlaylist = asyncHandler(async (req, res) => {
  // get name and description -> req.body
  // check name and description is not empty

  const { name, description } = req.body;
  const { user } = req.user;
  if (!name || !description) {
    throw new apiError(400, "name and description is required");
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: user._id,
    video: [],
  });

  const createdPlaylist = await Playlist.findById(playlist._id).select(
    "-video -description"
  );

  if (!createdPlaylist) {
    throw new apiError(500, "Error while creating playlist at server side");
  }

  return res
    .status(200)
    .json(new apiResponse(200, { playlist }, " playlist created successfully"));
});

// TODO : Get user playlist
const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) {
    throw new apiError(400, "user does not exist");
  }

  const userPlaylist = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "userVideos",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "videoInfo",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$userVideos",
        },

        totalViews: {
          $sum: "$userVideos.views",
        },

        owner: {
          $first: "$videoOwner",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideos: 1,
        totalViews: 1,
        userVideos: {
          _id: 1,
          "videoFile.url": 1,
          "thumbnail.url": 1,
          title: 1,
          duration: 1,
          description: 1,
          views: 1,
        },

        videoInfo: {
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(200, { userPlaylist }, "Playlist retrieved successfully")
    );
});

// TODO : get Playlist By ID
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new apiError(400, "Missing Playlist Id");
  }
  const playID = await Playlist.findById(playlistId);

  if (!playID) {
    throw new apiError(400, "Playlist does not  exist");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "PlaylistVideos",
      },
    },
    {
      $match: {
        "videos.isPublished": true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "videoOwner",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$playlistVideos",
        },

        totalViews: {
          $sum: "$playlistVideos.views",
        },

        owner: {
          $first: "$videoOwner",
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        createdAt: 1,
        updatedAt: 1,
        totalVideos: 1,
        totalViews: 1,
        playlistVideos: {
          _id: 1,
          "videoFile.url": 1,
          "thumbnail.url": 1,
          title: 1,
          duration: 1,
          views: 1,
        },
        videoOwner: {
          username: 1,
          fullName: 1,
          "avatar.url": 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, { playlist }, "Playlist fetched Successfully"));
});

// TODO : Add Video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlistID = await Playlist.findById(playlistId);
  const video = videoId;
  if (!playlistID) {
    throw new apiError(400, "Playlist not found ");
  }

  addVideo = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: video,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new apiResponse(200, "Video added to playlist successfully"));
});
// TODO : Remove Video from playlist
const removeVideo = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new apiError(400, "Playlist not found");
  }

  const user = req.user;
  if (playlist != user._id.toString()) {
    throw new apiError(404, "You are not the owner");
  }

  const removeVideo = await Playlist.findByIdAndUpdate(
    playlist,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new apiResponse(200, { removeVideo }, "Video deleted successfully"));
});
// TODO : Delete Playlist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId) {
    throw new apiError(400, "Invalid playlist");
  }

  const deletePlaylist = await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(
      new apiResponse(200, { deletePlaylist }, "Playlist deleted successfully")
    );
});
// TODO : Update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId || !name || !description) {
    throw new apiError(400, "Invalid playlist ");
  }

  const updatePlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new apiResponse(200, "Playlist details updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  removeVideo,
  deletePlaylist,
  addVideoToPlaylist,
  updatePlaylist,
};
