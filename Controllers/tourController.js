import fs from 'fs';
import {Tour} from '../models/tourModel.js';
import { APIFeatures } from '../utils/apiFeatures.js';
import {catchAsync} from '../utils/catchAsync.js';
import {AppError} from '../utils/appError.js';
 

  const aliasTopTours = catchAsync(async(req, res,next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  })
  const getTourStats = catchAsync(async (req,res) => {
      const stats = await Tour.aggregate([
        {$match: {ratingsAverage: {$gte: 4.5}}},
        {
          $group: {
            _id:'$difficulty',
            num:{$sum: 1},
            numRatings:{$sum: '$ratingsQuantity'},
            avgRating: {$avg : '$ratingsAverage'},
            avgPrice: {$avg : '$price'},
            minPrice: {$min : '$price'},
            maxPrice: {$max : '$price'},
          }
        },{
          $sort: { avgPrice: 1}
        }
        // {$match: {_id: {$ne: 'easy'}}}
      ])
      res.status(200).json({
        status: 'success',
        data: {
          stats
        },
      });
  })
  const getMonthlyPlan = catchAsync(async (req,res) => {
      const year = req.params.year * 1;
      const plan = await Tour.aggregate([
        {$unwind: '$startDates'},
        {
          $match: {
            startDates:{
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`)
            }
          }
        },{
          $group: { 
            _id: {$month: '$startDates'},
            numTourStarts: {$sum: 1},
            tours: {$push: '$name'}
          }
        },
        {
          $addFields: {month: '$_id'}
        },
        {
          $project: {
            _id:0
          }
        },
        {
          $sort: {numTourStarts: -1}
        },
        {
          $limit: 6
        }
      ])
      res.status(200).json({
        status: 'success',
        data: {
          plan
        },
      });
  })
  const getAllTours = catchAsync(async(req, res,next) => {
    const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fields()
    .pagination()
    const tours = await features.query;
      res.status(200).json({
        status: 'success',
        requestAt : req.requestTime,
        result : tours.length,
        data: {
          tours
        },
      });
  })
  const getTour = catchAsync(async (req, res,next) => {
      // console.log(req.params)
      const id = req.params.id;
      const tour = await Tour.findById(id)
      if(!tour){
        return next(new AppError('No tour found with that ID', 404));
      }
      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
  })
  const updateTour = catchAsync(async (req,res,next) => {
      const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{ new: true, runValidators:true });
      if(!tour){
        return next(new AppError('No tour found with that ID', 404));
      }
      res.status(200).json({
        status : 'success',
        data: {
          tour
        }
      })
  })
  const createTour = catchAsync(async(req, res) => {
    const newTour = await Tour.create(req.body);
      res.status(200).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
  })
  const deleteTour = catchAsync(async (req,res,next) => {
      const tour = await Tour.findByIdAndDelete(req.params.id);
      if(!tour){
        return next(new AppError('No tour found with that ID', 404));
      }
      res.status(204).json({
        status : 'success',
        data: null
      })
  })
  export{getAllTours,
    getTour,
    updateTour,
    createTour,
    deleteTour,aliasTopTours,
    getTourStats,getMonthlyPlan}