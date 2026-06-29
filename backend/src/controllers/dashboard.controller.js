import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/likes.model.js"
import { ApiError } from "../utils/ApiErrro.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user._id
    //get the total video and vides
    const totalVideoView = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" }
            }
        }
    ])

    const totalSubscribers = await Subscription.countDocuments({
        channel: userId
    });

    const videos = await Video.find({ owner: userId }).select("_id")
    const videoId = videos.map((v) => v._id)

    const likeCount = await Like.countDocuments({ video: { $in: videoId } })


    const stats = {
        totalSubscribers,
        totalVideos: totalVideoView[0]?.totalVideos || 0,
        totalViews: totalVideoView[0]?.totalViews || 0,
        likeCount,
    };


    return res.status(200).json(
        new ApiResponse(
            200,
            stats,
            "user deshboard detail fetched Successfully "
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const userId = req.user._id

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLike"
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$videoLike"
                }
            }
        },
        {
            $project: {
                videoLike: 0
            }
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ])


     return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
})

export {
    getChannelStats,
    getChannelVideos
}