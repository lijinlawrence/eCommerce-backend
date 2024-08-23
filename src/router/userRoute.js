import express from 'express'; // Import express framework
import multer from 'multer'; // Import multer for handling file uploads
import path from 'path'; // Import path module for handling and transforming file paths
import { fileURLToPath } from 'url'; // Import fileURLToPath from 'url' to get the current file's path

// Get the current file's path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Log the path for debugging
const uploadPath = path.join(__dirname, '../uploads/user');
console.log(uploadPath); // This will log the absolute path

// Set up multer for file storage
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath); // Set the upload destination
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); // Set the file name to its original name
    }
  })
});


// Import authentication and user controller functions
import {
  changePassword,
  deleteUser,
  forgetPassword,
  getAllUsers,
  getUser,
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateUser,
  updateUserProfile
} from '../controller/authController.js';

import { authorizeRoles, isAuthenticatedUser } from '../middlewares/authenticate.js';

// Create an Express router instance
const router = express.Router();

// Define user-related routes
router.route('/register').post(upload.single('avatar'), registerUser); // Register a new user with file upload
router.route('/login').post(loginUser); // Login user
router.route('/logout').get(logoutUser); // Logout user
router.route('/password/forget').post(forgetPassword); // Request password reset
router.route('/password/reset/:token').post(resetPassword); // Reset password with token
router.route('/password/change').put(isAuthenticatedUser, changePassword); // Change password for authenticated user
router.route('/myprofile').get(isAuthenticatedUser, getUserProfile); // Get profile of authenticated user
router.route('/myprofile/update').put(isAuthenticatedUser,upload.single('avatar'), updateUserProfile); // Update profile of authenticated user

// Define admin-related routes
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers); // Get all users (admin only)
router.route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getUser) // Get user by ID (admin only)
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser) // Update user by ID (admin only)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser); // Delete user by ID (admin only)

export default router; // Export the router to be used in other parts of the application
