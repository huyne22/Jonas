import express from 'express';
import {getAllUsers,
    getUser,
    getMe,
    createUser,
    updateUser,
    deleteUser,updateMe,deleteMe} from '../Controllers/userController.js';
import { signup,login,forgotPassword,resetPassword,updatePassword,
    protect,restrictTo } from '../Controllers/authController.js';

const router = express.Router();

router.route('/signup').post(signup)
router.route('/login').post(login)
router.route('/forgotPassword').post(forgotPassword)
router.route('/resetPassword/:token').patch(resetPassword)

// Protect all routes after this middleware
router.use(protect)

router.route('/updatePassword').patch(protect,updatePassword)

//Information current user
router.route('/me').get(protect,getMe,getUser)
router.route('/updateMe').patch(protect,updateMe)
router.route('/deleteMe').delete(protect,deleteMe)

router.use(restrictTo("admin"))
router.route('/')
    .get(getAllUsers)
    .post(createUser)
router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)
 export { router };