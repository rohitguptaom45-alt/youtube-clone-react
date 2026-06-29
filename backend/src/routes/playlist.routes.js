import { Router } from "express";
import { 
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists, 
    removeVideoFromPlaylist,
    updatePlaylist} from "../controllers/playlist.controller.js";
import { varifyJWt } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(varifyJWt)

router.route('/').post(createPlaylist)
router.route('/user/:userId').get(getUserPlaylists)
router.route('/:playlistId').get(getPlaylistById).delete(deletePlaylist).patch(updatePlaylist)
router.route('/add/:videoId/:playlistId').patch(addVideoToPlaylist)
router.route('/remove/:videoId/:playlistId').patch(removeVideoFromPlaylist)

export default router