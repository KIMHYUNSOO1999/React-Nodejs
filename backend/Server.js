/*
  Config
*/

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const User = require('./db/User');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true
}));

/*
  local -> 수정필
*/

const port = 5000;
const MONGO_URI = "mongodb://localhost:27017/";
const JWT_SECRET = "secret_key";

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
    [POST] /api/v1/user/login
    1. Input 
      - Body : { id: String, pw: String }
    
    2. Output
     a. Success
        - status 200 { msg : '회원가입 성공' }
        - cookie { authToken }
     b. Fail
        - status 400|500 { msg : '회원가입 실패' }
*/
app.post('/api/v1/user/login', async (req, res) => {

  const id = req.body.id;
  const pw = req.body.pw;

  // to-do
  try {

    const user = await User.findOne({ id });

    if (!user || user.pw !== pw) {
      return res.status(400).json({ msg: '아이디/비밀번호를 다시 확인해주세요.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 3600000
    }).status(200).json({ msg: '로그인 성공' });

  } catch (err) {
    res.status(500).json({ msg: '잠시 후에 로그인해주세요.' });
  }

});

/*
    [GET] /api/v1/user/auth
    1. Input 
      - Cookie : { authToken }
    
    2. Output
     a. Success
        - status 200 { msg : '유효한 토큰' , user : flag }
     b. Fail
        - status 401 { msg : '만료된 토큰' }

*/
app.get('/api/v1/user/auth', (req, res) => {

  const token = req.cookies.authToken;

  // to-do
  try {
    const flag = jwt.verify(token, JWT_SECRET); 

    res.status(200).json({
      msg: '유효한 토큰',
      user: flag 
    });

  } catch (err) {
    res.status(401).json({ msg: '만료된 토큰' });
  }
});


app.listen(port, () => {
    console.log(`HOST : http://localhost:${port}`)
  })

