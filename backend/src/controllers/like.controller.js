import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/likes.model.js"
import {ApiError} from "../utils/ApiErrro.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const like=await Like.find({
        video:new mongoose.Types.ObjectId(videoId),
        likedBy:new mongoose.Types.ObjectId(req.user._id)    
    })
    
    if(like.length==[]){
       const newLikke= await Like.create({
            video:videoId,
            likedBy:req.user?._id
        })

        return res.status(200).json(
            new ApiResponse(200,newLikke,"Vidoe has been liked Successfully")
        )

    }

    const deleteLike=await Like.deleteOne({video:new mongoose.Types.ObjectId(videoId)})
    if(!deleteLike){
        throw ApiError(400,"Error occure in deleting teh like ")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
           {},
           "like Deleted Successfully"

        )
    )


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

      const like=await Like.findOne({
        comment:new mongoose.Types.ObjectId(commentId),
        likedBy:new mongoose.Types.ObjectId(req.user._id)
    })

    if(like.length==[]){
       const newLikke= await Like.create({
            comment:commentId,
             likedBy:req.user?._id
        })

        return res.status(200).json(
            new ApiResponse(200,newLikke,"Commente has been liked Successfully")
        )

    }

    const deleteLike=await Like.deleteOne({comment:new mongoose.Types.ObjectId(commentId)})
    if(!deleteLike){
        throw ApiError(400,"Error occure in deleting teh like ")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
           {},
           "like Deleted Successfully"

        )
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

      const like=await Like.find({
        tweet:new mongoose.Types.ObjectId(tweetId),
        likedBy:new mongoose.Types.ObjectId(req.user._id)
    })

    if(!like){
       const newLikke= await Like.create({
            tweet:tweetId,
             likedBy:req.user?._id
        })

        return res.status(200).json(
            new ApiResponse(200,newLikke,"tweet has been liked Successfully")
        )

    }

    const deleteLike=await Like.deleteOne({tweet:new mongoose.Types.ObjectId(tweetId)})
    if(!deleteLike){
        throw ApiError(400,"Error occure in deleting teh like ")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
           {},
           "like Deleted Successfully"

        )
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const allLiked=await Like.aggregate([
        {
            $match:{
                likedBy:new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
           $lookup:{
            from:"videos",
            localField:"video",
            foreignField:"_id",
            as:"likedVideo",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
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
                    }
                },
                {
                    $addFields:{
                       owner:{
                        $first:"$owner"
                       }
                    }
                }
            ]
           }
        },
    ])

    if(!allLiked?.length){
    throw new ApiError(404,"No Liked Video Exist")
  }


  const videos = allLiked.map(item => item.likedVideo[0]);

  return res.status(200).json(
    new ApiResponse(200,videos,"Liked Video Fetched SuccessFully")
  )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}