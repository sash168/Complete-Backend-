import asyncHandler from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';
import { errorAPI } from '../utils/errorAPI.js';
import { responseAPI } from '../utils/responseAPI.js';
import { uploadFile } from '../utils/cloudinary.js';
import jwt from 'JsonWebTokenError';

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new errorAPI(500, "no userid for access and refresh")
        }
        const accessToken = user.createAccessToken();
        const refreshToken = user.createRefreshToken();
        
        user.refreshtoken = refreshToken;
        await user.save({ validateBeforeSave: false });
        
        return { accessToken, refreshToken };
    } catch (e) {
        throw new errorAPI(500, "Server error for access and refresh")
    } 
}

const registerUser = asyncHandler(async (req, res) => {
    // res.status(200).json({
    //     message: "Sashu"
    // })

    //get fields
    //validate
    //check if username or email already exist
    //check for avtar and coverimage
    //if proper upload on cloudinary
    //make db call for create
    //remove password and refresh token
    //return res

    const { username, password, fullname, email } = req.body;
    console.log(email);

    if ([username, password, fullname, email].some((field) =>
        field?.trim() == ""
    )) {
        throw new errorAPI(400, "All fields are required");
    }
    
    const existedRec = await User.findOne({
        $or: [
          {username}, {email}  
        ]
    })

    if (existedRec) {
        throw new errorAPI(409, "Enter username or email already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files.coverimage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverImageLocalPath = req.files.coverimage[0]?.path;
    }

    if (!avatarLocalPath) {
        throw new errorAPI(400, "Avatar is required");
    }
    
    const avatar = await uploadFile(avatarLocalPath);
    const coverImage = await uploadFile(coverImageLocalPath);

    if (!avatar) {
        throw new errorAPI(400, "Avatar is required");
    }

    const user = await User.create({
        fullname,
        password,
        email,
        username: username.toLowerCase(),
        coverimage: coverImage?.url || "",
        avatar: avatar.url
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    );

    if (!createdUser) {
        throw new errorAPI(500, "Something went wrong on Server Side, Please try again");
    }

    return res.status(200).json(
        new responseAPI(200, createdUser, "User Created Successfully !!")
    )

})

const loginUser = asyncHandler(async(req, res) => {
    //get details from req.body
    //check if username or email is empty
    //find user
    //check pasword is correct
    //assign access and refresh token 
    //update datebase
    //add this token on cookie

    const { username, password, email } = req.body;

    if (!username && !email) {
        throw new errorAPI(400, "Username and email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if (!user) {
        throw new errorAPI(400, "user does not exist")
    }

    const passwordCheck = await user.isPwdCorrect(password);

    if (!passwordCheck) {
        throw new errorAPI(400, "please enter correct passwoed");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshtoken");

    const options = {
        secure: true,
        httpOnly: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new responseAPI(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "logged in"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshtoken: undefined
            }
        },
        {
            new: true
        }
    )

    console.log("id" + req.user._id);

    const options = {
            httpOnly: true,
            secure: true
    }
    
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new responseAPI(200, {}, "Logged out successfully")
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        //get refresh token from req body
        //decode if the incoming refresh token
        //get user from id
        //compare incoming token with db token 
        //pass to generateacessreftoken
        //create new access and refresh
        
        const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
    
        if (!incomingToken) {
            throw new errorAPI(400, "Invalid incoming ref token");
        }
    
        const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)
    
        if (!decodedToken) {
            throw new errorAPI(400, "cant decode the ref token");
        }
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new errorAPI(400, "no user found");
        }
    
        if (incomingToken !== user?.refreshtoken) {
            throw new errorAPI(400, "both doesnt match");
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    
        const options = {
            httpOnly: true,
            secur: true
        }
    
        return res.status(200)
            .cookie(accessToken, accessToken, options)
            .cookie(refreshToken, refreshToken, options)
            .json(
                new responseAPI(
                    200,
                    {
                        accessToken, refreshToken
                    },
                    "Token updated"
                )
            )
    } catch (error) {
        throw new errorAPI(400, "Error in refresh Token ");
    }

})
export {registerUser, loginUser, logoutUser, refreshAccessToken}