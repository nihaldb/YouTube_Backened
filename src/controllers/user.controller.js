import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { User } from "../models/user.model.js";
// import { upload } from "../middlewares/multer.middlewares.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists : username ,email
  // check for avatar or image
  // upload them to cloudinary avatar
  // create user object-  create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return response

  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new apiError(400, "All fields are required");
  }
  // console.log(apiError);
  // console.log(`fullName : ${fullName} , email : ${email} , username : ${username} , password : ${password}`);
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  //   console.log(existedUser);
  if (existedUser) {
    throw new apiError(409, "User with email or username already exists");
  }
  // console.log(existedUser);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath =  req.files?.coverImage[0]?.path

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, "avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "Avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "Error while registering user at server side");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // details from body using req
  // username or email
  // find user
  // password check
  // generate access and refresh token
  // send cookies

  const { username, password } = req.body;
  // console.log(username);
  // console.log(req.body);
  if (!username) {
    throw new apiError(400, "username is required");
  }
  const user = await User.findOne({
    username,
  });

  if (!user) {
    throw new apiError(404, " user does not exist");
  }

  // console.log(user);
  // console.log(password);

  const Password = await user.comparePassword(password);

  if (!Password) {
    throw new apiError(401, "password is invalid");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.body.refreshToken || req.cookies.refreshToken;
  
    if (!incomingRefreshToken) {
      throw new apiError(401, "unauthorized request ");
    }
  
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id)
  
    if(!user){
      throw new apiError(401, "Invalid refresh Token")
    }
    if (incomingRefreshToken !== user?.refreshToken){
      throw new apiError(401, "Refresh token is expired or used")
    }
  
    const options = {
      httpOnly : true,
      secure : true
    }
  
    const {accessToken , newRefreshToken} = generateAccessAndRefreshTokens(user._id)
  
    return res
    .status(200)
    .cookie("accessToken", accessToken)
    .cookie("refreshToken", newRefreshToken)
    .json(
      new apiResponse(
        200,
        {accessToken , refreshToken : newRefreshToken},
        "Access Token refreshed Successfully"
      )
    )
  } catch (error) {
    throw new apiError(401, error?.message || "Invalid Refresh Token")
  }
});

const changePassword = asyncHandler ( async (req, res )=> {
  const { oldPassword , newPassword} = req.body

  const user = await User.findById(req.user?._id)

  const isPasswordCorrect = await user.comparePassword(oldPassword)
  //  console.log(isPasswordCorrect)
  if(!isPasswordCorrect){
    throw new apiError(400, " Invalid password")
  }

  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new apiResponse(200 , {}, "Password Updated Successfully"))
})

const getCurrentUser = asyncHandler (async (req, res)=>{
  return res
  .status(200)
  .json(new apiResponse(200, req.user , "Current User fetched Successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) =>{
  const {fullName, email} = req.body

  if(!fullName || !email){
    throw new apiError(400, " All fields are required")
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set :{
        fullName,
        email : email
      }
    },
    {new : true}
  ).select("-password")
  console.log(user);
  
  return res
  .status(200)
  .json(new apiResponse(200, user ,  "Accounts details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) =>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
    throw new apiError(400, "Avatar file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if(!avatar.url){
    throw new apiError(400, "Error while uploading avatar")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
       $set: {
        avatar : avatar.url
       }
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(200, " Avatar changed successfully")
  )
})

const updateUserCoverImage = asyncHandler(async (req, res) =>{
  const CoverImageLocalPath = req.file?.path

  if(!CoverImageLocalPath){
    throw new apiError(400, "CoverImage file is missing")
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath)
  if(!coverImage.url){
    throw new apiError(400, "Error while uploading coverImage")
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
       $set: {
        coverImage : coverImage.url
       }
    },
    {new : true}
  ).select("-password")

  return res
  .status(200)
  .json(
    new apiResponse(200, " CoverImage changed successfully")
  )
})

const getUserChannelProfile = asyncHandler(async (req,res) => {
    const username = req.param('username')
    console.log(username);
    

    if(!username?.trim()){
      throw new apiError(400, " Username is missing")
    }

  const channel = await User.aggregate([
    {
      $match : {
        username : username?.toLowerCase()
      }
    },
    {
      $lookup : {
        from: "subscriptions",
        localField : "_id",
        foreignField : "channel",
        as : "subscribers"
      } 
    },
    {
      $lookup : {
        from: "subscriptions",
        localField : "_id",
        foreignField : "subscriber",
        as : "subscribedTo"
      }
    },
    {
      $addFields :{
        subscribersCount :{
          $size: "$subscribers"
        },
        channelsSubscribedToCount :{
          $size: "$subscribedTo"
        },

        isSubscribed: {
          $cond: {
            if : {$in: [req.user?.id, "$subscribers.subscribe"]},
            then : true,
            else : false
          }
        }
      }
    },
    {
      $project:{
        fullName : 1,
        username : 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar : 1,
        coverImage : 1,
        email : 1,
        createdAt :1 


      }
    }
  ])

  console.log(channel);

  if(!channel?.length){
    throw new apiError(404,"channel does not exist")
  }

  return res
  .status(200)
  .json(
    new apiResponse(200, channel[0], "User channel fetched Successfully")
  )
})
export { 
   registerUser,
   loginUser,
   logoutUser, 
   refreshAccessToken, 
   changePassword, 
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar,
   updateUserCoverImage,
   getUserChannelProfile
  };
