import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dbconnect from './confiq/database.js';
import productRoute from './router/productRoute.js';
import userRoute from './router/userRoute.js';
import orderRoute from './router/orderRoute.js';
import paymentRoute from './router/paymentRoute.js';
import errorMiddleware from './middlewares/error.js';
import cookieparser from 'cookie-parser';
import cors from 'cors';

// Create an Express application
const app = express();

// Load environment variables from .env file
dotenv.config();

// Connect to the database
dbconnect();

// Middleware to parse JSON requests
app.use(express.json());

// Middleware to parse cookies
app.use(cookieparser());

// Middleware to enable CORS
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
  }));

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // to convert upload file to static folder for handling images


// Define a route for the root URL
app.get('/', (req, res) => {
    res.send('Hello world');
});

// Use the product, user, and order routes
app.use('/api/v1', productRoute);
app.use('/api/v1', userRoute);
app.use('/api/v1', orderRoute);
app.use('/api/v1', paymentRoute);

// Use custom error middleware
app.use(errorMiddleware);

// Start the server and listen on the port defined in the .env file
app.listen(process.env.PORT, () => {
    console.log(`Server connected successfully on port ${process.env.PORT} in ${process.env.NODE_ENV}`);
});
