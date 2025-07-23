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
orderRouter.route("/new/order").post(verifyUserAuth, createNewOrder);
orderRouter.route("/user/order").get(verifyUserAuth, getmyOrders);

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
