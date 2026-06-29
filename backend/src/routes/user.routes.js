import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateUserAvatar,
    updateUserCoverImage,
    updateUserDatail
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1

        }
    ]),
    registerUser)

router.route('/login').post(loginUser)

//Secure Routes

router.route('/logout').post(varifyJWt, logoutUser)         //done
router.route('/refresh-token').post(refreshAccessToken)
router.route('/changes-password').post(varifyJWt,changeCurrentPassword)
router.route('/current-user').get(varifyJWt,getCurrentUser)
router.route('/update-account').patch(varifyJWt,updateUserDatail)
router.route('/avatar-update').patch(varifyJWt,upload.single('avatar'),updateUserAvatar)
router.route('/cover-image').patch(varifyJWt,upload.single('coverImage'),updateUserCoverImage)
router.route('/c/:username').get(varifyJWt,getUserProfile)
router.route('/watch-history').get(varifyJWt,getWatchHistory)


export default router