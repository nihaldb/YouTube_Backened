import { Router } from "express";
import { loginUser, registerUser , logoutUser, refreshAccessToken, updateAccountDetails,changePassword, getCurrentUser , updateUserAvatar,
    updateUserCoverImage ,getUserChannelProfile
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middlewares.js"
const router = Router()

router.route("/register").post(
    upload.fields([
     {
        name : "avatar",
        maxCount : 1
     },
    {
        name : "coverImage",
        maxCount: 1
    }
]),
    registerUser
)

router.route("/login").post(loginUser)

// secured routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changePassword)
router.route("/account-details").post(verifyJWT, updateAccountDetails)
router.route("/get-user").post(verifyJWT, getCurrentUser)
router.route("/get-user-channel").post(verifyJWT, getUserChannelProfile)
router.route("/update-avatar").post(verifyJWT, updateUserAvatar)
router.route("/update-coverImage").post(verifyJWT, updateUserCoverImage)

export {router}