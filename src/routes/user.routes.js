import { Router } from "express";
import { loginUser, registerUser , logoutUser, refreshAccessToken, updateAccountDetails} from "../controllers/user.controller.js";
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
router.route("/account").post(updateAccountDetails)

// secured routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
export {router}