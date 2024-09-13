import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// import dbconnect from './confiq/database.js';
import dbconnect from './src/confiq/database.js';
// import productRoute from './router/productRoute.js';
import productRoute from './src/router/productRoute.js';
import userRoute from './src/router/userRoute.js';
import orderRoute from './src/router/orderRoute.js';
import paymentRoute from './src/router/paymentRoute.js';
import errorMiddleware from './src/middlewares/error.js';
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
    // origin: 'https://e-commerce-frontend-eb54eh6br-lijinlawrences-projects.vercel.app/', // Your frontend URL
    origin: ['http://localhost:5173',
      'https://e-commerce-frontend-ten-bice.vercel.app/'
    ] ,// Your frontend URL

    credentials: true
  }));

// const allowedOrigins = [
//   'http://localhost:5173',
//   'https://e-commerce-frontend-eb54eh6br-lijinlawrences-projects.vercel.app'
// ];

// app.use(cors({
//   origin: function (origin, callback) {
//       // allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.indexOf(origin) === -1) {
//           const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//           return callback(new Error(msg), false);
//       }
//       return callback(null, true);
//   },
//   credentials: true
// }));



// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads'))); // to convert upload file to static folder for handling images


// Define a route for the root URL
// app.get('/', (req, res) => {
//     res.send('Hello world');
// });

// Use the product, user, and order routes
app.use('/api/v1', productRoute);
app.use('/api/v1', userRoute);
app.use('/api/v1', orderRoute);
app.use('/api/v1', paymentRoute);

// Get the current file path and directory


// // Serve the static files from the "dist" folder (React/Vite build output)
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../../frontend/dist')));

//   // For any route that doesn't match an API route, send back the frontend's index.html
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));
//   });
// }

// console.log(process.env.NODE_ENV);
// console.log(express.static(path.join(__dirname, '../../frontend/dist/')));



// Use custom error middleware
app.use(errorMiddleware);

// Start the server and listen on the port defined in the .env file
app.listen(process.env.PORT, () => {
    console.log(`Server connected successfully on port ${process.env.PORT} in ${process.env.NODE_ENV}`);
});
