import mongoose,{isValidObjectId} from "mongoose";
import { Playlist } from "../models/playlist.model";
import {apiError} from "../utils/apiErrors.js"
import { apiResponse } from "../utils/apiResponse.js";
import {asyncHandler } from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler( async ( req , res ) =>{
    // get name and description -> req.body
    // check name and description is not empty
    
    const { name , description } = req.body
    const { user } = req.user
    if(!name || !description){
        throw new apiError(400, "name and description is required")
    }

    const playlist = await Playlist.create({
        name : name,
        description : description,
        owner : user._id,
        video : []
    })

    const createdPlaylist = await Playlist.findById(playlist._id).select("-video -description")

    if(!createPlaylist){
        throw new apiError(500, "Error while creating playlist at server side")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200, {playlist}, " playlist created successfully")
    )
})