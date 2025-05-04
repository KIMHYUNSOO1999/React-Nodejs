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
const { CheckEmailToken } = require('../lib/CheckEmailToken');

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
  
      const user = await User.findOne({ id, useyn: true });
  
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

  const user = await User.findOne({ _id: req.user.id, useyn: true });

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

    const idFlag = await User.findOne({ id, useyn : true });

    // flag 1
    if (idFlag) {
      return res.status(400).json({ success : false, msg: '아이디 존재' });
    }

    // flag 2
    const emailFlag = await User.findOne({ email, useyn : true });

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
    [POST] /api/v1/user/signoff
    - 회원탈퇴

    0. Import
      - Function : authToken
    
    1. Output
      a. Success
        - status 200 { success : true,  msg : '회원탈퇴 성공'}
      b. Fail
        - status 400 { success : false, msg : '이미 탈퇴했거나 존재하지 않는 유저' }
        - status 500 { success : false, msg : '서버 오류' }

*/
user.post('/signoff', authToken, async (req, res) => {

  try {

    const user = await User.findOne({ _id: req.user.id, useyn: true });

    if (!user || !user.useyn) {
      return res.status(404).json({ success: false, msg: '이미 탈퇴했거나 존재하지 않는 유저' });
    }

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, '0');

    const timestamp = 
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds());

    user.id = `${user.id}_delete_${timestamp}`;
    user.email = `${user.email}_delete_${timestamp}`;
    user.useyn = false;
    user.usedate = Date.now();
    
    await user.save();

    res.clearCookie('authToken');

    res.status(200).json({ success: true, msg: '회원탈퇴 완료' });

  } catch (err) {
    res.status(500).json({ success: false, msg: '서버 오류' });
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

    const user = await User.findOne({ _id: req.user.id, useyn: true });

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
  
/*
  [POST] /api/v1/user/reset-password
  - 비밀번호 변경

    0. Import
      - Function : CheckEmailToken

    1. Input 
      - Body : { token : String, newPw : String }
    
    2. Output
     a. Success
        - status 200 { success : true, msg : '리셋 성공' }
     b. Fail
        - status 404 { success : false, msg : '인증 없음 || 사용자 무효' }
        - status 409 { success : false, msg : '인증 중복' }        
        - status 410 { success : false, msg : '시간 만료' }             
        - status 500 { success : false, msg : '서버 오류' }

*/
user.post('/reset-password', async (req, res) => {
  
  const { token, newPw } = req.body;

  try {

    // flag 1
    const result = await CheckEmailToken({ token });

    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, msg: result.msg });
    }

    // flag 2
    const user = await User.findOne({ email: result.auth.email, useyn : true });

    if (!user) {
      return res.status(404).json({ success: false, msg: '사용자 무효' });
    }

    // TO-DO
    user.pw = newPw
    await user.save();

    result.auth.status = true;
    await result.auth.save();

    return res.status(200).json({ success: true, msg: '리셋 성공'});

  } catch (err) {

    console.log(err);
  
    return res.status(500).json({ success: false, msg: '서버 오류' });

  }
});


module.exports = user; 