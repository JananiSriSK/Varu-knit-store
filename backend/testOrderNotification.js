import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { sendOrderNotification } from './utils/notificationService.js';
import User from './models/userModel.js';

dotenv.config({ path: "./config/.env" });

const testOrderNotification = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    // Find a test user (preferably admin or first user)
    const user = await User.findOne({ role: 'user' });
    if (!user) {
      console.log('No user found for testing');
      return;
    }
    
    console.log(`Testing with user: ${user.email}`);
    
    // Test different order statuses
    const testStatuses = ['Processing', 'Verified and Confirmed', 'Shipped', 'Delivered'];
    
    for (const status of testStatuses) {
      console.log(`\n--- Testing status: ${status} ---`);
      await sendOrderNotification(user._id, 'TEST_ORDER_123', status, 999);
      console.log(`✅ ${status} notification completed`);
    }
    
    console.log('\n🎉 All order notification tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testOrderNotification();