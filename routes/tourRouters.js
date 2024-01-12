import express from 'express';
import {
    aliasTopTours,
    getAllTours,
    getTour,
    updateTour,
    createTour,
    deleteTour,getTourStats,getMonthlyPlan} from '../Controllers/tourController.js';
import {protect,restrictTo} from "../Controllers/authController.js";
const router = express.Router();
router.route('/top-5-cheap').get(aliasTopTours,getAllTours)
router.route('/tour-stats').get(getTourStats)
router.route('/monthly-plan/:year').get(getMonthlyPlan)
router.route('/')
    .get(protect,getAllTours)
    .post(createTour)
router.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(protect,restrictTo('admin'),deleteTour)
export { router };