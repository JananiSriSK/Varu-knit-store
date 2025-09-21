import PaymentSettings from "../models/paymentSettingsModel.js";
import cloudinary from "cloudinary";

export const getPaymentSettings = async (req, res) => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({});
    }
    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePaymentSettings = async (req, res) => {
  try {
    const { upiId, paymentInstructions } = req.body;
    let settings = await PaymentSettings.findOne();
    
    if (!settings) {
      settings = await PaymentSettings.create({});
    }

    if (upiId) settings.upiId = upiId;
    if (paymentInstructions) settings.paymentInstructions = paymentInstructions;

    if (req.body.qrCodeImage) {
      if (settings.qrCodeImage?.public_id) {
        await cloudinary.v2.uploader.destroy(settings.qrCodeImage.public_id);
      }
      const result = await cloudinary.v2.uploader.upload(req.body.qrCodeImage, {
        folder: "payment_qr"
      });
      settings.qrCodeImage = {
        public_id: result.public_id,
        url: result.secure_url
      };
    }

    settings.updatedAt = new Date();
    await settings.save();

    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};