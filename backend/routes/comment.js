/*
  Config
*/

const express = require("express");

const Comment = require("../models/comment");
const User = require('../models/user');

const authToken = require('../lib/AuthToken');
const checkEdit = require('../lib/CheckEdit');

const comment = express.Router();

/*
  API
*/


/*
  [GET] /api/v1/comment/list
  - 댓글 리스트 조회

  1. Input
    - Params : {boardType : String, postindex : Number }

  2. Output
     a. Success
        - status 200 { success : true, msg : '인증 성공' }
     b. Fail
        - status 400 { success : false, msg : '필수 파라미터 누락' }            
        - status 500 { success : false, msg : '서버 오류' }
*/
comment.get("/list", async (req, res) => {

  const { boardType, postindex } = req.query;

  if (!boardType || !postindex) {
    return res.status(400).json({ success: false, msg: "필수 파라미터 누락" });
  }

  try {
    const comments = await Comment.find({
      boardType,
      postindex: Number(postindex),
      useyn: true,
    })
      .sort({ index: 1 }) 
      .select("index content regid regdate -_id")
      .lean();

    for (let comment of comments) {
        const user = await User.findOne({ id: comment.regid }).select("nickname").lean();
        comment.nickname = user ? user.nickname : comment.regid;
    }

    res.status(200).json({ success: true, comments });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "서버 오류" });
  }
});

/*
  [POST] /api/v1/comment/create
  - 댓글 작성

  1. Input
    - Params : {boardType : String, postindex : Integer, commentIndex : Integer, content : String }
    - Cookie : authToken

  2. Output
     a. Success
        - status 200 { success : true, msg : '댓글작성 성공' }
     b. Fail
        - status 400 { success : false, msg : '필수 파라미터 누락' }  
        - status 401 { success : false, msg : '사용자를 찾을 수 없습니다.' }                
        - status 500 { success : false, msg : '서버 오류' }
*/
comment.post("/create", authToken, async (req, res) => {
  const { boardType, postindex, content } = req.body;

  if (!boardType || !postindex || !content || !content.trim()) {
    return res.status(400).json({ success: false, msg: "필수 파라미터 누락" });
  }

  try {

    const user = await User.findById(req.user.id).select("id nickname").lean();
    if (!user) {
      return res.status(401).json({ success: false, msg: "사용자를 찾을 수 없습니다." });
    }

    const lastComment = await Comment.findOne({ boardType, postindex: Number(postindex) })
      .sort({ index: -1 })
      .select("index")
      .lean();
    const newIndex = lastComment ? lastComment.index + 1 : 1;

    const newComment = new Comment({
      boardType,
      postindex: Number(postindex),
      index: newIndex,
      content,
      regid: user.id,
    });
    await newComment.save();

    const tmpComment = newComment.toObject();

    const commentWithNickname = {
      index: tmpComment.index,
      content: tmpComment.content,
      regid: tmpComment.regid,
      regdate: tmpComment.regdate,
      nickname: user.nickname,
    };

    res.status(200).json({ success: true, msg: "댓글작성 성공", comment: commentWithNickname });
  } catch (err) {

    res.status(500).json({ success: false, msg: "서버 오류" });
  }
});

/*
  [POST] /api/v1/comment/check-edit
  - 댓글 수정/삭제 권한 여부

  1. Input
    - Params : {boardType : String, postindex : Integer, commentIndex : Integer }
    - Cookie : authToken

  2. Output
     a. Success
        - status 200 { success : true, msg : '댓글권한 완료' }
     b. Fail
        - status 400 { success : false, msg : '필수 파라미터 누락' }  
        - status 403 { success : false, msg : '댓글을 찾을 수 없습니다.' || '사용자를 찾을 수 없습니다.' } 
        - status 404 { success : false, msg : '권한이 없습니다' }           
        - status 500 { success : false, msg : '서버 오류' }
*/
comment.post("/check-edit", authToken, async (req, res) => {
  try {
    const { boardType, postIndex, commentIndex } = req.body;
    const userId = req.user.id;

    const result = await checkEdit(boardType, postIndex, commentIndex, userId);

    if (!result.success) {
      return res.status(result.status).json({ success: false, msg: result.msg });
    }

    return res.status(200).json({ success: true, msg: "댓글권한 완료" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, msg: "서버 오류" });
  }
});

/*
  [POST] /api/v1/comment/edit
  - 댓글 수정

  1. Input
    - Params : {boardType : String, postindex : Integer, commentIndex : Integer, content : String }
    - Cookie : authToken

  2. Output
     a. Success
        - status 200 { success : true, msg : '댓글작성 성공' }
     b. Fail
        - status 400 { success : false, msg : '필수 파라미터 누락' }  
        - status 403 { success : false, msg : '댓글을 찾을 수 없습니다.' || '사용자를 찾을 수 없습니다.' } 
        - status 404 { success : false, msg : '권한이 없습니다' }           
        - status 500 { success : false, msg : '서버 오류' }
*/
comment.post("/edit", authToken, async (req, res) => {
  try {
    const { boardType, postindex, commentIndex, content } = req.body;
    const userId = req.user.id;

    if (!boardType || postindex == null || commentIndex == null || !content) {
      return res.status(400).json({ success: false, msg: "필수 파라미터 누락" });
    }
    
    const result = await checkEdit(boardType, postindex, commentIndex, userId);

    if (!result.success) {
      return res.status(result.status).json({ success: false, msg: result.msg });
    }

    const commentDoc = result.comment;
    commentDoc.content = content;
    commentDoc.editdate = new Date();
    await commentDoc.save();

    return res.status(200).json({ success: true, msg: "댓글이 수정되었습니다." });
  } catch (error) {
    return res.status(500).json({ success: false, msg: "서버 오류" });
  }
});


/*
  [POST] /api/v1/comment/delete
  - 댓글 삭제

  1. Input
    - Params : {boardType : String, postindex : Integer, commentIndex : Integer }
    - Cookie : authToken

  2. Output
     a. Success
        - status 200 { success : true, msg : '댓글삭제 성공' }
     b. Fail
        - status 400 { success : false, msg : '필수 파라미터 누락' }  
        - status 403 { success : false, msg : '댓글을 찾을 수 없습니다.' || '사용자를 찾을 수 없습니다.' } 
        - status 404 { success : false, msg : '권한이 없습니다' }           
        - status 500 { success : false, msg : '서버 오류' }
*/
comment.post("/delete", authToken, async (req, res) => {
  try {
    const { boardType, postindex, commentIndex } = req.body;
    const userId = req.user.id;

    const result = await checkEdit(boardType, postindex, commentIndex, userId);
    if (!result.success) {
      return res.status(result.status).json({ success: false, msg: result.msg });
    }

    const comment = await Comment.findOne({
      boardType,
      postindex: Number(postindex),
      index: Number(commentIndex),
    });

    const commentDoc = result.comment;
    commentDoc.useyn = false;
    commentDoc.usedate = new Date();
    await commentDoc.save();

    return res.status(200).json({ success: true, msg: "댓글삭제 성공" });
  } catch (err) {
    return res.status(500).json({ success: false, msg: "서버 오류" });
  }
});


module.exports = comment; 
