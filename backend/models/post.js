/*
  Config
*/

const mongoose = require("mongoose");

/*
   PostSchema

    - 게시물 테이블

    1. boardType : String  ; 게시판타입
    2. index     : String  ; 인덱스
    3. title     : Boolean ; 제목  
    4. content   : Date    ; 내용
    5. regid     : String  ; 생성ID
    6. regdate   : Date    ; 생성일자
    7. editdate  : Date    ; 수정일자
    8. usedate   : Date    ; 삭제일자
    9. useyn     : Boolean ; 사용YN

*/

const PostSchema = new mongoose.Schema({
    boardType: {
        type: String,
        required: true 
    },     
    index: { 
        type: Number,
        required: true 
    },         
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    regid: {
        type: String,
        required: true
    },
    regdate: {
        type: Date,
        default: Date.now 
    },
    editdate: {
        type: Date,
        default : null
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


PostSchema.index({ boardType: 1, index: 1 }, { unique: true });

module.exports = mongoose.models.Post || mongoose.model("Post", PostSchema);
