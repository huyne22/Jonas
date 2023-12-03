const dotenv = require('dotenv');
dotenv.config({ path: '/.env' })
const app = require('./app');
console.log(process.env)
console.log(process.env.NODE_ENV)
const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});