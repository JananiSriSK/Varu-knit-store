import handleAsyncError from "../middleware/handleAsyncError.js";
import User from "../models/userModel.js";
import HandleError from "../utils/handleError.js";
import { sendToken } from "../utils/jwtToken.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import { createAdminNotification } from "./notificationController.js";

//Register user

export const registerUser = handleAsyncError(async (req, res, next) => {
  const { name, password, email } = req.body;
  const user = await User.create({
    name,
    email,
    password,
    avatar: { public_id: "This is temp id", url: "This is temp url" },
  });

  // Send welcome email
  try {
    await sendEmail({
      email: user.email,
      subject: "Welcome to Varu's Knit Store!",
      message: `
        <h2>Welcome to Varu's Knit Store!</h2>
        <p>Dear ${user.name},</p>
        <p>Thank you for registering with us!</p>
        <p>You can now browse our collection of handmade crochet and knitted items.</p>
        <p>Happy shopping!</p>
      `
    });
  } catch (err) {
    console.log("Welcome email failed:", err.message);
  }

  // Create admin notification for new user
  await createAdminNotification(
    'new_user',
    'New User Registered',
    `New user ${user.name} (${user.email}) has registered`,
    user._id
  );

  sendToken(user, 201, res);
});

//Login user

export const loginUser = handleAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new HandleError("Email or password cannot be empty", 400));
  }
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new HandleError("Invalid email or password", 400));
  }

  const isPasswordValid = await user.verifyPassword(password);
  if (!isPasswordValid) {
    if (!isPasswordValid) {
      return next(new HandleError("Invalid email or password", 400));
    }
  }

  // Send login notification email
  try {
    await sendEmail({
      email: user.email,
      subject: "Login Notification - Varu's Knit Store",
      message: `
        <h2>Login Notification</h2>
        <p>Dear ${user.name},</p>
        <p>You have successfully logged into your account.</p>
        <p>Login time: ${new Date().toLocaleString()}</p>
        <p>If this wasn't you, please contact us immediately.</p>
      `
    });
  } catch (err) {
    console.log("Login notification email failed:", err.message);
  }

  sendToken(user, 200, res);
});

//Logout user

export const logoutUser = handleAsyncError(async (req, res, next) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true }); //cookie expires immediately

  res.status(200).json({
    success: true,
    message: "Successfully logged out",
  });
});

//Reset functionality
// Forget password reset link

export const requestPasswordReset = handleAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email }); // user requests for password reset with their email

  if (!user) {
    return next(new HandleError("User does not exist", 400));
  }

  let resetToken;
  try {
    resetToken = user.generatePasswordResetToken(); // custom method to get token from the userModel
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    console.log(`Error: ${error}`);
    return next(
      new HandleError("Could not save reset token, please try again later", 400)
    );
  }

  const resetPasswordURL = `http://localhost:5000/reset/${resetToken}`; // link to be sent in mail to reset password

  const message = `Use the following link to reset your password: ${resetPasswordURL}. \n\n This link will expire in 15 minutes.\n\n If you didn’t request a password reset, please ignore this mail.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset - Varu's Knit Store",
      message
    });

    res.status(200).json({
      success: true,
      message: `Password reset instructions sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    
    return next(new HandleError("Email could not be sent", 500));
  }
});

//Reset password

export const resetPassword = handleAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token) //get the token from reset request url
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
    //check if expire time is greater than cureent time (cureent time has to be smaller- token not expired,
    // so find user)
  });
  if (!user) {
    return next(
      new HandleError("Reset password token is invalid or expired", 404)
    );
  }

  const { password, confirmPassword } = req.body;

  if (password != confirmPassword) {
    return next(new HandleError("Reset does not match", 404));
  }

  user.password = password; // assign the new password in relevant user database
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res); // send user as response
});

//Getting user details

export const getUserDetails = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  //if user logged in id is got through verifyUserAuth functionality in userAuth.js
  res.status(200).json({
    success: true,
    user,
  });
});

//update password (not forget-reset)

export const updatePassword = handleAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const user = await User.findById(req.user.id).select("+password");

  const checkPasswordMatch = await user.verifyPassword(oldPassword);

  if (!checkPasswordMatch) {
    return next(new HandleError("Old password is incorrect", 400));
  }

  if (newPassword !== confirmPassword) {
    return next(new HandleError("Password does not match", 400));
  }

  user.password = newPassword;
  await user.save();

  sendToken(user, 200, res); //sends user info with statuscode and token as response
});

