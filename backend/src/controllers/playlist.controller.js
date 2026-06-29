import mongoose, {isValidObjectId, Mongoose} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiErrro.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from '../models/video.model.js'
import { json } from "express"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist

    if(!(name.trim() || description.trim())){
        throw new ApiError(400, "All Fields Are required ")
    }

    const playlist=await Playlist.create({
        name,
        description,
        video:[],
        owner:req.user._id
    })

    if(!playlist){
        throw new ApiError(400, "There is Error While Creating teh Playlist ")
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,"Playlist has been Created Successfully ")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if(!isValidObjectId(userId)){
        throw new ApiError(403,"Inavlid User Id")
    }

   const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
      },
    },
    {
      $addFields: {
        videoCount: {
          $size: "$videos",
        },
        firstVideoThumbnail: {
          $cond: {
            if: { $gt: [{ $size: "$videos" }, 0] },
            then: { $first: "$videos.thumbnail" },
            else: null,
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        videoCount: 1,
        firstVideoThumbnail: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(200,playlists,"Playlist fetched SuccessFully")
  )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)){
        throw new ApiError(403,"Inavlid playlist Id")
    }

    const playlist = await Playlist.aggregate([
      {
        $match:{
          _id:new mongoose.Types.ObjectId(playlistId)
        }
      },
      {
        $lookup:{
          from:"videos",
          localField:"videos",
          foreignField:"_id",
          as:"videos"
        }
      },
      {
        $project:{
          name:1,
          description:1,
          videos:1,
          owner:1,
          createdAt:1
        }
      }
    ])

    return res.status(200).json(
      new ApiResponse(
        200,
        playlist[0],
        "Playlist fetched successFully With Id"
      )
    )
    

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(isValidObjectId(playlistId) || isValidObjectId(videoId))){
      throw new ApiError(400,"Invalid Id's")
    }
    const playlist=await Playlist.findById(playlistId);
    const video=await Video.findById(videoId);

     playlist.videos.push(video._id)
    const newpalylist =await playlist.save()

    return res.status(200).json(
      new ApiResponse(
        200,
        newpalylist,
        "Video Added To the Playlist Successfully"
      )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
     if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid IDs");
}
    const playlist=await Playlist.findById(playlistId);
    const video=await Video.findById(videoId);

      if(playlist.owner.toString()!== req.user._id.toString()){
      throw new ApiError(403,"Only owner can remove the video Form  the playlist")
    }

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

     if (!playlist.videos.some(id => id.toString() === videoId)) {
        throw new ApiError(400, "Video is not present in the playlist");
    }

    const updatedplaylist=await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { videos: videoId } },
   { returnDocument: "after" }
);

    return res.status(200).json(
      new ApiResponse(200,
     updatedplaylist,
      "Video Has Been Remove from the playlist ")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!isValidObjectId(playlistId)){
      throw new ApiError(400,"Inavlid Playlist Id")
    }
    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
      throw new ApiError(400,"Playlis Not Existed")
    }

    if(playlist.owner.toString()!== req.user._id.toString()){
      throw new ApiError(403,"Only owner can Delete the playlist")
    }

   await Playlist.findByIdAndDelete(playlistId)

   return res.status(200).json(
    200,
    {},
    "Playlist has been deleted SuccessFully"
   )

    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
   if(!isValidObjectId(playlistId)){
      throw new ApiError(400,"Inavlid Playlist Id")
    }

    if(!(name.trim() || description.trim())){
      throw new ApiError(
        400,
        "All Field Are Required"
      )
    }

    const playlist=await Playlist.findById(playlistId)

    if(!playlist){
      throw new ApiError(400,"Playlis Not Existed")
    }

    if(playlist.owner.toString()!== req.user._id.toString()){
      throw new ApiError(403,"Only owner can Delete the playlist")
    }

    const updatedPlaylist=await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set:{
          name,
          description
        }
      },
      {
        new:true
      }
    )

    return res.status(200).json(
      new ApiResponse(
        200,
        updatePlaylist,
        "Playlist Name And Description has Been updated Successfully"
      )
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}