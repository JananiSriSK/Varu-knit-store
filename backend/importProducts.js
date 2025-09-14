import fs from 'fs';
import csv from 'csv-parser';
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";
import connectDB from "./config/db.js";

dotenv.config({ path: "./config/.env" });

const importProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log("Existing products cleared");

    // Create admin user if doesn't exist
    let adminUser = await User.findOne({ email: "admin@varuknits.com" });
    
    if (!adminUser) {
      adminUser = await User.create({
        name: "Admin",
        email: "admin@varuknits.com",
        password: "admin123",
        role: "admin",
        avatar: {
          public_id: "admin_avatar",
          url: "/images/admin.jpg"
        }
      });
      console.log("Admin user created");
    }

    const products = [];
    
    // Read CSV file
    fs.createReadStream('./products.csv')
      .pipe(csv())
      .on('data', (row) => {
        const product = {
          name: row.name,
          description: row.description,
          price: parseInt(row.price),
          image: [{ 
            public_id: row.name.toLowerCase().replace(/[^a-z0-9]/g, '_'), 
            url: `/images/${row.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg` 
          }],
          category: row.category,
          subcategory: row.subcategory,
          stock: parseInt(row.stock),
          size: row.sizes.includes(',') ? row.sizes.split(',') : [row.sizes],
          user: adminUser._id
        };
        products.push(product);
      })
      .on('end', async () => {
        try {
          await Product.insertMany(products);
          console.log(`${products.length} products imported successfully`);
          console.log("Database seeded successfully!");
          process.exit(0);
        } catch (error) {
          console.error("Error inserting products:", error);
          process.exit(1);
        }
      });
      
  } catch (error) {
    console.error("Error importing products:", error);
    process.exit(1);
  }
};

importProducts();