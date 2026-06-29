import { Router } from "express";
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment
} from "../controllers/comment.controller.js";
import { varifyJWt } from "../middlewares/auth.middleware.js";



const router = Router()


router.use(varifyJWt)


router
    .route('/:videoId')
    .get(getVideoComments)
    .post(addComment)

router
    .route('/c/:commentId')
    .patch(updateComment)
    .delete(deleteComment)


export default router