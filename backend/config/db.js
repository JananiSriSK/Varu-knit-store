import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("MongoDB connection error:", error.message);
    console.log("Please check:");
    console.log("1. Your internet connection");
    console.log("2. MongoDB Atlas IP whitelist (add 0.0.0.0/0 for all IPs)");
    console.log("3. Your MONGO_URI in .env file");
    process.exit(1);
  }
};

export default connectDB;
