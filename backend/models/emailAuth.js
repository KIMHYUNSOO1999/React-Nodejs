/*
  Config
*/

const mongoose = require('mongoose');

/*
   EmailAuthSchema

    - 이메일 토큰 테이블

    1. token    : String  ; 토큰  
    2. email    : String  ; 메일
    3. status   : Boolean ; 상태    
    4. regdate  : Date    ; 생성일자
    5. purpose  : String  ; 용도

*/

const EmailAuthSchema = new mongoose.Schema({
    
    token: {
        type: String,
        required: true,
        unique : true
    },
    email: { 
        type: String,
        required: true
    },
    status: { 
        type: Boolean,
        default: false 
    },
    regdate: { 
        type: Date,
        default: Date.now
    },
    purpose: { 
        type: String,
        enum: ['register', 'forgot'],
        required : true
    }    
});

module.exports  = mongoose.models.EmailAuth || mongoose.model('EmailAuth', EmailAuthSchema);
