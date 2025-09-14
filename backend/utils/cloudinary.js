import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({ path: "./config/.env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (fileBuffer, folder = 'varuknits', resourceType = 'auto') => {
  try {
    console.log('Starting Cloudinary upload...');
    console.log('Folder:', folder);
    console.log('Buffer length:', fileBuffer ? fileBuffer.length : 'No buffer');
    
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('No file data provided');
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileBuffer.length > maxSize) {
      throw new Error(`File too large. Size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`);
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
          quality: 'auto:low',
          fetch_format: 'auto',
          transformation: [
            { width: 1600, height: 1600, crop: 'fit', background: 'white' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            console.log('Cloudinary success:', result.public_id, result.secure_url);
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });

    return {
      public_id: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    console.log('Deleting from Cloudinary:', publicId);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Delete result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;