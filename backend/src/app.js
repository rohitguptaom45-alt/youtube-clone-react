import express from  'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';



const app=express()
const allowedOrigins = process.env.CORS_ORIGIN.split(','); // Split the comma-separated origins into an array
 app.use(cors({                             //app.use use for middleware and configuration
    origin:(origin,callback)=>{
        if(!origin || allowedOrigins.includes(origin)) {
            callback(null,true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials:true
 }))                    

app.use(express.json({limit:'16kb'}))
// app.use(express.urlencoded)   it is sufficient 
app.use(express.urlencoded({extended:true,limit:'16kb'}))   //extented mean we can give more obj 
app.use(express.static('public'))       //public is our foldee
app.use(cookieParser())                 //use to read and set the cookies of the browser




//routess

import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import commentsRouter from './routes/comment.routes.js'
import likeRouter from './routes/like.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'

//route declaration 

app.use('/api/v1/users',userRouter)
app.use('/api/v1/videos',videoRouter)
app.use('/api/v1/comments',commentsRouter)
app.use('/api/v1/likes',likeRouter)
app.use('/api/v1/tweets',tweetRouter)
app.use('/api/v1/playlists',playlistRouter)
app.use('/api/v1/subscriptions',subscriptionRouter)
app.use('/api/v1/dashboards',dashboardRouter)
app.use('/api/v1/healthcheck',healthcheckRouter)








app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        success: err.success || false,
        message: err.message || "Internal Server Error",
        errors: err.errors || []
    });
});

export {app};