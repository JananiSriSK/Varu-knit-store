import express from "express";
import {
  getUserDetails,
  getUsersList,
  loginUser,
  logoutUser,
  updateProfile,
  registerUser,
  requestPasswordReset,
  resetPassword,
  updatePassword,
  getSingleUser,
  updateUserRole,
  deleteUser,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../controller/userController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";

const userRouter = express.Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(logoutUser);
userRouter.route("/password/forgot").post(requestPasswordReset);
userRouter.route("/password/reset/:token").put(resetPassword);
userRouter.route("/me").get(verifyUserAuth, getUserDetails);
userRouter.route("/password/update").put(verifyUserAuth, updatePassword);
userRouter.route("/me/update").put(verifyUserAuth, updateProfile);

// admin

userRouter
  .route("/admin/users")
  .get(verifyUserAuth, roleBasedAccess("admin"), getUsersList);
userRouter
  .route("/admin/user/:id")
  .get(verifyUserAuth, roleBasedAccess("admin"), getSingleUser)
  .put(verifyUserAuth, roleBasedAccess("admin"), updateUserRole)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteUser);

// Wishlist routes
userRouter.route("/wishlist").get(verifyUserAuth, getWishlist).post(verifyUserAuth, addToWishlist);
userRouter.route("/wishlist/:productId").delete(verifyUserAuth, removeFromWishlist);

export default userRouter;
