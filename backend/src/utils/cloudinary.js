import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return "could not find the path";
       const responce=await cloudinary.uploader.upload(localFilePath, {
            resource_type:"auto",
            // public_id: "my_dog",
            // overwrite: true,
            // notification_url: "https://mysite.example.com/notify_endpoint"
        })

        console.log("File is Uploaded on Cloudinary",responce.url)
         fs.unlinkSync(localFilePath) 
        return responce

    } catch (err) {
        fs.unlinkSync(localFilePath)  //remove the locally saved temperory file as th euploaad operation got failed
        return null
    }
}

const deleteOnCloudinary=async(url)=>{
    const fileName=url.split('/').pop()

    const publicId=fileName.substring(0, fileName.lastIndexOf("."))

   const responce =await cloudinary.uploader.destroy(publicId);

   return responce


}

export {uploadOnCloudinary,deleteOnCloudinary};