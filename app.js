import express from 'express';
import morgan from 'morgan';
import { router as userRouter } from './routes/userRouters.js';
import { router as tourRouter } from './routes/tourRouters.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import  {AppError}  from './utils/appError.js';
import globalErrorHandle from './Controllers/errorController.js';
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
//1, Middleware
if(!process.env.NODE_ENV === "development"){
  app.use(morgan('dev'));
}

app.use(express.json())
app.use(express.static(`${__dirname}/public`));
app.use((req,res,next) => {
  req.requestTime = new Date().toISOString();
  next();
})

//3,Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`,404))
});
app.use(globalErrorHandle);
export{app};