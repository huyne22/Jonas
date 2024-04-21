import express from 'express';
import {getOverview,
    getTour,
    getLoginForm,
    getSignupForm,
    getAccount,
    updateUserData,
    getMyTour} from '../Controllers/viewsController.js';
import {isLoggedIn,protect} from '../Controllers/authController.js';
import {createBookingCheckout} from '../Controllers/bookingController.js';

const viewRouter = express.Router();

viewRouter.route('/').get(createBookingCheckout,isLoggedIn,getOverview) 
viewRouter.route('/tour/:slug').get(isLoggedIn,getTour)
viewRouter.route('/login').get(isLoggedIn,getLoginForm)
viewRouter.route('/signup').get(isLoggedIn,getSignupForm)
viewRouter.route('/me').get(protect,getAccount)
viewRouter.route('/my-tours').get(protect,getMyTour)

viewRouter.route('/submit-user-data').post(
    protect,
  updateUserData
);

export { viewRouter };