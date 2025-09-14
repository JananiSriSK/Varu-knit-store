import express from 'express';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    console.log('=== TEST EMAIL ENDPOINT CALLED ===');
    
    const { email } = req.body;
    const testEmail = email || 'skjananisri@gmail.com';
    
    console.log(`Testing email to: ${testEmail}`);
    
    await sendEmail({
      email: testEmail,
      subject: 'Test Email from Varu\'s Knit Store',
      message: `
        <h2>Test Email</h2>
        <p>This is a test email to verify the email system is working.</p>
        <p>Sent at: ${new Date().toLocaleString()}</p>
        <p>If you receive this, the email system is working correctly!</p>
      `
    });
    
    res.status(200).json({
      success: true,
      message: `Test email sent to ${testEmail}`
    });
    
  } catch (error) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;