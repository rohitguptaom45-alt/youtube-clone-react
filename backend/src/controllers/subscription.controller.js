import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiErrro.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Chennel")
    }

//     if (channelId === req.user._id.toString()) {
//     throw new ApiError(400, "You cannot subscribe to your own channel");
//   }

    const subto = await Subscription.findOne({ 
        subscriber:new mongoose.Types.ObjectId(req.user._id),
        channel: new mongoose.Types.ObjectId(channelId) })
        

    if (!subto) {
        const subscribeTo =await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })
        return res.status(200).json(
            new ApiResponse(200, subscribeTo, `${req.user._id} is Subcribe the channel of ${channelId}`)
        )
    }

    const deletesSub = await Subscription.deleteOne({ subscriber:new mongoose.Types.ObjectId(req.user._id),
        channel: new mongoose.Types.ObjectId(channelId) })
    if (!deletesSub) {
        throw new ApiError(400, "there is Error While Deleting the Subscriber ")
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Chennle has Been UnSubscribed")
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const AllSubscriber = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    },
                ]
            }
        },
        {
            $addFields: {
               subscribers: {$first: "$subscribers"}
            }
        },
        {
            $project: {
                subscriber: 1,
                createdAt: 1,
            },
        },


    ])


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subscribers:AllSubscriber,
                subscriberscount:AllSubscriber.length,
            },
            "Subscriber has Been fetched Successfully"
        )
    )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid Subscriber Id")
    }


    const allChannels=await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"chennels",
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
               chennels:{ $first:"$chennels"}
            }
        },
        {
            $project:{
                chennels:1,
                createdAt:1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,allChannels,"all Chennels fetched Successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}