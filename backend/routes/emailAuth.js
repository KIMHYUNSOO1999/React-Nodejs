/*
  Config
*/

const express = require('express');
const nodemailer = require('nodemailer');

const emailAuth = express.Router();

const User = require('../models/user');
const EmailAuth = require('../models/EmailAuth');
const emailToken = require('../lib/UniqueEmailToken');

/*
  Local
*/

const user = process.env.USER;
const pass =process.env.PASS;

/*
  API
*/

/*
    [POST] /api/v1/auth/send-Register
    - 회원가입 시 이메일 인증요청

    1. Input 
      - Body : { email: String }
    
    2. Output
     a. Success
        - status 200 { success : true, msg : '이메일 발송완료' }
        - send { mail }
     b. Fail
        - status 400 { success : false, msg : '이메일 중복' }     
        - status 500 { success : false, msg : '서버오류' }

*/
emailAuth.post('/send-Register', async (req, res) => {

    const email  = req.body.email.toLowerCase();;

    try {
      
    // flag 1
    const emailFlag = await User.findOne({ email });

    if (emailFlag) {
      return res.status(400).json({ success : false, msg: '이메일 중복' });
    }

    // TO-DO
    const token = await emailToken();

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
          user: user,
          pass: pass
      }
    });

    const mailOptions = {
      from: user,
      to: email,
      subject: '[테스트] 회원가입 이메일 인증요청',
      html: `
        <div style="max-width: 480px; margin: auto; padding: 30px; border: 1px solid #ddd; border-radius: 10px; font-family: 'Arial', sans-serif; background-color: #ffffff;">
          <h2 style="text-align: center; color: #1a73e8;">✉️ 이메일 인증 요청</h2>
          <p style="font-size: 16px; color: #555;">안녕하세요,</p>
          <p style="font-size: 15px; color: #555;">회원가입을 위해 이메일 인증을 요청하셨습니다.</p>
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #888;">아래 인증 코드를 복사해서 입력해주세요:</p>
            <div style="display: inline-block; padding: 15px 25px; font-size: 20px; background-color: #f5f5f5; border: 1px dashed #ccc; border-radius: 8px; color: #111; font-weight: bold; letter-spacing: 2px;">
              ${token}
            </div>
          </div>
          <p style="font-size: 13px; color: #888;">해당 요청을 본인이 하지 않았다면 이 이메일은 무시하셔도 됩니다.</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);

    const newAuth = new EmailAuth({ token, email, purpose: 'register' });
    await newAuth.save();

    return res.status(200).json({ success: true, msg: '이메일 발송완료' });

  } catch(e){

    console.log(e);

    return res.status(500).json({ success: false, msg: '서버오류' });

  }
});

/*
  [POST] /api/v1/auth/verify-Register
  - 회원가입 시 이메일 인증완료

      1. Input 
      - Body : { email: String, token : String }
    
    2. Output
     a. Success
        - status 200 { success : true, msg : '인증 성공' }
     b. Fail
        - status 404 { success : false, msg : '인증 없음' }
        - status 409 { success : false, msg : '인증 중복' }        
        - status 410 { success : false, msg : '시간 만료' }             
        - status 500 { success : false, msg : '서버 오류' }

*/
emailAuth.post('/verify-Register', async (req, res) => {
  
  const email = req.body.email;
  const token = req.body.token;

  try {

    const auth = await EmailAuth.findOne({ email, token });

    // flag 1
    if (!auth) {
      return res.status(404).json({ success: false, msg: '인증 없음' });
    }

    // flag 2
    if (auth.status) {
      return res.status(409).json({ success: false, msg: '인증 중복' });
    }

    // flag 3
    const now = Date.now();
    const timeDiff = now - new Date(auth.regdate).getTime();

    if (timeDiff > 3 * 60 * 1000) {
      return res.status(410).json({ success: false, msg: '시간 만료' });
    }

    auth.status = true;
    await auth.save();

    return res.status(200).json({ success: true, msg: '인증 성공' });

  } catch (err) {

    return res.status(500).json({ success: false, msg: '서버 오류' });
  
  }
});

module.exports = emailAuth; 