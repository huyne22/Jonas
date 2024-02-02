import fs from 'fs';
import {Tour} from '../models/tourModel.js';
// import { APIFeatures } from '../utils/apiFeatures.js';
import {catchAsync} from '../utils/catchAsync.js';
// import {AppError} from '../utils/appError.js';
import {deleteOne,updateOne,createOne,getOne,getAll} from './handleFactory.js'

//middleware used to setting default values before pass control to the next middleware 
  const aliasTopTours = catchAsync(async(req, res,next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty'; //specifies the fields in result
    next();
  })
  //aggregates data based on difficulty and filter tour with an average rating of 4.5 or higher
  const getTourStats = catchAsync(async (req,res) => {
      const stats = await Tour.aggregate([
        {$match: {ratingsAverage: {$gte: 4.5}}}, //filter data
        {
          $group: { //group data
            _id:'$difficulty',
            num:{$sum: 1},
            numRatings:{$sum: '$ratingsQuantity'},
            avgRating: {$avg : '$ratingsAverage'},
            avgPrice: {$avg : '$price'},
            minPrice: {$min : '$price'},
            maxPrice: {$max : '$price'},
          }
        },{ //sort data
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
  //based on the specified year to filter the data
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
  //return all tours contained in the database
  const getAllTours = getAll(Tour);
  const getTour = getOne(Tour);
  const updateTour = updateOne(Tour);
  const createTour = createOne(Tour);
  const deleteTour = deleteOne(Tour);
  export{getAllTours,
    getTour,
    updateTour,
    createTour,
    deleteTour,aliasTopTours,
    getTourStats,getMonthlyPlan}