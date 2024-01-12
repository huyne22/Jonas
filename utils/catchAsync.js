//help in catching errors and aysnc becomes easy  
const catchAsync = fn => {
    return (req,res,next) => {
      fn(req,res,next).catch(next);
    }
  }
  export {catchAsync};