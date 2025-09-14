import app from "./app.js";
import dotenv from "dotenv";
import connectdb from "./config/db.js";
import { checkShippingDelays } from "./utils/cronJobs.js";
import { testEmailConnection } from "./utils/testEmail.js";
dotenv.config({ path: "./config/.env" });

// Test Cloudinary configuration
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set'
});

connectdb();
process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception Error: ${err.message}`);
  console.log(err.stack);
  console.log("server is shutting down due to unhandled exception error");
  process.exit(1);
});

//console.log(myname);

const port = process.env.PORT || 5000;

const server = app.listen(port, async () => {
  console.log(`Server is running on PORT ${port}`);
  
  // Test email connection
  console.log('Testing email connection...');
  await testEmailConnection();
  
  // Start cron jobs
  checkShippingDelays();
  console.log('Shipping delay checker started');
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server is shutting down, due to unhandled promise rejection`);
  server.close(() => {
    process.exit(1); //s=connection closed has to restart again
  });
});
