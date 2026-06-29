import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary,deleteOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiErrro.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";


const generateAccessAndrefreshToken = async (useId) => {

  try {
    const user = await User.findById(useId)

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    return { accessToken, refreshToken }

  } catch (error) {
    throw new ApiError(500, "Something wenst wrong while generating the access and refresh token ")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  /*Stepst in the registation
       take value from the the frontend 
       validation for the email and password provided by the user 
       check if the user alredy exist or not (cheking with both email and password)
       check for images & check for avtar 
       if available upload them to cloudnary   
       after the checking hash the password 
       check for the avtar uploaded successfully or not 
       create user objecet -  create enty in the DB (responc3 from db give all the user detail)
       remove password and responvce token field 
       check for user crreated successfully or not 
       return responce 
       */
  const { username, email, fullName, password } = req.body;        //taking value

  if ([username, email, fullName, password].some((field) => field?.trim() === '')) {       //Checking requirement 
    throw new ApiError(400, "All Fields are Required")
  }
  const exiteduser = await User.findOne({          //checking the user existence
    $or: [{ username }, { email }]
  })
  if (exiteduser) {
    throw new ApiError(409, "User with email and usename alredy exist")
  }

  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is Required ")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400, "Avatar file is Required ")
  }


  const user = await User.create({
    email,
    fullName,
    username: username.toLowerCase(),
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  })

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (!createdUser) {
    throw new ApiError(500, "Something Went wrong while registering the User ")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User Created Successfully")
  )
})

const loginUser = asyncHandler(async (req, res) => {
  /*
    take input from the user using req.body 
    varify the user if Exist from the DB using username or email 
   (Check the User Password wheter correct or not   )
    after varification generate the Access token And refresh token 
    store the refresh token in DB
    Send this Token using the ccookies
    before the expiry of ACT ask for the refresh token 
    validate the token 
    continue the setion 
  */
  console.log(req.body)
  const { email, password } = req.body

  if (!email) {     //choose any one of these
    throw new ApiError(400, "Email And Passwors is required ")
  }
  /*const user = await User.findOne({
   $or:[{username},{email}]
  })*/
  const user = await User.findOne({ email })

  if (!user) {
    throw new ApiError(404, "User Does not exist")
  }

  const ispasswordvalid = await user.isPasswordCorrect(password)

  if (!ispasswordvalid) {
    throw new ApiError(404, "Password is incorrect")
  }
  const { accessToken, refreshToken } = await generateAccessAndrefreshToken(user._id)
  console.log(accessToken, refreshToken)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {      //be default cookies can be modiefied by the anyone but through this option we can tell who can modify
    httpOnly: true,      //Only server can modify these cookies through these options 
    secure: false
  }

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser, accessToken, refreshToken
        },
        "User Logged In Successfully"
      )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,                 //this req.user come from auth middleware which is injected in the routers 
    {
      $unset: {
        refreshToken: 1
      }
    },
    {
      returnDocument: 'after'
    }
  )
  const options = {      //be default cookies can be modiefied by the anyone but through this option we can tell who can modify
    httpOnly: true,      //Only server can modify these cookies through these options 
    secure: true
  }

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(200, {}, 'User Logged Out Successfully')
    )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized Request")
  }
 try {
   const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
   const user = await User.findById(decoded?._id)
 
   if (!user) {
     throw new ApiError(401, "Invalid refresh token")
   }
 
   if (incomingRefreshToken !== user.refreshToken) {
     throw new ApiError(401, "Refresh Token is Expire or Invalid ")
   }
 
   const {accessToken,newRefreshToken}=await generateAccessAndrefreshToken(user._id)
   const options = {      //be default cookies can be modiefied by the anyone but through this option we can tell who can modify
     httpOnly: true,      //Only server can modify these cookies through these options 
     secure: true
   }
 
   return res.status(200)
   .cookie("accessToke",accessToken,options)
   .cookie("refreshToken",newRefreshToken,options)
   .json(
     new ApiResponse(
       200,
       {
         accessToken,refreshToken:newRefreshToken
       },
       "Access Token Refreshed Successfully"
     )
   )
 } catch (error) {
      throw new ApiError(401,error?.message || "Invalid Refresh Token")
 }


})


const changeCurrentPassword=asyncHandler(async (req,res)=>{
  /*
  checke for the user is login or not 
  req the old password and varify with the DB 
  req new password 
  save in DB 
  */
 const {oldPassword,newPassword}=req.body

 const user = await User.findById(req.user._id)
 
 const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"Old Password is Incorrect ")
  }

  user.password=newPassword

  await user.save({validateBeforeSave:false})

  return res.status(200).json(
    new ApiResponse(200,{},"Password Changed Successfully")
  )


})


