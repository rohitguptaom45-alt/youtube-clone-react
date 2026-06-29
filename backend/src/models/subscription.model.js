import mongoose,{Schema} from "mongoose";

const subscriptionSchema=new Schema({
    subscriber:{
            type:Schema.Types.ObjectId,     // this is for the on Who Subscribing the chennal
             ref:"User"
        },
    channel:{
         type:Schema.Types.ObjectId,            //one to whom the 'Subscriber' is subscribing
        ref:"User"
    }
},{timestamps:true})

export const Subscription=mongoose.model("Subscription",subscriptionSchema)
