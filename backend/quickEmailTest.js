import dotenv from 'dotenv';
import sendEmail from './utils/sendEmail.js';

dotenv.config({ path: "./config/.env" });

const testEmail = async () => {
  try {
    console.log('Testing email with configuration:');
    console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    
    await sendEmail({
      email: process.env.SMTP_EMAIL, // Send to self
      subject: "Quick Email Test - Varu's Knit Store",
      message: `
        <h2>Email Test</h2>
        <p>This is a quick test to verify email is working.</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('✅ Email test successful!');
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
  }
  
  process.exit(0);
};

testEmail();