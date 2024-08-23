import catchAsyncError from "../middlewares/catchAsyncError.js";
import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);

// Process Payment
export const processPayment = catchAsyncError(async (req, res, next) => {
  try {
    const { amount, address, city, phoneNo, postalCode, country, state, name } =
      req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in the smallest currency unit (e.g., 100 rupees = 10000 paisa)
      currency: "inr",
      description: "TEST PAYMENT",
      metadata: { integration_check: "accept_payment" },
      shipping: {
        address: {
          city: city,
          country: country,
          line1: address,
          postal_code: postalCode,
          state: state,
        },
        name: name,
        phone: phoneNo || "", // Optional field
      },
    });

    res.status(200).json({
      success: true,
      client_secret: paymentIntent.client_secret, // Automatically create a secret key for frontend for each paymentIntent client details ellam ithila irukkum
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const sendStripeApi = catchAsyncError(async (req, res, next) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});
