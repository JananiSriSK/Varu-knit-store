import dotenv from 'dotenv';
import { testEmailConfiguration } from './utils/testEmailConfig.js';
import { sendOrderNotification } from './utils/notificationService.js';
import connectDB from './config/db.js';

dotenv.config({ path: "./config/.env" });

const runTests = async () => {
  try {
    console.log('=== Testing Email Configuration ===');
    await testEmailConfiguration();
    
    console.log('\n=== Connecting to Database ===');
    await connectDB();
    
    console.log('\n=== Testing Order Notification ===');
    // Test with a dummy user ID and order ID
    // Replace with actual IDs from your database for testing
    // await sendOrderNotification('USER_ID_HERE', 'ORDER_ID_HERE', 'Processing', 999);
    
    console.log('\nAll tests completed!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

runTests();