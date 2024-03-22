import express from 'express';
import {getCheckoutSession } from '../Controllers/bookingController.js';
import {protect} from "../Controllers/authController.js";

const bookingRouter= express.Router({ mergeParams: true })

bookingRouter
  .route('/checkout-session/:tourId')
  .get(protect,getCheckoutSession)


export{bookingRouter}