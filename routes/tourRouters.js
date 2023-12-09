import express from 'express';
import {
    aliasTopTours,
    getAllTours,
    getTour,
    updateTour,
    createTour,
    deleteTour} from '../Controllers/tourController.js';
const router = express.Router();
router.route('/top-5-cheap').get(aliasTopTours,getAllTours)
router.route('/')
    .get(getAllTours)
    .post(createTour)
router.route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)
export { router };