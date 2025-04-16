import asyncHandler from "../utils/asyncHandler.js";
import { errorAPI } from "../utils/errorAPI.js";
import jwt from 'jsonwebtoken';
import { User } from "../models/user.models.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    console.log("Sash");
     const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
 
     if (!token) {
         throw new errorAPI(401, "unauthorized user");
     }
    console.log("Sash");
     const data = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
     const user = User.findById(data?._id).select ("-password -refreshtoken")
 
     if (!user) {
         throw new errorAPI(400, "Invalid user for access token")
     }
 
     req.user = user;
     console.log(req.user);
     next()
   } catch (error) {
        throw new errorAPI(400, "error in logout")
   }
})