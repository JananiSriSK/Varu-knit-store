import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: "./config/.env" });

const sendEmail = async (options) => {
  try {
    console.log('Attempting to send email to:', options.email);
    console.log('Email config - Host:', process.env.SMTP_HOST, 'Port:', process.env.SMTP_PORT);
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: `"Varu's Knit Store" <${process.env.SMTP_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', options.email, 'MessageId:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed to:', options.email, 'Error:', error.message);
    throw error;
  }
};

export default sendEmail;