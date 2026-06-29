import { Router } from "express";
import { varifyJWt } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router=Router()
router.use(varifyJWt)


// router.route('/u/:userId').get(getChannelStats)
// router.route('/u/v/:userId').get(getChannelVideos)

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getChannelVideos);

export default router