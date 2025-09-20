import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String
  },
  phone: {
    type: String
  },
  otp: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['registration', 'login', 'password_reset'],
    required: true
  },
  method: {
    type: String,
    enum: ['email', 'sms', 'both'],
    default: 'email'
  },
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 minutes
  }
}, {
  timestamps: true
});

export default mongoose.model('OTP', otpSchema);