import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiErrro.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { Like } from "../models/likes.model.js"
import { Comment } from "../models/comment.model.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const match = {
        isPublished: true,
    }

    if (userId && isValidObjectId(userId)) {
        match.uploadedBY = new mongoose.Types.ObjectId(userId)
    }

    if (query) {
        match.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
        ]
    }

    const sortOptions={}

    sortOptions[sortBy]=sortType==='asc'?1:-1;

    const video =await Video.aggregate([
        {
            $match:match
        },
        {
            $lookup:{
                from:'users',
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1
                        }
                    }
                ]
            },
           
        },
        { $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $sort:sortOptions
        },
        {
            $skip:(pageNum -1)*limitNum
        },
        {
            $limit:limitNum
        }
    ])

    const total =await Video.countDocuments(match)

    if(!video){
        throw new ApiError("No Video Available")
    }

    return res.status(200).json(
        new ApiResponse(200,
            {
                video,
                page:pageNum,
                limit:limitNum,
                totalVideo:total,
                totalPages:Math.ceil(total/limitNum)

            }
        )
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    /* request teh video file from teh user 
    use the multer to save in the locan 
    take teh video from teh loacal and upload on cloudinary 
    updata the DB
    */
    if ([title, description].some((field) => field?.trim() === '')) {
        throw new ApiError(400, "All field Are Required ")
    }
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    const videoLocalPath = req.files?.videoFile[0]?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thubnail is required")
    }
    if (!videoLocalPath) {
        throw new ApiError(400, "Video Is required ")
    }
    const thumbnailUrl = await uploadOnCloudinary(thumbnailLocalPath)
    const videoUrl = await uploadOnCloudinary(videoLocalPath)

    const video = await Video.create({
        videoFile: videoUrl.url,
        thumbnail: thumbnailUrl.url,
        title,
        description,
        duration: videoUrl.duration,
        owner: req.user?._id
    })
    if (!video) {
        throw new ApiError(400, "there is Error While Uploading the video in DB")
    }

    return res.status(201).json(
        new ApiResponse(200, video, "Video Has been Uploaded SuccessFully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

   const videoview = await Video.findById(videoId);

if (!videoview.owner.equals(req.user._id)) {
    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    });
}
    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    },
                    // {
                    //     $addFields: {
                    //         owner: {
                    //             $first: "$owner"
                    //         }
                    //     }
                    // }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                        }
                    },
                    {
                        $lookup:{
                            from:"likes",
                            localField:"_id",
                            foreignField:"comment",
                            as:"commentLikes"
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            },
                            commentLike:{
                                $size:"$commentLikes"
                            }
                        }
                    },
                    {
                        $project: {
                            content: 1,
                            createdAt: 1,
                            "owner.username": 1,
                            "owner.avatar": 1,
                            commentLike:1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                videoFile: 1,
                title: 1,
                description: 1,
                likesCount: 1,
                owner: 1,
                duration: 1,
                views: 1,
                comments: 1,
            }
        }
    ])

    if (!video) {
        throw new ApiError(400, "there is an errro while fetching teh video")
    }
    return res.status(200).json(
        new ApiResponse(200, video, "Video Fetched Successfully")
    )

})          //this controller do teh task of the getcommentt and getvideolike also which is define in like and comment controllers 

const updateVideoDetail = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    //TODO: update video details like title, description, thumbnail
    if (!(title || description)) {
        throw new ApiError(400, "All Fields Are Required")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description
            }
        },
        {
            returnDocument: 'after'
        }
    )

    return res.status(200).json(
        new ApiResponse(200, video,"Video Details updated Successfully")
    )

})          //Todo thsi route are remin to be handle 

const updateVideoThumbnail = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const thubnailLocalPath = req.file?.path
    if (!thubnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required")
    }
    const oldvideodetail = await Video.findById(videoId).select("thumbnail owner")

    if (oldvideodetail.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only owner can Change the thumbnail ")
    }

    const thumbnail = await uploadOnCloudinary(thubnailLocalPath)
    if (!thumbnail?.url) {
        throw new ApiError(401, "Error while Uploading the new Thumbnail")
    }


    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url
            }
        },
        {
            new: true
        }

    )

    const deleteOldThumbnail = await deleteOnCloudinary(oldvideodetail.thumbnail)
    if (deleteOldThumbnail.result !== "ok") {
        throw new ApiError(400, "Error in deleting the Old Thumbnail")
    }

    return res.status(200).json(
        new ApiResponse(200, video, "Thubnail Updated Successfully")
    )


})      

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const videoOldDetail = await Video.findById(videoId)
    if (!videoOldDetail) {
        throw new ApiError(400, "Video Not Found")
    }

    if (videoOldDetail.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "Only owner can Delete the Video ")
    }

    const deleteVideo = await deleteOnCloudinary(videoOldDetail.videoFile)
    const deleteThumbnail = await deleteOnCloudinary(videoOldDetail.thumbnail)
    if (!deleteVideo || !deleteThumbnail) {
        throw new ApiError(400, "Error in deleting teh video on cloudinary")
    }


    await Like.deleteMany({ video: videoId })
    await Comment.deleteMany({ video: videoId })

    const deletingfromDb = await Video.findByIdAndDelete(videoId)

    if (!deletingfromDb) {
        throw new ApiError(400, "Error in deleting the Video from Db")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Video has Been deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const ownership = await Video.findById(videoId)
    if (!ownership) {
        throw new ApiError(404, "Video not found");
    }

    if (ownership.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "UnAuthorized request")
    }


    ownership.isPublished = !ownership.isPublished

    await ownership.save()

    return res.status(200).json(
        new ApiResponse(200, ownership, `Video is now ${ownership.isPublished ? "published" : "unpublished"}`)
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
   updateVideoThumbnail,
   updateVideoDetail,
    deleteVideo,
    togglePublishStatus
}