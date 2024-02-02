import { AppError } from '../utils/appError.js';
import { catchAsync } from "../utils/catchAsync.js";
import {User} from '../models/userModel.js';
import { APIFeatures } from '../utils/apiFeatures.js';
import {deleteOne,updateOne,getAll,getOne} from './handleFactory.js'

const filterObj = (obj,...allowedFiles) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if(allowedFiles.includes(el)) newObj[el] = obj[el]
    })
    return newObj;
}
const getAllUsers = getAll(User);
const getMe = (req,res,next) => {
    req.params.id = req.user.id;
    next();
}
const getUser = getOne(User);
const createUser = (req,res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defind!'
    })
}
const updateUser = updateOne(User);

const updateMe = catchAsync(async(req,res,next) => {
    //1. Create error if user POSTed password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError("This route is not for password update.Please use /updatePassword"))
    }
    //2. Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body,'name','email') 

    //3. Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id,filteredBody,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    })

})
const deleteMe = catchAsync(async(req,res,next) => {
    await User.findByIdAndUpdate(req.user.id,{$set: {active: false}})
    res.status(200).json({
        status: "success",
        data: null
    })
})
const deleteUser = deleteOne(User);
export { getAllUsers,
    getUser,
    getMe,
    createUser,
    updateUser,
    deleteUser,updateMe,deleteMe };