import express from 'express';
import { sendOTP, verifyOTP, resetPasswordWithOTP } from '../controller/otpController.js';

const router = express.Router();

router.route('/send-otp').post(sendOTP);
router.route('/verify-otp').post(verifyOTP);
router.route('/reset-password-otp').post(resetPasswordWithOTP);

export default router;