import fs from 'fs';
import {Tour} from '../models/tourModel.js';
  const aliasTopTours = async(req, res,next) =>{
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  }
  const getAllTours = async(req, res) => {
  try{
    console.log(req.query)
    //Filtering
    const queryObj = {...req.query}
    const excludedFiles = ["page","limit","sort","fields"]
    excludedFiles.forEach(el => delete queryObj[el])
    //Advanced Filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`);
    let query = Tour.find(JSON.parse(queryStr))
              .sort(req.query.sort ? req.query.sort.split(',').join(' ') : '--createdAt')
              .select(req.query.fields ? req.query.fields.split(',').join(' ') : '-__v');
    //Sorting
    // if(req.query.sort){
    //   const sortBy = req.query.sort.split(',').join(' ');
    //   query = query.sort(sortBy)
    // }else{
    //   query = query.sort('--createdAt')
    // }
    //Field Limiting
    // if(req.query.fields){
    //   const fields = req.query.fields.split(',').join(' ');
    //   query = query.select(fields);
    // }else{
    //   query = query.select('-__v');
    // }
    //Pagination
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    const skip = (page -1) * limit;
    query = query.skip(skip).limit(limit);
    if(req.query.page){
      const numTours = await Tour.countDocuments();
      console.log(numTours);
      if(skip >= numTours) throw new Error('This page does not exit')
    }
    const tours = await query;
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
      console.log(req.params)
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
    deleteTour,aliasTopTours}