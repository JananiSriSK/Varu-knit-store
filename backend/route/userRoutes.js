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
} from "../controller/userController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";

const userRouter = express.Router();

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(logoutUser);
userRouter.route("/forgot/password").post(requestPasswordReset);
userRouter.route("/reset/:token").post(resetPassword);
userRouter.route("/profile").get(verifyUserAuth, getUserDetails); //get details if user logged in
userRouter.route("/password/update").post(verifyUserAuth, updatePassword);
userRouter.route("/profile/update").put(verifyUserAuth, updateProfile);

// admin

userRouter
  .route("/admin/users")
  .get(verifyUserAuth, roleBasedAccess("admin"), getUsersList);
userRouter
  .route("/admin/user/:id")
  .get(verifyUserAuth, roleBasedAccess("admin"), getSingleUser)
  .put(verifyUserAuth, roleBasedAccess("admin"), updateUserRole)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteUser);
export default userRouter;
