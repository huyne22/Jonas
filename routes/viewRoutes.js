import express from 'express';
import {getOverview,
    getTour,
    getLoginForm,
    getAccount,
    updateUserData} from '../Controllers/viewsController.js';
import {isLoggedIn,protect} from '../Controllers/authController.js';

const viewRouter = express.Router();

viewRouter.route('/').get(isLoggedIn,getOverview) 
viewRouter.route('/tour/:slug').get(isLoggedIn,getTour)
viewRouter.route('/login').get(isLoggedIn,getLoginForm)
viewRouter.route('/me').get(protect,getAccount)

viewRouter.route('/submit-user-data').post(
    protect,
  updateUserData
);

export { viewRouter };