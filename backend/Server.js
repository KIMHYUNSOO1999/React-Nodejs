/*
  Config
*/

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const User = require('./db/User');
const authToken = require('./lib/AuthToken');
const checkPw = require('./lib/CheckPw');

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
  API
*/

/*
    [POST] /api/v1/user/login
    - 로그인 

    1. Input 
      - Body : { id: String, pw: String }
    
    2. Output
     a. Success
        - status 200 { success : true, msg : '로그인 성공' }
        - cookie { authToken }
     b. Fail
        - status 400|500 { success : false, msg : '로그인 실패' }

*/
app.post('/api/v1/user/login', async (req, res) => {

  const id = req.body.id;
  const pw = req.body.pw;
  
  try {

    const user = await User.findOne({ id });

    if (!user || user.pw !== pw) {
      return res.status(400).json({ success : false, msg: '아이디/비밀번호를 다시 확인해주세요.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 3600000
    }).status(200).json({ success : true, msg: '로그인 성공' });

  } catch (err) {
    res.status(500).json({ success : false, msg: '서버 오류' });
  }

});

/*
    [GET] /api/v1/user/auth
    - JWT 토큰 비교

    0. Import
      - Function : authToken
    
    1. Input 
      - Cookie : { authToken }
    
    2. Output
     a. Success
        - status 200 { success : true, msg : '유효한 토큰' , user : flag }
     b. Fail
        - status 401 { success : false, msg : '만료된 토큰' }

*/
app.get('/api/v1/user/auth', authToken, async (req, res) => {

    const user = await User.findById(req.user.id);

    res.status(200).json({
      success : true,
      msg: '유효한 토큰',
      user: user.id 
    });

});

/*
    [GET] /api/v1/user/logout
    - 로그아웃 

    0. Import
      - Function : authToken
    
    1. Input 
      - Cookie : { authToken }
    
    2. Output
     a. Success
        - status 200 { success : true, msg : '로그아웃 완료'}
     b. Fail
        - status 401 { success : false, msg : '만료된 토큰' }

*/
app.get('/api/v1/user/logout', authToken, (req, res) => {

  res.clearCookie('authToken');
  res.status(200).json({ success : true, msg: '로그아웃 완료' });

});

/*
    [POST] /api/v1/user/signup
    - 회원가입

    1. Input 
      - Body : { id: String, pw: String }
    
    2. Output
     a. Success
        - status 200 { success : true,  msg : '회원가입 성공'}
     b. Fail
        - status 400 { success : false, msg : '아이디 존재' }
        - status 500 { success : false, msg : '서버 오류' }

*/
app.post('/api/v1/user/signup', async (req, res) => {
  
  const id = req.body.id;
  const pw = req.body.pw;

  try {

    const flag = await User.findOne({ id });

    if (flag) {
      return res.status(400).json({ success : false, msg: '아이디 존재' });
    }

    const user = new User({ id, pw });
    await user.save();

    res.status(201).json({ success : true, msg: '회원가입 성공' });

  } catch (err) {

    res.status(500).json({ success : false, msg: '서버 오류' });

  }

});

/*
    [POST] /api/v1/user/pwCheck
    - 입력 비밀번호 <-> JWT토큰 ID.비밀번호 비교

    0. Import
      - Function : authToken
      - Function : checkPw
    
    1. Input 
      - Cookie : { authToken   }
      - Body   : { pw : String }
    
    2. Output
     a. Success
        - status 200 { success : true, msg : '비밀번호 일치' }
     b. Fail
        - status 401 { success : false, msg : '비밀번호 불일치' }
        - status 404 { success : false, msg : '만료된 토큰' }
        - status 500 { success : false, msg : '서버 오류' }

*/
app.post('/api/v1/user/pwCheck', authToken, checkPw, (req, res) => {
  res.status(200).json({ success: true, message: '비밀번호 일치' });
});

/*
    [POST] /api/v1/user/pwChange
    - 비밀번호 변경 

    0. Import
      - Function : authToken
    
    1. Input 
      - Cookie : { authToken      }
      - Body   : { newPw : String }
    
    2. Output
     a. Success
        - status 200 { success : true, msg : '비밀번호 변경완료' }
     b. Fail
        - status 400 { success : false, msg : '구비밀번호와 일치' }
        - status 401 { success : false, msg : '만료된 토큰' }
        - status 500 { success : false, msg : '서버 오류' }

*/
app.post('/api/v1/user/pwChange', authToken, async (req, res) => {

  const newPw = req.body.newPw;

  try{

    const user = await User.findById(req.user.id);

    if (newPw == user.pw) {
      return res.status(400).json({ success: false, message: '구비밀번호와 일치' });
    }

    user.pw = newPw;
    await user.save();

    return res.status(200).json({ success: true, message: '비밀번호 변경완료' });
  
  }
  catch (err) {
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});



app.listen(port, () => {
    console.log(`HOST : http://localhost:${port}`)
  })

