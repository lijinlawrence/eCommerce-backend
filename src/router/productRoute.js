import express from "express";
import {
  createReview,
  deleteProduct,
  deleteReview,
  getProducts,
  getReviews,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controller/productController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/authenticate.js";

const router = express.Router();

router.route('/products').get(getProducts)
router
  .route("/product/:id")
  .get(getSingleProduct)
  .put(updateProduct)
  .delete(deleteProduct);
 
  router.route('/review').put(isAuthenticatedUser, createReview)
                         .delete(deleteReview) 
  router.route('/reviews') .get(getReviews)                      


  // Admin
  router.post("/products/new",isAuthenticatedUser,authorizeRoles('admin'), newProduct);



export default router;
