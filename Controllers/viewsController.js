import { AppError } from '../utils/appError.js';
import { catchAsync } from "../utils/catchAsync.js";
import {User} from '../models/userModel.js';
import {Tour} from '../models/tourModel.js';
import {Booking} from '../models/bookingModel.js';

const getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data from collection
  const tours = await Tour.find();
  console.log("huy")
  // 2) Build template
  // 3) Render that template using tour data from 1)
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
});

const getTour = catchAsync(async (req, res, next) => {
  // 1) Get the data, for the requested tour (including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user'
  });
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  // 2) Build template
  // 3) Render template using data from 1)
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};
const getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup into your account'
  });
};

const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

const getMyTour = catchAsync(async (req, res, next) => {
    // 1,Find all bookings
    const bookings = await Booking.find({user: req.user.id})
    // 2,Find tours with the returned IDs 
    const tourIDs = bookings.map(el => el.tour)
    const tours = await Tour.find({_id : { $in : tourIDs}})
    return res.status(200).render('overview',{
      title: 'My tours',
      tours
    })
})

const updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});
export { getOverview,
    getTour,
    getLoginForm,
    getSignupForm,
    getAccount,
    updateUserData,
    getMyTour };