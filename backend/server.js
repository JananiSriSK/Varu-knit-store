import app from "./app.js";
import dotenv from "dotenv";
import connectdb from "./config/db.js";
import { checkShippingDelays } from "./utils/cronJobs.js";
import { testEmailConnection } from "./utils/testEmail.js";
import client from "./config/redis.js";
import { startRedis, startMLService, stopServices } from "./utils/processManager.js";
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
  
  // Auto-start Redis
  startRedis();
  
  // Connect to Redis
  setTimeout(async () => {
    try {
      await client.connect();
    } catch (error) {
      console.log('Redis fallback mode');
    }
  }, 2000);
  
  // Auto-start ML Service
  console.log('Starting ML Service...');
  startMLService();
  
  // Test email connection
  console.log('Testing email connection...');
  await testEmailConnection();
  
  // Start cron jobs
  checkShippingDelays();
  console.log('Shipping delay checker started');
  
  console.log('\nAll services started!');
  console.log('- Backend: http://localhost:5000');
  console.log('- Redis: localhost:6379');
  console.log('- ML Service: http://localhost:5001');
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Server is shutting down, due to unhandled promise rejection`);
  stopServices();
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGINT', () => {
  console.log('\nShutting down services...');
  stopServices();
  server.close(() => {
    process.exit(0);
  });
});
