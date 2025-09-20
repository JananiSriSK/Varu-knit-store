import { sendEmail } from './sendEmail.js';

export const testEmailConnection = async () => {
  try {
    await sendEmail({
      email: 'skjananisri@gmail.com',
      subject: 'Test Email',
      message: '<h1>Test Email</h1><p>If you receive this, email is working!</p>'
    });
    console.log('Email test successful');
    return true;
  } catch (error) {
    console.error('Email test failed:', error.message);
    return false;
  }
};