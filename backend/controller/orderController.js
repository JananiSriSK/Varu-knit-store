import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import sendEmail from "../utils/sendEmail.js";
import { createAdminNotification } from "./notificationController.js";

//create Order
export const createNewOrder = handleAsyncError(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  // Create admin notification for new order
  await createAdminNotification(
    'new_order',
    'New Order Placed',
    `New order #${order._id.toString().slice(-8)} placed by ${req.user.name} for ₹${totalPrice}`,
    order._id
  );

  // Send order confirmation email
  try {
    await sendEmail({
      email: req.user.email,
      subject: "Order Placed Successfully - Varu's Knit Store",
      message: `
        <h2>Order Confirmation</h2>
        <p>Dear ${req.user.name},</p>
        <p>Your order has been placed successfully!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Total Amount:</strong> ₹${totalPrice}</p>
        <p>We will verify your payment and process your order soon.</p>
        <p>Thank you for shopping with us!</p>
      `
    });
  } catch (err) {
    console.log("Email notification failed:", err.message);
  }

  res.status(201).json({
    success: true,
    order,
  });
});

//get my Orders - logged in users
export const getmyOrders = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).populate('user', 'name email');

  if (!orders) {
    return next(new HandleError("No Orders found", 400));
  }
  res.status(200).json({
    success: true,
    orders,
  });
});

//admin functionality

//get single order details
export const getsingleOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return next(new HandleError("No such Order found", 400));
  }
  res.status(200).json({
    success: true,
    order,
  });
});

//admin get All Orders
export const getAllOrders = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find().populate('user', 'name email');

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  }); //to calculate total revenue generated

  if (!orders) {
    return next(new HandleError("No Orders found", 400));
  }
  res.status(200).json({
    success: true,
    orders,
    totalAmount,
  });
});

//update Order status
export const updateOrderStatus = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new HandleError("Order not found", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new HandleError("This order is already delivered", 404));
  }

  await Promise.all(
    order.orderItems.map((item) => updateQuantity(item.product, item.quantity))
  ); //to calculate stock of the products, calling the updateQuantity fn for all the order items

  order.orderStatus = req.body.status;

  // Mark payment as verified when admin confirms order
  if (order.orderStatus === "Verified and Confirmed" && order.paymentInfo.status === "pending") {
    order.paymentInfo.status = "verified";
  }

  if (order.orderStatus === "Shipped") {
    order.shippedAt = Date.now();
  }

  if (order.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

  // Send status update email
  try {
    const user = await User.findById(order.user);
    let emailSubject = "";
    let emailMessage = "";
    
    if (order.orderStatus === "Verified and Confirmed") {
      emailSubject = "Order Verified and Confirmed - Varu's Knit Store";
      emailMessage = `
        <h2>Order Confirmed</h2>
        <p>Dear ${user.name},</p>
        <p>Your payment has been verified and order confirmed!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p>We will start processing your order soon.</p>
      `;
    } else if (order.orderStatus === "Shipped") {
      emailSubject = "Order Shipped - Varu's Knit Store";
      emailMessage = `
        <h2>Order Shipped</h2>
        <p>Dear ${user.name},</p>
        <p>Great news! Your order has been shipped.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p>Your order is on its way to you!</p>
      `;
    } else if (order.orderStatus === "Delivered") {
      emailSubject = "Order Delivered - Varu's Knit Store";
      emailMessage = `
        <h2>Order Delivered</h2>
        <p>Dear ${user.name},</p>
        <p>Your order has been delivered successfully!</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p>Thank you for shopping with us!</p>
      `;
    } else if (order.orderStatus === "Cancelled") {
      emailSubject = "Order Cancelled - Varu's Knit Store";
      emailMessage = `
        <h2>Order Cancelled</h2>
        <p>Dear ${user.name},</p>
        <p>Your order has been cancelled.</p>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p>If you have any questions, please contact us.</p>
      `;
    }
    
    if (emailSubject) {
      await sendEmail({
        email: user.email,
        subject: emailSubject,
        message: emailMessage
      });
    }
  } catch (err) {
    console.log("Email notification failed:", err.message);
  }

  res.status(200).json({
    success: true,
    message: "Order updated successfully",
    order,
  });
});

//update stock of the product
async function updateQuantity(id, quantity) {
  const product = await Product.findById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  product.stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

//delete Order
export const deleteOrder = handleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new HandleError("Order not found", 400));
  }

  if (order.orderStatus !== "Delivered") {
    return next(
      new HandleError("Order is not delivered and cannot be deleted", 400)
    );
  }

  await Order.deleteOne({ _id: req.params.id });

  res.status(200).json({
    success: true,
    message: "Order deleted successfully",
  });
});
