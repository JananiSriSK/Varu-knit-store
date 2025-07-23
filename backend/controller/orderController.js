import handleAsyncError from "../middleware/handleAsyncError.js";
import HandleError from "../utils/handleError.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import Order from "../models/orderModel.js";

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

  res.status(201).json({
    success: true,
    order,
  });
});

//get my Orders - logged in users
export const getmyOrders = handleAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });

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
  const order = await Order.findById(req.params.id);

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
  const orders = await Order.find();

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
  const order = await Order.findByIdAndUpdate(req.params.id);

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

  if (order.orderStatus === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });

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
    return next(new HandleError("no order found", 404));
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
