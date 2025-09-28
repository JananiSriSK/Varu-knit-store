import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import sendEmail from "../utils/sendEmail.js";
import { createAdminNotification, createUserNotification } from "./notificationController.js";
import { sendOrderNotification } from "../utils/notificationService.js";

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

  // Create user notification for order confirmation
  await createUserNotification(
    req.user._id,
    'order_placed',
    'Order Placed Successfully',
    `Your order #${order._id.toString().slice(-8)} has been placed successfully for ₹${totalPrice}`,
    order._id
  );

  // Send order confirmation notifications using notification service
  try {
    console.log(`Sending order confirmation notification for order: ${order._id}`);
    await sendOrderNotification(req.user._id, order._id, 'Processing', totalPrice);
    console.log('Order confirmation notification completed');
  } catch (notificationError) {
    console.error('Failed to send order confirmation notification:', notificationError);
  }
  
  // SMS notification
  if (req.user.phone) {
    try {
      const { sendOrderSMS } = await import('../utils/sendSMS.js');
      const orderId = order._id.toString().slice(-8);
      await sendOrderSMS(req.user.phone, 'Processing', orderId);
      console.log('Order SMS sent successfully');
    } catch (smsError) {
      console.log("SMS notification failed:", smsError.message);
    }
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

  // Send status update notifications using notification service
  try {
    console.log(`Sending order status notification for order: ${order._id}, status: ${order.orderStatus}`);
    await sendOrderNotification(order.user, order._id, order.orderStatus, order.totalPrice);
    console.log('Order status notification completed');
  } catch (notificationError) {
    console.error('Failed to send order status notification:', notificationError);
  }
  
  // Send SMS notification
  try {
    const user = await User.findById(order.user);
    if (user.phone && order.orderStatus !== "Processing") {
      const { sendOrderSMS } = await import('../utils/sendSMS.js');
      const orderId = order._id.toString().slice(-8);
      await sendOrderSMS(user.phone, order.orderStatus, orderId);
    }
  } catch (smsError) {
    console.log("SMS notification failed:", smsError.message);
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
