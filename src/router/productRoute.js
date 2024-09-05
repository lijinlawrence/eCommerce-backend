import express from "express";
import multer from "multer"; // Import multer for handling file uploads
import path from "path"; // Import path module for handling and transforming file paths
import { fileURLToPath } from "url"; // Import fileURLToPath from 'url' to get the current file's path

// Get the current file's path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log the path for debugging
const uploadPath = path.join(__dirname, "../uploads/product");
console.log(uploadPath); // This will log the absolute path

// Set up multer for file storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath); // Set the upload destination
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Set the file name to its original name
    },
  }),
});
import {
  createReview,
  deleteProduct,
  deleteReview,
  getAdminProducts,
  getProducts,
  getReviews,
  getSingleProduct,
  newProduct,
  updateProduct,
} from "../controller/productController.js";
import {
  authorizeRoles,
  isAuthenticatedUser,
} from "../middlewares/authenticate.js";

const router = express.Router();

router.route("/products").get(getProducts);
router.route("/product/:id").get(getSingleProduct);
// .put(updateProduct)
// .delete(deleteProduct);

router
  .route("/review")
  .put(isAuthenticatedUser, createReview)
  .delete(deleteReview);
router.route("/reviews").get(getReviews);

// Admin
router.post(
  "/products/new",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  upload.array("images"),
  newProduct
);
router.get(
  "/admin/products",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAdminProducts
);
router.delete(
  "/admin/product/delete/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteProduct
);
router
  .route("/admin/product/update/:id")
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    upload.array("images"),
    updateProduct
  );
router
  .route("/admin/reviews")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getReviews);
router
  .route("/admin/review")
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);

export default router;
