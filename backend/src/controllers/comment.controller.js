import mongoose,{isValidObjectId} from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiErrro.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)

    const totalComments = await Comment.countDocuments({
        video: videoId
    })
    if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $skip: (pageNum - 1) * limitNum
        },
        {
            $limit: limitNum
        }
    ])

    if (!comments) {
        throw new ApiError(200, "No comment on this video ")
    }

    return res.status(200).json(
        new ApiResponse(200, {
            comments,
            page: pageNum,
            limit: limitNum,
            totalComments,
            totalPages: Math.ceil(totalComments / limitNum)
        },"Video Comment fetched Successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Comment are require")
    }

    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id

    })

    if (!newComment) {
        throw new ApiError(400, "Error Occure While Posting teh new Comment ")
    }

    return res.status(200).json(
        new ApiResponse(200, newComment, "Comment has been Posted SuccessFully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body
    const { commentId } = req.params

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required");
    }


    const oldComment = await Comment.findById(commentId)

    if (!oldComment) {
        throw new ApiError(400, "comment Id mismatch")
    }

    if (req.user._id.toString() !== oldComment.owner.toString()) {
        throw new ApiError(402, "UnAuthorisez access Only Owner can Edit The Comment ")
    }

    oldComment.content = content

    await oldComment.save()

    return res.status(200).json(
        new ApiResponse(200, oldComment, "Comment has been updated Successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (req.user._id.toString() !== comment.owner.toString()) {
        throw new ApiError(402, "UnAuthorisez access Only Owner can Delete the comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment Deleted Successfully")
    )

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}