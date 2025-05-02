/*
  Config
*/

const express = require('express');
const jwt = require('jsonwebtoken');
const user = express.Router();

const User = require('../models/user');
const EmailAuth = require('../models/EmailAuth');

const authToken = require('../lib/AuthToken');
const checkPw = require('../lib/CheckPw');
const checkId = require('../lib/CheckId');

/*
  local
*/

const JWT_SECRET = process.env.JWT_SECRET;

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
user.post('/login', async (req, res) => {

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
user.get('/auth', authToken, async (req, res) => {

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
user.get('/logout', authToken, (req, res) => {

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
user.post('/signup', async (req, res) => {
  
  const id = req.body.id;
  const email = req.body.email;
  const pw = req.body.pw;

  try {

    const idFlag = await User.findOne({ id });

    // flag 1
    if (idFlag) {
      return res.status(400).json({ success : false, msg: '아이디 존재' });
    }

    // flag 2
    const emailFlag = await User.findOne({ email });

    if (emailFlag) {
      return res.status(400).json({ success : false, msg: '이메일 존재' });
    }
    
    // flag 3
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const auth = await EmailAuth.findOne({ 
      email,
      status: true,
      purpose: 'register',
      regdate: { $gte: today }
    });

    if (!auth) {
      return res.status(403).json({ success: false, msg: '이메일 인증만료' });
    }

    const user = new User({ id, pw, email });
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
user.post('/pwCheck', authToken, checkPw, (req, res) => {
  res.status(200).json({ success: true, msg: '비밀번호 일치' });
});

/*
    [POST] /api/v1/user/idCheck
    - 입력 아이디 <-> DB 내 아이디 간 중복 확인

    0. Import
      - Function : checkId
    
    1. Input 
      - Body   : { id : String }
    
    2. Output
      a. Success
        - status 200 { success : true, msg : '아이디 중복X' }
      b. Fail
        - status 400 { success : false, msg : '아이디 중복 }
        - status 500 { success : false, msg : '서버 오류' }

*/
user.post('/idCheck', checkId, (req, res) => {
  res.status(200).json({ success: true, msg: '아이디 중복X' });
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
user.post('/pwChange', authToken, async (req, res) => {

  const newPw = req.body.newPw;

  try{

    const user = await User.findById(req.user.id);

    if (newPw == user.pw) {
      return res.status(400).json({ success: false, msg: '구비밀번호와 일치' });
    }

    user.pw = newPw;
    await user.save();

    return res.status(200).json({ success: true, msg: '비밀번호 변경완료' });
  
  }
  catch (err) {
    return res.status(500).json({ success: false, msg: '서버 오류' });
  }
});
  

module.exports = user; 