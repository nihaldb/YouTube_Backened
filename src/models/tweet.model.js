import mongoose,{Schema} from "mongoose";

const tweetSchema = new Schema(
    {
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },

        content : {
            type : String,
            required : true
        }

},{timestamps : true})

export const tweet = mongoose.models("tweet",tweetSchema)