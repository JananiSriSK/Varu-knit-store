import express from 'express';
import { verifyUserAuth, roleBasedAccess } from '../middleware/userAuth.js';
import { testEmailConfiguration } from '../utils/testEmailConfig.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is working',
    timestamp: new Date().toISOString()
  });
});

// Test email configuration
router.get('/test-email', verifyUserAuth, roleBasedAccess('admin'), async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    res.json({ 
      success: result, 
      message: result ? 'Email test successful' : 'Email test failed' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Email test error', 
      error: error.message 
    });
  }
});

// Test order email
router.post('/test-order-email', verifyUserAuth, roleBasedAccess('admin'), async (req, res) => {
  try {
    const { email } = req.body;
    const testEmail = email || req.user.email;
    
    await sendEmail({
      email: testEmail,
      subject: "Test Order Email - Varu's Knit Store",
      message: `
        <h2>Test Order Confirmation</h2>
        <p>Dear Customer,</p>
        <p>This is a test order confirmation email.</p>
        <p><strong>Order ID:</strong> TEST123456</p>
        <p><strong>Total Amount:</strong> ₹999</p>
        <p>This is just a test - no actual order was placed.</p>
      `
    });
    
    res.json({ 
      success: true, 
      message: `Test order email sent to ${testEmail}` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Test order email failed', 
      error: error.message 
    });
  }
});

// Test notification service
router.post('/test-notification-service', verifyUserAuth, roleBasedAccess('admin'), async (req, res) => {
  try {
    const { sendOrderNotification } = await import('../utils/notificationService.js');
    const { userId, orderStatus } = req.body;
    
    const testUserId = userId || req.user._id;
    const testOrderId = 'TEST_ORDER_' + Date.now();
    const testStatus = orderStatus || 'Verified and Confirmed';
    
    await sendOrderNotification(testUserId, testOrderId, testStatus, 999);
    
    res.json({ 
      success: true, 
      message: `Test notification sent for user ${testUserId} with status ${testStatus}` 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Test notification failed', 
      error: error.message 
    });
  }
});

export default router;