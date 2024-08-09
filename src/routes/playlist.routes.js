import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  removeVideo,
  deletePlaylist,
  addVideoToPlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
 
const playRouter = Router()


playRouter.route("/createPlaylist").post(verifyJWT, createPlaylist)
playRouter.route("/addVideo").post( addVideoToPlaylist )

playRouter.route("/removeVideo").post( removeVideo )
playRouter.route("/deletePlaylist").post(deletePlaylist)
playRouter.route("/updatePlaylist").post(updatePlaylist)

export {playRouter}