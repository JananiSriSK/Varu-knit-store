import crypto from 'crypto';
import sendEmail from './sendEmail.js';

// Generate 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP via email
export const sendEmailOTP = async (email, otp, name) => {
  try {
    await sendEmail({
      email,
      subject: 'Email Verification - Varu\'s Knit Store',
      message: `
        <h2>Email Verification</h2>
        <p>Dear ${name},</p>
        <p>Your email verification code is:</p>
        <h1 style="color: #7b5fc4; font-size: 32px; text-align: center; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
      `
    });
    return true;
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return false;
  }
};

// Send OTP via SMS (placeholder - requires Twilio setup)
export const sendSMSOTP = async (phone, otp) => {
  try {
    // For now, just log the OTP (in production, use Twilio)
    console.log(`SMS OTP for ${phone}: ${otp}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    return false;
  }
};