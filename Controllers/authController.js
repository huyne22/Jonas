import { promisify } from 'util';
import {User} from '../models/userModel.js';
import { AppError } from '../utils/appError.js';
import { sendEmail } from '../utils/email.js';
import { catchAsync } from "../utils/catchAsync.js";
import crypto from 'crypto';
import jwt from 'jsonwebtoken'
const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_IN})
}
const createSendToken = (user,statusCode,res) => {
    const token = signToken(user._id)
    
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}
const signup = catchAsync(async(req,res,next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });
    createSendToken(newUser,201,res)
})
const login = catchAsync(async(req,res,next) => {
    const {email,password} = req.body;
    //check if email and password exits
    if(!email || !password){
        return next(new AppError('Please provide email and password', 400))
    }
    //check if user exits and password is correct
    const user = await User.findOne({email}).select('+password');
    const correct = await user?.correctPassword(password,user.password);

    if(!user || !correct){
        return next(new AppError('Incorrect email or password', 401))
    }
    //if evething ok, send token to client
    createSendToken(user,200,res)
})
const protect = catchAsync(async(req,res,next) => {
    //getting token and check of it's there
    let token;
    if(req.headers?.authorization?.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
        console.log(req.headers?.authorization)
    }
    if(!token){
        return next(new AppError('You are not logged in!Please log in to get access.',401))
    }
    //verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log(decoded)
    //check if user still exists
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return next(new AppError('The user belonging to this token does no longer exists.',401))
    }
    //check if user change password after the token was issued
    if(currentUser.changePasswordAfter(decoded.iat)){
        return next(new AppError('User recently changed password.Please log in again.',401))
    }
    req.user = currentUser;
    next()
})
const restrictTo = (...roles) => {
    return (req,res,next) => {
        //roles ['admin','lead-guide'] 
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action!'))
        }
        next()
    }
}
const forgotPassword = catchAsync(async(req,res,next) => {
    //1.Get user based on POSTed email
    const user = await User.findOne({email: req.body.email})
    if(!user){
        return next(new AppError('There is no user with email address', 404))
    }
    //2. Generate the random reset token
    const resetToken = user.createPasswordResetToken()
    // console.log("l",resetToken)
    await user.save({validateBeforeSave: false})
    //3.Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken})}`;
    // console.log(resetURL)
    const message = `<p>Forgot your password?</p>
    <p>Submit a PATCH request with your new password and passwordConfirm to:</p>
    <p>${resetURL}</p>
    <p>${resetToken}</p>`;

    try{
        await sendEmail({
            email: user?.email,
            subject: 'Your password reset token(valid for 10 minute)',
            message,
        });
        // console.log(user)
        return res.status(200).json({
            status: 'success',
            message: 'Reset token sent to email!'
        });
        
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false})
        return next(new AppError('There was an error sending the email. Try again later', 500))
    }
})
const resetPassword = catchAsync(async(req,res,next) => {
    //1. Get user based on the token
    const hashToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashToken,
        passwordResetExpires: {$gt: Date.now()}
    })
    //2. If token has not expired, and there is user, set the new password
    if(!user){
        return next(new AppError("Token is invalid or has expired", 400))
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    //3. Update changePasswordAt property for the user
    //4. Log the user in, send JWT
    createSendToken(user,200,res)
})

const updatePassword = catchAsync(async(req,res,next) => {
    //1. Get user from collection
    const user = await User.findById(req.user.id).select('+password')
    //2. Check if POSTed current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password))){
        return next(new AppError("Don't find user in db."))
    }
    //3. If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.save();
    //4. Log user in, send JWT
    createSendToken(user,200,res)

})

export {signup,login,protect,restrictTo,forgotPassword,resetPassword,updatePassword};