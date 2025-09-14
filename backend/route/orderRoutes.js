import express from "express";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
import {
  createNewOrder,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
  getmyOrders,
  getsingleOrder,
} from "../controller/orderController.js";

const orderRouter = express.Router();

//logged in user
orderRouter.route("/order/new").post(verifyUserAuth, createNewOrder);
orderRouter.route("/orders/me").get(verifyUserAuth, getmyOrders);
orderRouter.route("/order/:id").get(verifyUserAuth, getsingleOrder);

//admin
orderRouter
  .route("/admin/orders")
  .get(verifyUserAuth, roleBasedAccess("admin"), getAllOrders);
orderRouter
  .route("/admin/order/:id")
  .get(verifyUserAuth, roleBasedAccess("admin"), getsingleOrder)
  .put(verifyUserAuth, roleBasedAccess("admin"), updateOrderStatus)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteOrder);

export default orderRouter;
