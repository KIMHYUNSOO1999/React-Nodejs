/*
  Config
*/

const mongoose = require("mongoose");

/*
   BoardSchema

    - 게시판 타입 테이블

    1. type    : String  ; 타입
    2. name    : String  ; 한글이름
    3. regdate : Date    ; 생성일자
    4, usedate : Date    ; 삭제일자
    5. useyn   : Boolean ; 사용YN

*/

const BoardSchema = new mongoose.Schema({
    type : { 
        type: String, 
        required: true, 
        unique: true 
    },  
    name: { 
        type: String, 
        required: true 
    },            
    regdate: { 
        type: Date,
        default: Date.now 
    },
    usedate : { 
        type: Date,
        default : null
    },
    useyn: {
        type: Boolean,
        default : true 
    }
});

module.exports = mongoose.models.Board || mongoose.model("Board", BoardSchema);
