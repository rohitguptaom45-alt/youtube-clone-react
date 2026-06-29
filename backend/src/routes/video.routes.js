import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWt } from "../middlewares/auth.middleware.js";
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    updateVideoDetail,
    updateVideoThumbnail
} from "../controllers/video.controller.js";


const router = Router()

router.use(varifyJWt)           //Apply this middle ware to al the routes in this routes

router
    .route('/')
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1

            }
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .patch(updateVideoDetail)  //Todo: Updating the video detail pending 
    .delete(deleteVideo)

router
    .route("/thubnail/:videoId")
    .patch(upload.single("thumbnail"), updateVideoThumbnail)
    
export default router