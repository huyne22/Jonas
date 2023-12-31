import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User must have a name'],
        trim: true,
        minlength: [10, 'Name must be at least 10 characters long'],
        maxlength: [50, 'Name must be less than or equal to 50 characters'],
    },
    email: {
        type: String,
        
    }
})