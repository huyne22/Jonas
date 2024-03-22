import { AppError } from '../utils/appError.js';
import { catchAsync } from "../utils/catchAsync.js";
import {Tour} from '../models/tourModel.js';
import Stripe from 'stripe';
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_MY);

const getCheckoutSession = catchAsync(async (req, res, next) => {
    // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  console.log(tour);

   // 2) Create checkout session
   const session = await stripe.checkout.sessions.create({
    mode: 'payment', // hoặc 'subscription'
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`http://127.0.0.1:3004/img/tours/${tour.imageCover}`],
            },
            unit_amount: tour.price * 100,
          },
          quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

export {getCheckoutSession}