/*
  Config
*/

const mongoose = require('mongoose');

/*
   userSchema

    - 유저 테이블

    1. id       : String  ; 아이디  
    2. pw       : String  ; 비밀번호 
    3. nickname : String  ; 닉네임    
    4. email    : String  ; 메일
    5. admin    : Boolean ; 관리자YN
    6. regdate  : Date    ; 생성일자
    7. editdate : Date    ; 수정일자
    8. accessd  : Date    ; 접속일자(최근)
    9. useyn    : Boolean ; 사용YN

*/

const userSchema = new mongoose.Schema({

  id: { 
    type: String, 
    required: true, 
    unique: true 
  },
  pw: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  }

});

module.exports = mongoose.model('User', userSchema);
