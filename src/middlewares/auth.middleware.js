import asyncHandler from "../utils/asyncHandler";
import { errorAPI } from "../utils/errorAPI";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.models";


export const verifyJWT = asyncHandler(async (req, res, next) => {
   try {
     const token = await req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
 
     if (!token) {
         throw new errorAPI(401, "unauthorized user");
     }
 
     const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
     const user = User.findById(data?._id).select ("-password -refreshtoken")
 
     if (!user) {
         throw new errorAPI(400, "Invalid user for access token")
     }
 
     req.user = user;
     next()
   } catch (error) {
        throw new errorAPI(400, "error in logout")
   }
})