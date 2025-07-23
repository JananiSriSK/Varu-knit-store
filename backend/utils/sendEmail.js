import nodeMailer from "nodemailer";

export const sendEmail = async (options) => {
  //options is an object
  const transporter = nodeMailer.createTransport({
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: options.email,
    subject: options.subject,
    text: options.message,
  }; //object for mail content

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
  } catch (error) {
    console.error("EMAIL ERROR:", error); //  show exact error
    throw error;
  }
};
