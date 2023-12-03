const mongoose = require('mongoose');

const dotenv = require('dotenv');
dotenv.config({ path: './.env' })

const DB = process.env.MONGO.replace('<password>', process.env.PASS_MONGO);
mongoose.connect(DB, {
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology:true
}).then(con => {
  console.log("DB connections success!")
})

const app = require('./app');
const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
