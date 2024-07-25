import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiErrors.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";


const toggleSubscription = asyncHandler(async(req , res)=>{
    const {channelId} = req.params

    const channel = await Subscription.findById(channelId)
    const user = req.user
    if(!channel){
        throw new apiError(400,"No such channel found")
    }

    const subscribed = await Subscription.findOne({
        subscriber :user._id,
        channel : channel
    })

    if(subscribed){
     const del = await Subscription.deleteOne(
        {subscriber : user._id,
        channel : channelId
        }
     )
    return res
    .status(200)
    .json(new apiResponse(200,"Channel unsubscribed"))}

    const sub = await Subscription.create(
        {
            subscription : user._id,
            channel : channelId
        }
    )

    return res
    .status(200)
    .json(new apiResponse(200,"Channel subscribed"))
})


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}