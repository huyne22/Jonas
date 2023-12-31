import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' })
import {app} from './app.js';

const DB = process.env.MONGO.replace('<password>', process.env.PASS_MONGO);
 mongoose.connect(DB, {
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology:true
}).then(con => {
  console.log("DB connections success!")
})
const port = process.env.PORT || 3004;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});


