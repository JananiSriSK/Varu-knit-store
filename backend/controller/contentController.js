import handleAsyncError from "../middleware/handleAsyncError.js";
import Homepage from "../models/homepageModel.js";
import Footer from "../models/footerModel.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import HandleError from "../utils/handleError.js";

// Homepage Controllers
export const getHomepage = handleAsyncError(async (req, res, next) => {
  let homepage = await Homepage.findOne();
  
  if (!homepage) {
    homepage = await Homepage.create({});
  }
  
  res.status(200).json({
    success: true,
    homepage
  });
});

export const updateHomepage = handleAsyncError(async (req, res, next) => {
  try {
    console.log('=== Homepage Update Request ===');
    console.log('Body keys:', Object.keys(req.body));
    console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
    
    const { welcomeTitle, welcomeSubtitle, phoneNumber, aboutTitle, aboutDescription1, aboutDescription2, collectionTitle, collectionBy, collectionDescription } = req.body;
    
    let homepage = await Homepage.findOne();
    if (!homepage) {
      homepage = new Homepage({});
    }
    
    // Update text fields
    if (welcomeTitle) homepage.welcomeTitle = welcomeTitle;
    if (welcomeSubtitle) homepage.welcomeSubtitle = welcomeSubtitle;
    if (phoneNumber) homepage.phoneNumber = phoneNumber;
    if (aboutTitle) homepage.aboutTitle = aboutTitle;
    if (aboutDescription1) homepage.aboutDescription1 = aboutDescription1;
    if (aboutDescription2) homepage.aboutDescription2 = aboutDescription2;
    if (collectionTitle) homepage.collectionTitle = collectionTitle;
    if (collectionBy) homepage.collectionBy = collectionBy;
    if (collectionDescription) homepage.collectionDescription = collectionDescription;
    
    // Handle banner image
    if (req.files && req.files.bannerImage) {
      console.log('Banner image file size:', req.files.bannerImage.size);
      console.log('Banner image mimetype:', req.files.bannerImage.mimetype);
      
      if (req.files.bannerImage.size > 0) {
        try {
          // Delete old image if exists
          if (homepage.bannerImage && homepage.bannerImage.public_id) {
            await deleteFromCloudinary(homepage.bannerImage.public_id);
          }
          
          const result = await uploadToCloudinary(req.files.bannerImage.data, 'varuknits/homepage');
          homepage.bannerImage = result;
          console.log('Banner uploaded:', result.url);
        } catch (error) {
          console.error('Banner upload failed:', error);
          return res.status(400).json({
            success: false,
            message: `Banner upload failed: ${error.message}`
          });
        }
      }
    }
    
    // Handle about image
    if (req.files && req.files.aboutImage) {
      console.log('About image file size:', req.files.aboutImage.size);
      console.log('About image mimetype:', req.files.aboutImage.mimetype);
      
      if (req.files.aboutImage.size > 0) {
        try {
          // Delete old image if exists
          if (homepage.aboutImage && homepage.aboutImage.public_id) {
            await deleteFromCloudinary(homepage.aboutImage.public_id);
          }
          
          const result = await uploadToCloudinary(req.files.aboutImage.data, 'varuknits/homepage');
          homepage.aboutImage = result;
          console.log('About image uploaded:', result.url);
        } catch (error) {
          console.error('About upload failed:', error);
          return res.status(400).json({
            success: false,
            message: `About image upload failed: ${error.message}`
          });
        }
      }
    }
    
    // Handle collection image
    if (req.files && req.files.collectionImage) {
      console.log('Collection image file size:', req.files.collectionImage.size);
      
      if (req.files.collectionImage.size > 0) {
        try {
          // Delete old image if exists
          if (homepage.collectionImage && homepage.collectionImage.public_id) {
            await deleteFromCloudinary(homepage.collectionImage.public_id);
          }
          
          const result = await uploadToCloudinary(req.files.collectionImage.data, 'varuknits/homepage');
          homepage.collectionImage = result;
          console.log('Collection image uploaded:', result.url);
        } catch (error) {
          console.error('Collection upload failed:', error);
          return res.status(400).json({
            success: false,
            message: `Collection image upload failed: ${error.message}`
          });
        }
      }
    }
    
    // Save to database
    await homepage.save();
    console.log('Homepage saved to database');
    
    res.status(200).json({
      success: true,
      message: "Homepage updated successfully",
      homepage
    });
    
  } catch (error) {
    console.error('Homepage update error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update homepage"
    });
  }
});

// Footer Controllers
export const getFooter = handleAsyncError(async (req, res, next) => {
  let footer = await Footer.findOne();
  
  if (!footer) {
    footer = await Footer.create({});
  }
  
  res.status(200).json({
    success: true,
    footer
  });
});

export const updateFooter = handleAsyncError(async (req, res, next) => {
  const { phone, email, instagram, whatsappLink, instagramLink, facebookLink, aboutText, copyrightText } = req.body;
  
  const updateData = {
    phone,
    email,
    instagram,
    whatsappLink,
    instagramLink,
    facebookLink,
    aboutText,
    copyrightText
  };
  
  const footer = await Footer.findOneAndUpdate({}, updateData, { new: true, upsert: true });
  
  res.status(200).json({
    success: true,
    message: "Footer updated successfully",
    footer
  });
});