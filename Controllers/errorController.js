import  {AppError}  from '../utils/appError.js';
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message,400)
}
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
  
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message)
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(message, 400)
}
const sendErrorProd = (err, res) => {
    //Operational, trusted error: send message to client
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
          })
    //Programing or other unknown error: don't leak errors details
    }else{
        // console.log("Error", err)
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        })
    }
}
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
      })
}
const globalErrorHandle = (err, req, res, next) => {
    // console.log(err.stack)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development'){
        console.log("error", err)

        sendErrorDev(err,res);
    }else if(process.env.NODE_ENV === 'production'){
        //https://stackoverflow.com/questions/11928013/node-env-is-not-recognized-as-an-internal-or-external-command-operable-comman
        let error = { ...err };
        if(error.kind === 'ObjectId') error = handleCastErrorDB(error)
        if(error.code === 11000){
            error = handleDuplicateFieldsDB(error)
        }
        if(error._message === 'Validation failed'){
            error = handleValidationErrorDB(error)
        }
        sendErrorProd(error,res);
  }
}
export default globalErrorHandle;