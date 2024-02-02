import express from 'express';
import { getAllReviews,createReview,getReview,updateReview,deleteReview,setTourUserIds } from '../Controllers/reviewController.js';
import {protect,restrictTo} from "../Controllers/authController.js";

const reviewRouter = express.Router({ mergeParams: true })

reviewRouter.use(protect);

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(
    restrictTo('user'),
    setTourUserIds,
    createReview
  )

  reviewRouter
  .route('/:id')
  .get(getReview)
  
  .patch(
    restrictTo('user', 'admin'),
    updateReview
  )
  .delete(
    restrictTo('user', 'admin'),
    deleteReview
  );

export{reviewRouter}