import mongoose from 'mongoose';
import fs from 'fs';
import {Tour} from './../../models/tourModel.js';
import {Review} from './../../models/reviewModel.js';
import {User} from './../../models/userModel.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Các dòng mã tiếp theo của bạn ở đây


const DB = process.env.MONGO.replace('<password>', process.env.PASS_MONGO);
mongoose.connect(DB, {
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology:true
}).then(con => {
  console.log("DB connections success!")
})

//Read file json
const tour = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const review = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//Import data into DB
const importData = async() => {
    try{
        await Tour.create(tour);
        await User.create(user, {validateBeforeSave: false});
        await Review.create(review);
        console.log("Data import success")
        
    }catch(err){
        console.log(err)
    }
    process.exit()
}
//Delete data into DB
const deleteData = async() => {
    try{
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data delete success!")
    }catch(err){
        console.log(err)
    }
    process.exit()
}
if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}
console.log(process.argv)
// node dev-data/data/import-dev-tour.js --delete