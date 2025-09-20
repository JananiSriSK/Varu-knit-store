import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSMS = async ({ phone, message }) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    console.log(`SMS sent successfully to ${phone}`);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS sending failed:', error.message);
    throw new Error(`SMS sending failed: ${error.message}`);
  }
};

export const sendOTPSMS = async (phone, otp) => {
  const message = `Your Varu's Knit Store OTP is: ${otp}. Valid for 10 minutes. Do not share this code.`;
  return await sendSMS({ phone, message });
};

export const sendOrderSMS = async (phone, orderStatus, orderId) => {
  const messages = {
    'Processing': `Order #${orderId} placed successfully! We'll notify you once it's confirmed. Track at varuknits.com`,
    'Confirmed': `Great news! Order #${orderId} confirmed and being prepared for shipment. Expected delivery in 3-5 days.`,
    'Shipped': `Order #${orderId} shipped! Track your package and expect delivery soon. Thank you for shopping with us!`,
    'Delivered': `Order #${orderId} delivered! Hope you love your handmade items. Please rate your experience!`
  };
  
  const message = messages[orderStatus] || `Order #${orderId} status updated to: ${orderStatus}`;
  return await sendSMS({ phone, message });
};