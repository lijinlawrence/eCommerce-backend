import express from 'express'; // Import express framework
import { isAuthenticatedUser } from '../middlewares/authenticate.js';
import { processPayment, sendStripeApi } from '../controller/paymentController.js';
const router = express.Router();


router.route('/payment/procces') .post(isAuthenticatedUser,processPayment)                      
router.route('/stripeapi').get( isAuthenticatedUser, sendStripeApi);

export default router  