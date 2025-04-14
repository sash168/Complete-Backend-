import asyncHandler from "../utils/asyncHandler.js";
import { User } from '../models/user.models.js';
import { errorAPI } from '../utils/errorAPI.js';
import { responseAPI } from '../utils/responseAPI.js';
import { uploadFile } from '../utils/cloudinary.js';

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
    
    const existedRec = User.findOne({
        $or: [
          {username}, {email}  
        ]
    })

    if (existedRec) {
        throw new errorAPI(409, "Enter username or email already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files.coverimage[0]?.path;

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

export {registerUser}