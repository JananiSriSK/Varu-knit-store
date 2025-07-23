import HandleError from "../utils/handleError.js";
import handleAsyncError from "./handleAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

//Authentication
//This middleware runs before protected routes
//This middleware ensures: Only users with valid JWT cookies can access protected routes.
//The user’s data (req.user) is loaded and ready for use.

export const verifyUserAuth = handleAsyncError(async (req, res, next) => {
  const { token } = req.cookies; //Checks if a token exists in cookies
  if (!token) {
    return next(
      new HandleError(
        "Authentication is missing, please login to continue",
        400
      )
    );
  }
  // verifying token
  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decodedData);
  req.user = await User.findById(decodedData.id); //find user with the token and get user details
  next();
});

// roleBasedAccess

export const roleBasedAccess = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new HandleError(
          `Role ${req.user.role} is not allowed to access the resource`,
          400
        )
      );
    }
    next(); // calling next middleware
  };
};