//profile update

export const updateProfile = handleAsyncError(async (req, res, next) => {
  const { name, email, phone, gender } = req.body;
  const updateUserDetails = {
    name,
    email,
  };

  // Add optional fields if provided
  if (phone !== undefined) updateUserDetails.phone = phone;
  if (gender !== undefined) updateUserDetails.gender = gender;

  const user = await User.findByIdAndUpdate(req.user.id, updateUserDetails, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});

//Admin view - get all users

export const getUsersList = handleAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//Admin view - get single user

export const getSingleUser = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new HandleError("User does not exist", 400));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//Admin - update user role
export const updateUserRole = handleAsyncError(async (req, res, next) => {
  const { role } = req.body; //passed to beloew findidandupdate

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true },
    { runValidators: true }
  );
  if (!user) {
    return next(new HandleError("User does not exist", 400));
  }
  res.status(200).json({
    success: true,
    message: "User role updated successfully ",
  });
});

//Admin - delete user role

export const deleteUser = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new HandleError("User does not exist", 400));
  }

  // Prevent deleting admin users
  if (user.role === 'admin') {
    return next(new HandleError("Cannot delete admin users", 403));
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user.id) {
    return next(new HandleError("You cannot delete your own account", 403));
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User profile deleted successfully",
  });
});

// Wishlist functionality
export const addToWishlist = handleAsyncError(async (req, res, next) => {
  const { productId } = req.body;
  console.log('Adding to wishlist:', { userId: req.user.id, productId });
  
  const user = await User.findById(req.user.id);
  
  if (user.wishlist.includes(productId)) {
    return next(new HandleError("Product already in wishlist", 400));
  }
  
  user.wishlist.push(productId);
  await user.save();
  
  console.log('Product added to wishlist successfully');
  res.status(200).json({
    success: true,
    message: "Product added to wishlist"
  });
});

export const removeFromWishlist = handleAsyncError(async (req, res, next) => {
  const { productId } = req.params;
  const user = await User.findById(req.user.id);
  
  user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Product removed from wishlist"
  });
});

export const getWishlist = handleAsyncError(async (req, res, next) => {
  console.log('Getting wishlist for user:', req.user.id);
  
  const user = await User.findById(req.user.id).populate('wishlist');
  
  console.log('Wishlist found:', user.wishlist.length, 'items');
  res.status(200).json({
    success: true,
    wishlist: user.wishlist
  });
});

// Address management
export const addAddress = handleAsyncError(async (req, res, next) => {
  const { name, address, city, state, country, pinCode, phoneNo, isDefault } = req.body;
  
  const user = await User.findById(req.user.id);
  
  // If this is set as default, remove default from other addresses
  if (isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }
  
  user.addresses.push({ name, address, city, state, country, pinCode, phoneNo, isDefault });
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Address added successfully",
    addresses: user.addresses
  });
});

export const updateAddress = handleAsyncError(async (req, res, next) => {
  const { addressId } = req.params;
  const { name, address, city, state, country, pinCode, phoneNo, isDefault } = req.body;
  
  const user = await User.findById(req.user.id);
  const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
  
  if (addressIndex === -1) {
    return next(new HandleError("Address not found", 404));
  }
  
  // If this is set as default, remove default from other addresses
  if (isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }
  
  user.addresses[addressIndex] = { ...user.addresses[addressIndex], name, address, city, state, country, pinCode, phoneNo, isDefault };
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Address updated successfully",
    addresses: user.addresses
  });
});

export const deleteAddress = handleAsyncError(async (req, res, next) => {
  const { addressId } = req.params;
  
  const user = await User.findById(req.user.id);
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Address deleted successfully",
    addresses: user.addresses
  });
});

export const getAddresses = handleAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  res.status(200).json({
    success: true,
    addresses: user.addresses
  });
});

export const setDefaultAddress = handleAsyncError(async (req, res, next) => {
  const { addressId } = req.params;
  
  const user = await User.findById(req.user.id);
  
  // Remove default from all addresses
  user.addresses.forEach(addr => addr.isDefault = false);
  
  // Set new default
  const address = user.addresses.find(addr => addr._id.toString() === addressId);
  if (!address) {
    return next(new HandleError("Address not found", 404));
  }
  
  address.isDefault = true;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: "Default address updated",
    addresses: user.addresses
  });
});
