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
  // /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi
const getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  // lat sẽ chứa giá trị vĩ độ (latitude), và lng sẽ chứa giá trị kinh độ (longitude).
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  // Để chuyển đổi khoảng cách sang radian, chỉ cần chia giá trị khoảng cách cho bán kính của hình cầu (trái đất)
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

const getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng.',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
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
    getTourStats,getMonthlyPlan,
    getDistances,getToursWithin}