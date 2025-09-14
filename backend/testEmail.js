import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({ path: "./config/.env" });

const testEmail = async () => {
  try {
    console.log("Testing email with credentials:");
    console.log("User:", process.env.SMTP_USER);
    console.log("Password:", process.env.SMTP_PASSWORD ? "***" : "NOT SET");

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Varu's Knit Store" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: "Test Email - Varu's Knit Store",
      html: `
        <h2>Test Email</h2>
        <p>This is a test email to verify email functionality.</p>
        <p>If you receive this, email is working correctly!</p>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result.messageId);
  } catch (error) {
    console.error("Email test failed:", error);
  }
};

testEmail();