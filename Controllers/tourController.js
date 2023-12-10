import fs from 'fs';
import {Tour} from '../models/tourModel.js';
import { APIFeatures } from '../dev-data/utils/apiFeatures.js';
  const aliasTopTours = async(req, res,next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  }
  const getTourStats = async (req,res) => {
    try{
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
    }catch(err){
      res.status(404).json({
        status: 'faild',
        message: err
      })
    }
  }
  const getMonthlyPlan = async (req,res) => {
    try{
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
    }catch(err){
      res.status(404).json({
        status: 'faild',
        message: err
      })
    }
  }
  const getAllTours = async(req, res) => {
  try{
    const features = new APIFeatures(Tour.find(), req.query).filter().sort().fields().pagination()
    const tours = await features.query;
      res.status(200).json({
        status: 'success',
        requestAt : req.requestTime,
        result : tours.length,
        data: {
          tours
        },
      });
  }catch(err){
    res.status(404).json({
      status: 'faild',
      message: err
    })
  }
  }
  const getTour = async (req, res) => {
    try{
      // console.log(req.params)
      const id = req.params.id;
      const tour = await Tour.findById(id)
      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    }catch(err){
      res.status(404).json({
        status: 'faild',
        message: err
      })
    }
  }
  const updateTour = async (req,res) => {
    try{
      const tour = await Tour.findByIdAndUpdate(req.params.id,req.body,{ new: true, runValidators:true });
      res.status(200).json({
        status : 'success',
        data: {
          tour
        }
      })
    }
    catch(err){
      res.status(404).json({
        status: 'faild',
        message: err
      })
    }
  }
  const createTour = async(req, res) => {
  try{
    const newTour = await Tour.create(req.body);
      res.status(200).json({
        status: 'success',
        data: {
          tours: newTour,
        },
      });
  }catch(err){
    res.status(400).json({
      status: 'faild',
      message: err
    })
}
  
  }
  const deleteTour = async (req,res) => {
    try{
       await Tour.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status : 'success',
        data: null
      })
    }catch(err){
      res.status(404).json({
        status: "faild",
        message: err
      })
    }
    
  }
  export{getAllTours,
    getTour,
    updateTour,
    createTour,
    deleteTour,aliasTopTours,
    getTourStats,getMonthlyPlan}