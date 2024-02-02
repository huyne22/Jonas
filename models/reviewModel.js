// review / rating / createdAt / ref to tour / ref to user
import mongoose from 'mongoose';
import {Tour} from './tourModel.js';


const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
reviewSchema.pre('save', async function (next) {
  const existingReview = await this.constructor.findOne({ user: this.user, tour: this.tour });

  if (existingReview) {
    const error = new Error('You have already submitted a review for this tour.');
    return next(error);
  }

  next();
});

reviewSchema.pre(/^find/, function(next){
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
})
reviewSchema.statics.calcAverageRatings = async function(tourId){
  console.log(tourId)
  const stats = await this.aggregate([
    {
      $match: {tour:tourId}
    },
    {
        $group: {
          _id: '$tour',
          nRating: { $sum: 1 },
          avgRating: { $avg: '$rating' }
      }
    }
  ])
  console.log(stats)
   if (stats.length > 0) {
     await Tour.findByIdAndUpdate(tourId, {
       ratingsQuantity: stats[0].nRating,
       ratingsAverage: stats[0].avgRating
      });
    }else{
      await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
      });
    }
}
reviewSchema.post('save', function() {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});
reviewSchema.pre(/^findOneAnd/, async function(next) {
  this.r = await this.findOne(); // Lưu bản ghi trước khi cập nhật hoặc xóa
  next();
});
reviewSchema.post(/^findOneAnd/, async function() {
  // Lấy model từ bản ghi đã lưu trước đó
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

export{Review}