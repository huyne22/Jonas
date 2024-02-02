import {catchAsync} from '../utils/catchAsync.js';
import {Review} from '../models/reviewModel.js';
import {createOne,getOne,getAll,updateOne,
    deleteOne} from './handleFactory.js'

    const setTourUserIds = (req,res,next) => {
        if(!req.body.tour) req.body.tour = req.params.tourId;
        if(!req.body.user) req.body.user = req.user.id;
        next()
    }
const getAllReviews = getAll(Review);
const createReview = createOne(Review);
const getReview = getOne(Review);
const updateReview = updateOne(Review);
const deleteReview = deleteOne(Review);
export{getAllReviews,createReview,getReview,updateReview,deleteReview,setTourUserIds}