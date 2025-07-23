import express from "express";
import product from "./route/productRoutes.js";
import errorHandleMiddleware from "./middleware/error.js";
import user from "./route/userRoutes.js";
import cookieParser from "cookie-parser";
import order from "./route/orderRoutes.js";

//import dotenv from "dotenv";
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Route
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);

app.use(errorHandleMiddleware);

//dotenv.config({ path: "./config/.env" });
//console.log("Loaded PORT:", process.env.PORT);

export default app;
