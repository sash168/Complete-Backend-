import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });
    
// Upload an file
const uploadFile = async (filepath) => {
    try {
        if (!filepath) return null;
        const uploadResult = await cloudinary.uploader
            .upload(filepath, {
                resource_type: "auto"
            });
        console.log("URL of Uplaoded file : ", uploadResult.url);
        fs.unlinkSync(filepath);
        return uploadResult;
    }
    catch (e) {
        fs.unlinkSync(filepath);//removing file path from local
        console.log(e)
        return null;
    }
    
}

export { uploadFile };