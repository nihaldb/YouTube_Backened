import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiErrors.js"
import {User} from "../models/user.model.js"
// import { upload } from "../middlewares/multer.middlewares.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js"
const registerUser =  asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists : username ,email
    // check for avatar or image
    // upload them to cloudinary avatar
    // create user object-  create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const {fullName , email , username, password} = req.body
    
    if (
        [fullName, email, username, password].some((field) => field?.trim()==="")
        ){
            throw new apiError(400,"All fields are required")
            }
            // console.log(apiError);
            // console.log(`fullName : ${fullName} , email : ${email} , username : ${username} , password : ${password}`);
     const existedUser = await User.findOne({
        $or: [{ username },{ email }]
      })
    //   console.log(existedUser);
      if (existedUser){
        throw new apiError(409, "User with email or username already exists")
      }
      // console.log(existedUser);

      const avatarLocalPath = req.files?.avatar[0]?.path
      // const coverImageLocalPath =  req.files?.coverImage[0]?.path

      let coverImageLocalPath;
      if(req.files && Array.isArray(req.files.coverImage)
      && req.files.coverImage.length > 0){
          coverImageLocalPath = req.files.coverImage[0].path
      }

      if(!avatarLocalPath){
        throw new apiError(400,"avatar is required")
      }

      const avatar = await uploadOnCloudinary(avatarLocalPath)
      const coverImage = await uploadOnCloudinary(coverImageLocalPath)

      if(!avatar){
        throw new apiError(400,"Avatar is required")
      }

      const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username
      })

      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )

      if(!createdUser){
        throw new apiError(500,"Error while registering user at server side")
      }
      
      return res.status(201).json(
        new apiResponse(200,createdUser, "User registered successfully")
      )

      


    })


export {
    registerUser,
}