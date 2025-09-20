import handleAsyncError from "../middleware/handleAsyncError.js";
import OTP from "../models/otpModel.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import HandleError from "../utils/handleError.js";
import { sendToken } from "../utils/jwtToken.js";

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
export const sendOTP = handleAsyncError(async (req, res, next) => {
  const { email, phone, type = 'registration', method = 'email' } = req.body;

  if (!email && !phone) {
    return next(new HandleError("Email or phone number is required", 400));
  }

  if (method === 'sms' && !phone) {
    return next(new HandleError("Phone number is required for SMS", 400));
  }

  if (method === 'email' && !email) {
    return next(new HandleError("Email is required for email OTP", 400));
  }

  const otp = generateOTP();
  
  // Delete existing OTPs for this email/phone
  await OTP.deleteMany({ 
    $or: [
      { email: email },
      { phone: phone }
    ]
  });

  // Create new OTP
  await OTP.create({
    email,
    phone,
    otp,
    type,
    method
  });

  let sentVia = [];

  // Send OTP via email
  if ((method === 'email' || method === 'both') && email) {
    try {
      await sendEmail({
        email,
        subject: `Varu's Knits - OTP Verification`,
        message: `Your OTP for ${type} is: ${otp}. Valid for 10 minutes.`
      });
      sentVia.push('email');
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }

  // Send OTP via SMS
  if ((method === 'sms' || method === 'both') && phone) {
    try {
      const { sendOTPSMS } = await import('../utils/sendSMS.js');
      await sendOTPSMS(phone, otp);
      sentVia.push('SMS');
    } catch (error) {
      console.error('SMS sending failed:', error);
      console.log(`SMS OTP for ${phone}: ${otp}`);
    }
  }

  res.status(200).json({
    success: true,
    message: `OTP sent successfully via ${sentVia.join(' and ')}`,
    sentVia,
    // For development only - remove in production
    otp: process.env.NODE_ENV === 'development' ? otp : undefined
  });
});

// Verify OTP
export const verifyOTP = handleAsyncError(async (req, res, next) => {
  const { email, phone, otp, userData } = req.body;

  const otpRecord = await OTP.findOne({
    $or: [
      { email: email, otp },
      { phone: phone, otp }
    ]
  });

  if (!otpRecord) {
    return next(new HandleError("Invalid or expired OTP", 400));
  }

  // If this is for registration, create user
  if (otpRecord.type === 'registration' && userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return next(new HandleError("User already exists", 400));
    }

    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: userData.phone,
      isVerified: true,
      avatar: {
        public_id: "default_avatar",
        url: "https://via.placeholder.com/150"
      }
    });

    const token = user.getJWTToken();
    
    // Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } else {
    // Delete OTP after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });
    
    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });
  }
});

// Reset password with OTP
export const resetPasswordWithOTP = handleAsyncError(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const otpRecord = await OTP.findOne({
    email: email,
    otp,
    type: 'password_reset'
  });

  if (!otpRecord) {
    return next(new HandleError("Invalid or expired OTP", 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new HandleError("User not found", 404));
  }

  user.password = newPassword;
  await user.save();

  // Delete OTP after successful reset
  await OTP.deleteOne({ _id: otpRecord._id });

  sendToken(user, 200, res);
});