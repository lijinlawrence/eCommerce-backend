import express from "express";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../middlewares/authenticate.js";
import {
  deleteOrder,
  getSingleOrder,
  myOrders,
  newOrder,
  orders,
  updateOrder,
} from "../controller/orderController.js";

const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/myorders").get(isAuthenticatedUser, myOrders);

//Admin Routes
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), orders);
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

export default router  