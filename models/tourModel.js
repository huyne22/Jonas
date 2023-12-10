import mongoose from 'mongoose';
import slugify from 'slugify';
//cách 1
const tourScheme = new mongoose.Schema({
    name : {
      type: String,
      required:[true,'A tour must have a name'],
      unique: true,
      trim:true
    },
    duration:{
      type:Number,
      required:[true,'A tour must have a duration']
    },
    slug: String,
    maxGroupSize:{
      type:Number,
      required:[true,'A tour must have a group size']
    },
    difficulty:{
      type:String,
      required:[true,'A tour must have a difficulty']
    },
    ratingsAverage:{
      type:Number,
      default: 4.5
    },
    ratingsQuantity:{
      type:Number,
      default: 0
    },
    price:{
      type:Number,
      required:[true,'A tour must have a price']
    },
    priceDiscount: Number,
    summary:{
      type:String,
      trim:true,
      required:[true,"A tour must have a summary"]
    },
    description:{
      type:String,
      trim:true
    },
    imageCover:{
      type:String,
      required:[true,"A tour must have a image"]
    },
    images:[String],
    createAt:{
      type:Date,
      default:Date.now(),
      select:false
    },
    startDates: [Date],
    secretTour: {
      type:Boolean,
      default:false
    }
  }
  //virtual propeties
  // {
  //   toJSON:{virtuals: true},
  //   toObject:{virtuals: true}
  // }
  )
  // tourScheme.virtual('durationWeek').get(function(){
  //   return this.duration / 7;
  // })

  //Document Middleware often use create
  tourScheme.pre('save', function(next){
    this.slug = slugify(this.name, {lower:true});
    next()
  })
  //Query Middleware
  tourScheme.pre(/^find/, function(next){
    this.find({ secretTour: {$ne: true}}) // loại trừ là $ne
    this.start = Date.now();
    next();
  })
  tourScheme.post(/^find/, function(docs,next){
    console.log(`Query took ${Date.now() - this.start} milliseconds!`)
    next();
  })
  //Aggregation Middleware
  tourScheme.pre('aggregate', function(next){
    this.pipeline().unshift({ $match: { secretTour: {$ne: true}}}) //loại bỏ trước khi tổng hợp
    next()
  })
  const Tour = mongoose.model('Tour', tourScheme);
  export { Tour };