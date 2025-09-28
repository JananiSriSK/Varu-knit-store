import sendEmail from './sendEmail.js';
import dotenv from 'dotenv';

dotenv.config({ path: "./config/.env" });

export const testEmailConfiguration = async () => {
  try {
    console.log('Testing email configuration...');
    console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL);
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    
    await sendEmail({
      email: process.env.SMTP_EMAIL,
      subject: "Email Configuration Test - Varu's Knit Store",
      message: `
        <h2>Email Test</h2>
        <p>This is a test email to verify email configuration.</p>
        <p>If you receive this, email sending is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    return true;
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    return false;
  }
};

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailConfiguration();
}