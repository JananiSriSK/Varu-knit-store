import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import product from "./route/productRoutes.js";
import errorHandleMiddleware from "./middleware/error.js";
import user from "./route/userRoutes.js";
import cookieParser from "cookie-parser";
import order from "./route/orderRoutes.js";
import content from "./route/contentRoutes.js";
import test from "./route/testRoute.js";
import notification from "./route/notificationRoute.js";
import otp from "./route/otpRoute.js";
import ai from "./route/aiRoutes.js";
import debug from "./route/debugRoute.js";
import favoriteCollection from "./route/favoriteCollectionRoutes.js";

const app = express();

// CORS Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
  createParentPath: true
}));

// Route
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", content);
app.use("/api/v1", test);
app.use("/api/v1", notification);
app.use("/api/v1", otp);
app.use("/api/v1", ai);
app.use("/api/v1", debug);
app.use("/api/v1", favoriteCollection);

app.use(errorHandleMiddleware);

export default app;
