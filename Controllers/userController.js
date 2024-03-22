import { AppError } from '../utils/appError.js';
import { catchAsync } from "../utils/catchAsync.js";
import {User} from '../models/userModel.js';
import { APIFeatures } from '../utils/apiFeatures.js';
import {deleteOne,updateOne,getAll,getOne} from './handleFactory.js'
import multer from 'multer';
import sharp from 'sharp';

// Cấu hình nơi lưu trữ hình ảnh được tải lên
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

//lưu ảnh tại bộ nhớ thay vì ổ đĩa
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
  };
  
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto = catchAsync(async (req,res,next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
            .resize(500,500)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`public/img/users/${req.file.filename}`);
        
    next();
});

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
    if(req.file) filteredBody.photo = req.file.filename;

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
    deleteUser,updateMe,deleteMe,
    uploadUserPhoto,resizeUserPhoto };