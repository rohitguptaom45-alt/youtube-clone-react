import { Router } from "express";
import { varifyJWt } from "../middlewares/auth.middleware.js";
import { createTweet, deleteTweet, getAlltweets, getUserTweets, updateTweet } from "../controllers/tweet.controller.js";

const router=Router()


router.use(varifyJWt)


router.route('/').post(createTweet).get(getAlltweets)
router.route('/user/:userId').get(getUserTweets)
router.route('/:tweetId').patch(updateTweet).delete(deleteTweet)


export default router