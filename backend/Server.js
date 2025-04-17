/*
  Config
*/

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config({ path : 'backend/.env' });
const app = express();

/*
  local
*/

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true
}));

const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

/*
  Connect
*/

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`[${new Date().toLocaleString()}] DB connected`);
  })
  .catch((err) => {
    console.log(err);
  });

/*
  Routes
*/

const user = require('./routes/user');
app.use('/api/v1/user', user);

const emailAuth = require('./routes/emailAuth');
app.use('/api/v1/auth', emailAuth);

/*
   Handling
*/

app.listen(port, () => {
  console.log(`HOST : http://localhost:${port}`)
});

