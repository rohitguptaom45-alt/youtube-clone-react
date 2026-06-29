import  jwt  from "jsonwebtoken";
import { ApiError } from "../utils/ApiErrro.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const varifyJWt=asyncHandler(async (req,_,next)=>{     //this blanc space represent the res but res is not use that why we write _ we can also write res in this place
   try {
     const token=req.cookies?.accessToken || req.header('Authorization')?.replace("Bearer ","")
   
 
     if(!token){
         throw new ApiError(400,"Unauthorized Request")
     }
 
      const decoder= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 //    if(!decoder){
 //     throw new ApiError(400,"Unauthorized Request")
 //    }
 
    const user=await User.findById(decoder?._id).select("-password -refreshToken")
    if(!user){
         throw new ApiError(400,"Invalid AccessToken ")
    }
    
 req.user=user
 next()
   } catch (error) {
     throw new ApiError(400,"Invalid Access Token ")
   }

})