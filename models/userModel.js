import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt'
import crypto from 'crypto'
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your name'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user','guide','lead-guide','admin'],
        default:'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select:false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //this only work on CREATE and SAVE
            validator: function(el){
                return el === this.password
            },
            message: 'Password are not the same!'
        }
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})
//exected before saving a user document
userSchema.pre('save',async function(next){
    //don't modified allow save process to continue
    if(!this.isModified('password')) return next();
    //hash password and result field password
    this.password = await bcrypt.hash(this.password, 10)
    //don't save passwordConfirm in the database
    this.passwordConfirm = undefined;
    next();
})
userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next()

    this.passwordChangeAt = Date.now() -1000;
    next();
})
userSchema.pre(/^find/,function(next){
    this.find({active: {$ne: false}})
    next();
})
userSchema.methods.correctPassword = function(candidatePassword, userPassword){
    return bcrypt.compare(candidatePassword,userPassword);
}
userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangeAt){
        const changeTimestamp = parseInt(this.passwordChangeAt.getTime() /1000,10)
        console.log(changeTimestamp,JWTTimestamp)
        return JWTTimestamp < changeTimestamp;
    }
    //false means NO change
    return false;
}
userSchema.methods.createPasswordResetToken = function(){
   const resetToken = crypto.randomBytes(32).toString('hex');
//    console.log("resetToken",resetToken)
   this.passwordResetToken = crypto
                            .createHash('sha256')
                            .update(resetToken)
                            .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minute
    // console.log("passwordResetToken",this.passwordResetToken)
    return resetToken;
}

const User = mongoose.model('User', userSchema)
export {User}