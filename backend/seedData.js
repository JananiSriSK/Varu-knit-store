import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";
import connectDB from "./config/db.js";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse dummyProducts.js
const dummyProductsPath = join(__dirname, '../frontend/src/constants/dummyProducts.js');
const dummyProductsContent = fs.readFileSync(dummyProductsPath, 'utf8');

// Extract products array from the file
const productsMatch = dummyProductsContent.match(/const products = (\[[\s\S]*?\]);/);
if (!productsMatch) {
  throw new Error('Could not parse products from dummyProducts.js');
}

// Evaluate the products array
const sampleProducts = eval(productsMatch[1]).map(product => ({
  name: product.name,
  description: product.description || product.name,
  price: product.price,
  category: product.category.toLowerCase(),
  subcategory: product.subcategory,
  stock: product.stock || 5,
  size: product.size,
  image: product.image
}));

dotenv.config({ path: "./config/.env" });

console.log(`Found ${sampleProducts.length} products in dummyProducts.js`);

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Product.deleteMany({});
    console.log("Existing products cleared");

    // Create admin user if doesn't exist
    let adminUser = await User.findOne({ email: "skjananisri@gmail.com" });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin",
        email: "skjananisri@gmail.com",
        password: "kuttipapu2524",
        role: "admin",
        avatar: {
          public_id: "admin_avatar",
          url: "/images/admin.jpg"
        }
      });
      console.log("Admin user created");
    }

    // Insert sample products
    const productsWithUser = sampleProducts.map(product => ({
      ...product,
      user: adminUser._id,
      ratings: 0,
      numberOfReviews: 0,
      reviews: []
    }));
    
    await Product.insertMany(productsWithUser);
    console.log(`${productsWithUser.length} products from dummyProducts.js inserted successfully`);
    console.log(`Total products seeded: ${sampleProducts.length}`);

    console.log("Database seeded successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();