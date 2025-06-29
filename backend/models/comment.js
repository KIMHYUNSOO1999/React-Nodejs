/*
  Config
*/

const mongoose = require("mongoose");

/*
   CommentSchema

    - 댓글 테이블

    1. boardType : String   ; 게시판 타입 
    2. postindex : Number   ; 게시물 번호
    3. index     : Number   ; 번호 
    4. content   : String   ; 내용
    5. regid     : String   ; 작성자
    6. regdate   : Date     ; 작성일자
    7. editdate  : Date     ; 수정일자 
    8. usedate   : Date     ; 삭제일자 
    9. useyn     : Boolean  ; 사용YN 
*/

const CommentSchema = new mongoose.Schema({
  boardType: {
    type: String,
    required: true,
  },
  postindex: {
    type: Number,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  regid: {
    type: String,
    required: true,
  },
  regdate: {
    type: Date,
    default: Date.now,
  },
  editdate: {
    type: Date,
    default: null,
  },
  usedate: {
    type: Date,
    default: null,
  },
  useyn: {
    type: Boolean,
    default: true,
  },
});

CommentSchema.index({ postindex: 1, index: 1 }, { unique: true });

module.exports = mongoose.models.Comment || mongoose.model("Comment", CommentSchema);