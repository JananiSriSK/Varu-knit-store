import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Product from "./models/productModel.js";
import User from "./models/userModel.js";
import connectDB from "./config/db.js";

dotenv.config({ path: "./config/.env" });

const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const products = [];

  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const product = {
        name: values[0],
        category: values[1],
        subcategory: values[2],
        price: parseInt(values[3]),
        description: values[4].replace(/"/g, ''),
        size: values[5] ? values[5].split(',').map(s => s.trim()) : ['One Size'],
        stock: parseInt(values[6]),
        image: [{
          public_id: `product_${i}`,
          url: `/images/placeholder.jpg`
        }],
        user: null
      };
      products.push(product);
    }
  }
  return products;
};

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing data
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

    // Read and parse CSV file
    const csvPath = path.join(process.cwd(), 'products.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const csvProducts = parseCSV(csvContent);

    // Set admin user ID for all products
    const productsWithUser = csvProducts.map(product => ({
      ...product,
      user: adminUser._id
    }));

    // Insert CSV products
    await Product.insertMany(productsWithUser);
    console.log(`${productsWithUser.length} products inserted successfully from CSV`);

    console.log("Database seeded successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedData();