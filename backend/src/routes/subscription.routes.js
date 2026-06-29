import { Router } from "express";
import { varifyJWt } from "../middlewares/auth.middleware.js";
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";

const router=Router()
router.use(varifyJWt)

router.route('/c/:channelId').post(toggleSubscription)

router.route('/u/:subscriberId').get(getSubscribedChannels) //it return teh chennal to which user has subscribed

router.route('/c/:channelId').get(getUserChannelSubscribers)   
// controller to return subscriber list of a channel


export default router