import express from 'express';
import {
    aliasTopTours,
    getAllTours,
    getTour,
    updateTour,
    createTour,
    deleteTour,getTourStats,getMonthlyPlan} from '../Controllers/tourController.js';
import {protect,restrictTo} from "../Controllers/authController.js";
import {reviewRouter} from "./reviewRouters.js";

const router = express.Router();
router.use('/:tourId/review', reviewRouter);
router.route('/top-5-cheap').get(aliasTopTours,getAllTours)
router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(protect,restrictTo('admin', 'lead-guide', 'guide'),getMonthlyPlan)
router.route('/')
    .get(getAllTours)
    .post(protect,restrictTo('admin', 'lead-guide'),createTour)
router.route('/:id')
    .get(getTour)
    .patch(protect,restrictTo('admin', 'lead-guide'),updateTour)
    .delete(protect,restrictTo('admin','lead-guide'),deleteTour)
// router.route('/:tourId/review').post(protect,restrictTo('user'),setTourUserIds,createReview)

export { router };