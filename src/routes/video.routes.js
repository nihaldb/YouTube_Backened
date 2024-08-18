import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  updateVideo,
  deleteVideo,
  togglePublish,
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const videoRouter = Router();

videoRouter.route("/get-all-videos").post(verifyJWT, getAllVideos);
videoRouter.route("/publish-video").post(verifyJWT, publishAVideo);
videoRouter.route("/update-video").post(verifyJWT, updateVideo);
videoRouter.route("/delete-video").post(verifyJWT, deleteVideo);
videoRouter.route("/toggle-publish").post(verifyJWT, togglePublish);

export { videoRouter };
