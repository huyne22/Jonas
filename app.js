import express from 'express';
import morgan from 'morgan';
import { router as userRouter } from './routes/userRouters.js';
import { router as tourRouter } from './routes/tourRouters.js';
import { reviewRouter } from './routes/reviewRouters.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import  {AppError}  from './utils/appError.js';
import globalErrorHandle from './Controllers/errorController.js';
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss-clean'
import hpp from 'hpp'
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//1, Global middleware

//Set security HTTP headers
app.use(helmet())

//development logging
if(!process.env.NODE_ENV === "development"){
  app.use(morgan('dev'));
}

//Limit request from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'Too many request from this IP, please try again in a hour'
})
app.use('/api', limiter)

//body parser,reading date from body into req.body  
app.use(express.json({ limit: '10kb' }))

//Data sanitization against NoSQL query injection 
app.use(mongoSanitize())

//Data sanitization against XSS
app.use(xss())

// Preventing Parameter Pollution
app.use(hpp({
  whitelist:[
    'duration',
    'ratingsAverage',
    'ratingsQuantity',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))
// Serving static files
app.use(express.static(`${__dirname}/public`));

//Test middleware
app.use((req,res,next) => {
  req.requestTime = new Date().toISOString();
  next();
})

//3,Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`,404))
});
app.use(globalErrorHandle);
export{app};