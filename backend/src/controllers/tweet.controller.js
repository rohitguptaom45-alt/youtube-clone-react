import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiErrro.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (!content.trim()) {
        throw new ApiError(403, "Tweet Content is require ")
    }

    const newtweet = await Tweet.create({
        owner: req.user._id,
        content
    })

    return res.status(200).json(
        new ApiResponse(200,
            newtweet,
            "New tweet posted Successfully"
        )
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(403, "Invalid User")
    }
    const existeting = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
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
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes"
            }
        },
        {
            $addFields: {
                likecount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {
                            $in: [
                                new mongoose.Types.ObjectId(req.user._id),
                                "$likes.likedBy"
                            ]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                owner: 1,
                content: 1,
                likecount: 1,
                isLiked: 1,
                createdAt: 1,
                updatedAt: 1
            }
        }
    ])

    console.log(existeting)
    // if(existeting.length ==0){
    //     throw new ApiError()
    // }
    return res.status(200).json(
        new ApiResponse(
            200,
            existeting,
            "All USer Twits Are Fetched SuccessFully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params
    const { content } = req.body

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Inavlid Tweet Id")
    }

    const tweetsSearch = await Tweet.findById(tweetId)

    if (req.user._id.toString() !== tweetsSearch.owner.toString()) {
        throw new ApiError(403, "UnAuthorized Access to tweet")
    }

    tweetsSearch.content = content
    await tweetsSearch.save()

    return res.status(200).json(
      new ApiResponse( 200,
        tweetsSearch,
        "Tweet has been Updated Successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Inavlid Tweet Id")
    }

    const tweetsSearch = await Tweet.findById(tweetId)

    if (req.user?._id.toString() !== tweetsSearch.owner.toString()) {
        throw new ApiError(403, "UnAuthorized Access to tweet")
    }

    await tweetsSearch.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet Has been deleted Successfully"
        )
    )
})

const getAlltweets=asyncHandler(async (req, res)=>{
    const tweets=await Tweet.aggregate([
        {
            $match:{}
        },
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
    ])

    if(!tweets){
        throw new ApiError(400,"No tweets Are Founded")
    }

    return res.status(200).json(
        new ApiResponse(200,tweets,"All Tweets Are fethed successfully")
    )
})



export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAlltweets
}