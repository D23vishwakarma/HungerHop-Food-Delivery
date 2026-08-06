import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

export const uploadOnCloudinary = async (filePath) => {

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        if (!filePath) {
            return null;
        }

        const uploadResult = await cloudinary.uploader.upload(filePath);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return uploadResult.secure_url;

    } catch (error) {
        console.error("CLOUDINARY UPLOAD ERROR:", error);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return null;
    }
}
