const fs = require('fs');
const express = require('express');
const morgan =require('morgan');
const app = express();
const userRouter = require('./routes/userRouters')
const tourRouter = require('./routes/tourRouters');

//1, Middleware
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}
app.use((req,res,next) => {
  console.log("Hello word!!!");
  next();
})
app.use((req,res,next) => {
  req.requestTime = new Date().toISOString();
  next();
})

//3,Routes
app.use('/api/v1/users', userRouter)
app.use('/api/v1/tours', tourRouter)

module.exports = app;