const getCurrentUser=asyncHandler(async (req,res)=>{
  const user=req.user
  return res.status(200).json(
    new ApiResponse(200,user,"current User Fetch Successfully")  // they give direct json instead APIresponce
  )
})

const updateUserDatail=asyncHandler(async (req,res)=>{
  const {fullName,email,}=req.body

  if(!(fullName || email)){
    throw new ApiError(400,'All Field are require')
  }
  const user= await User.findByIdAndUpdate(
    req.user?._id,
    {
     $set:{ email:email,
      fullName:fullName}
    },
    {new:true}        // return the updated info 
  ).select("-password")

  return res.status(200).json(
    new ApiResponse(200,user,"User Detail Updated Successfully")
  )

})

const updateUserAvatar=asyncHandler(async (req,res)=>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is Required ")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
    throw new ApiError(400, "Error in Uploading On Cloud While Updating the Avatar")
  }

  const userOldDetails=await User.findById(
    req.user?._id,
  ).select("avatar")

  const oldAvatarUrl=userOldDetails.avatar



  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true} 
  ).select("-password")

  const deletedSource =await deleteOnCloudinary(oldAvatarUrl)

  if(deletedSource.result!== "ok" ){
      console.log("Error in Deleting the The Old Avatar image")
  }

  return res.status(200).json(
    new ApiResponse(200,user,"Avatar Updated SuccessFully")
  )
})

const updateUserCoverImage=asyncHandler(async (req,res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
      throw new ApiError(400,"Cover file is Required ")
    }


    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
    throw new ApiError(400, "Error in Uploading On Cloud While Updating the Cover Iamge ")
  }

  const userOldDetails=await User.findById(
    req.user?._id,
  ).select("coverImage")

  const oldCoverImageUrl=userOldDetails.coverImage

  const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new:true} 
  ).select("-password")

  const deletedSource =await deleteOnCloudinary(oldCoverImageUrl)

  if(deletedSource.result!== "ok" ){
      console.log("Error in Deleting the The Old Cover image")
  }

  return res.status(200).json(
    new ApiResponse(200,user,"Cover Image  Updated SuccessFully")
  )
})

const getUserProfile=asyncHandler(async(req,res)=>{
  const {username} = req.params
  if(!username.trim()){
    throw new ApiError(400,"Username is missing or not existed")
  }

 const channel= await User.aggregate([
    {
      $match:{
        username:username?.toLowerCase()      //match all the subscriber where usernamee match
      }
    },
    {
      $lookup: {
      from: "subscriptions",      //look into the subscribers and add this to subscribers
      localField: "_id",
      foreignField: "channel",
      as: "subscribers"
    }
    },
    {
      $lookup: {
      from: "subscriptions",      //look into the subscribers and add this to subscribersTo
      localField: "_id",
      foreignField: "subscriber",
      as: "subscribedTo"
    }
    },
    {
      $addFields:{
        subscribersCount:{        //Add new field in teh user name subscribersCount
          $size:"$subscribers"        
        },
        channelsSubscribedToCount:{       //Add new field in teh user name channelsSubscribedToCount
          $size:"$subscribedTo"
        },
        isSubscribed:{          //give the front whether the seubscribe to the chennel tehy are looking 
          $cond:{
            if:{$in: [req.user?._id,"$subscribers.subscriber"]},
            then:true,
            else:false,
          }
        }
      }
    },
    {
      $project:{
        fullName:1,
        username:1,
        subscribersCount:1,
        channelsSubscribedToCount:1,
        isSubscribed:1,
        avatar:1,
        coverImage:1,
        email:1,
      }
    }
  ])

  if(!channel?.length){
    throw new ApiError(404,"chennel does not Exists")
  }

  return res.status(200).json(
    new ApiResponse(200,channel[0],"User Channel Fetched Successfully")
  )

  console.log(channel)
})

const getWatchHistory=asyncHandler(async (req,res)=>{
  const user=await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup:{
        from:"videos",
        localField:"watchHistory",
        foreignField:"_id",
        as:"watchHistory",
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


  return res.status(200).json(
    new ApiResponse(200,user[0].watchHistory,"watch history fetched successfully  ")
  )
})

export { registerUser,
   loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDatail,
   updateUserAvatar,
  updateUserCoverImage,
  getUserProfile,
getWatchHistory }