/*
  Config
*/

const express = require("express");

const Board = require("../models/board");
const Post = require("../models/post");
const User = require('../models/user');

const authToken = require('../lib/AuthToken');

const board = express.Router();

/*
  API
*/

/*
    [GET] /api/v1/board/list
    - 게시판 리스트 조회

    1. Input 
      - Params : { page: integer, search : String }
    
    2. Output
     a. Success
        - status 200 { success : true, json (board), totalPages }
     b. Fail
        - status 500 { success : false, msg : '서버오류' }

*/
board.get("/list", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const filter = {
      useyn: true,
      ...(search ? { name: { $regex: search, $options: "i" } } : {})
    };

    const totalBoards = await Board.countDocuments(filter);
    const totalPages = Math.ceil(totalBoards / limit);

    const boards = await Board.find(filter, "type name -_id")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);



    res.status(200).json({
      success: true,
      boards,
      totalPages
    });
  } catch (err) {
    res.status(500).json({ msg: "서버 오류" });
  }
});

/*
    [GET] /api/v1/board/:boardName
    - 다중게시판 게시물 조회

    1. Input 
      - URL   : { boardName : String }
      - Params : { page: integer, search : String, searchType : String }
    
    2. Output
      a. Success
        - status 200 { success : true, json (board, posts) }
     b. Fail
        - status 404 { success : false, msg : '존재하지 않는 게시판' }
        - status 500 { success : false, msg : '서버오류' }

*/
board.get("/:boardName", async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const searchType = req.query.searchType || "title";

    const board = await Board.findOne(
      { type: req.params.boardName, useyn: true },
      "-_id -usedate -regdate -useyn"
    );

    if (!board) {
      return res.status(404).json({ success: false, msg: "존재하지 않는 게시판" });
    }

    let postFilter = { boardType: board.type, useyn: true };

    if (search) {
      if (searchType === "title") {
        postFilter.title = { $regex: search, $options: "i" };
      } else if (searchType === "nickname") {
        const users = await User.find(
          { nickname: { $regex: search, $options: "i" }, useyn: true },
          "id"
        );
        const userIds = users.map((u) => u.id);
        postFilter.regid = { $in: userIds.length ? userIds : ["__empty__"] };
      }
    }

    const totalPosts = await Post.countDocuments(postFilter);
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await Post.find(postFilter, "-_id -usedate -editdate -useyn")
      .sort({ index: -1 })
      .skip(skip)
      .limit(limit);

    const userIds = posts.map((post) => post.regid);
    const users = await User.find(
      { id: { $in: userIds }, useyn: true },
      "id nickname -_id"
    );

    const userMap = {};
    users.forEach((user) => {
      userMap[user.id] = { nickname: user.nickname };
    });

    const ResPost = posts.map((post) => ({
      ...post.toObject(),
      nickname: userMap[post.regid]?.nickname || "탈퇴한 이용자",
    }));

    res.status(200).json({
      success: true,
      board,
      posts: ResPost,
      totalPages,
    });
  } catch (err) {
    res.status(500).json({ success: false, msg: "서버 오류" });
  }
});


/*
    [POST] /api/v1/:boardName/write
    - 게시물 작성

    1. Input 
      - Body : { boardType : String, title : String, content : String }
      - Cookie : authToken
    
    2. Output
      a. Success
        - status 200 { success : true, msg: "게시물 생성 완료"}
     b. Fail
        - status 400 { success : false, msg : '필수값 누락' }
        - status 403 { success : false, msg : '유효하지 않은 사용자' }
        - status 500 { success : false, msg : '서버오류' }

*/
board.post("/write", authToken, async (req, res) => {
  try {
    
    const { boardType, title, content } = req.body;
    const regid = req.user.id;

    if (!boardType || !title || !content || !regid) {
      return res.status(400).json({ success: false, msg: "필수값 누락" });
    }

    const user = await User.findById(regid).select('id useyn');
    if (!user || !user.useyn) {
      return res.status(403).json({ success: false, msg: "유효하지 않은 사용자" });
    }

    const lastPost = await Post.findOne({ boardType }).sort({ index: -1 }).exec();
    const nextIndex = lastPost ? lastPost.index + 1 : 1;

    const newPost = new Post({
      boardType,
      index: nextIndex,
      title,
      content,
      regid : user.id,
    });

    await newPost.save();

    res.status(201).json({ success: true, msg: "게시물 생성 완료" });
  } catch (err) {
    res.status(500).json({ success: false, msg: "서버 오류" });
  }
});

/*
  [GET] /api/v1/board/:boardName/:index
  - 게시물 조회

  1. Input
    - Params : { boardName : String, index : Integer }

  2. Output
    a. Success
      - status 200 { success: true, post }
    b. Fail
      - status 404 { success: false, msg: "존재하지 않는 게시판" || "게시글을 찾을 수 없습니다." }
      - status 500 { success: false, msg: "서버 오류" }
*/
board.get("/:boardName/:index", async (req, res) => {
  try {
    const { boardName, index } = req.params;

    const board = await Board.findOne({ type: boardName, useyn: true });
    if (!board) {
      return res.status(404).json({ success: false, msg: "존재하지 않는 게시판" });
    }

    const post = await Post.findOne({
      boardType: board.type,
      index: parseInt(index),
      useyn: true
    }).select("-_id -usedate -useyn");

    if (!post) {
      return res.status(404).json({ success: false, msg: "게시글을 찾을 수 없습니다." });
    }

    const user = await User.findOne({ id: post.regid, useyn: true }).select("nickname");

    const resultPost = {
      ...post.toObject(),
      nickname: user?.nickname || "탈퇴한 이용자"
    };

    res.status(200).json({ success: true, post: resultPost });

  } catch (err) {
    res.status(500).json({ success: false, msg: "서버 오류" });
  }
});

/*
  [POST] /api/v1/board/:boardName/:index/delete
  - 게시물 삭제

  1. Input
    - Params : { boardName : String, index : Integer }
    - Cookie : authToken
  
  3. Output
    a. Success
      - status 200 { success: true, msg: "게시글이 삭제되었습니다." }
    b. Fail
      - status 403 { success: false, msg: "삭제 권한이 없습니다." }
      - status 404 { success: false, msg: "존재하지 않는 게시판" || "게시글을 찾을 수 없습니다." }
      - status 500 { success: false, msg: "서버 오류" }
*/
board.post("/:boardName/:index/delete", authToken, async (req, res) => {
  try {
    const { boardName, index } = req.params;
    const userId = req.user.id;

    const board = await Board.findOne({ type: boardName, useyn: true });
    if (!board) {
      return res.status(404).json({ success: false, msg: "존재하지 않는 게시판" });
    }

    const post = await Post.findOne({
      boardType: board.type,
      index: parseInt(index),
      useyn: true,
    });
    if (!post) {
      return res.status(404).json({ success: false, msg: "게시글을 찾을 수 없습니다." });
    }

    const user = await User.findById(userId);
    if (!user || !user.useyn) {
      return res.status(403).json({ success: false, msg: "유효하지 않은 사용자" });
    }

    if (post.regid !== user.id && !user.adminyn) {
      return res.status(403).json({ success: false, msg: "삭제 권한이 없습니다." });
    }

    post.useyn = false;  
    post.usedate = new Date();
    await post.save();

    return res.status(200).json({ success: true, msg: "게시글이 삭제되었습니다." });
  } catch (err) {
    return res.status(500).json({ success: false, msg: "서버 오류" });
  }
});

/*
  [POST] /api/v1/board/:boardName/:index/check-edit
  - 게시물 수정 권한YN

  1. Input
    - Params : { boardName : String, index : Integer }
    - Cookie : authToken

  2. Output
    a. Success 
      - status 200 { success: true }
    b. Fail
      - status 403 { success: false, msg: "유효하지 않은 사용자" || "수정 권한이 없습니다." }
      - status 404 { success: false, msg: "존재하지 않는 게시판" || "게시글을 찾을 수 없습니다." }
      - status 500 { success: false, msg: "서버 오류" }
*/
board.post("/:boardName/:index/check-edit", authToken, async (req, res) => {
  try {
    const { boardName, index } = req.params;
    const userId = req.user.id;

    const board = await Board.findOne({ type: boardName, useyn: true });
    if (!board) {
      return res.status(404).json({ success: false, msg: "존재하지 않는 게시판" });
    }

    const post = await Post.findOne({
      boardType: board.type,
      index: parseInt(index),
      useyn: true,
    });
    if (!post) {
      return res.status(404).json({ success: false, msg: "게시글을 찾을 수 없습니다." });
    }

    const user = await User.findById(userId);
    if (!user || !user.useyn) {
      return res.status(403).json({ success: false, msg: "유효하지 않은 사용자" });
    }

    if (!post.regid || (post.regid.toString() !== user.id.toString() && !user.adminyn)) {
      return res.status(403).json({ success: false, msg: "수정 권한이 없습니다." });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, msg: "서버 오류" });
  }
});

/*
  [POST] /api/v1/board/:boardName/:index/edit
  - 게시물 수정 

  1. Input
    - Params : { boardName : String, index : Integer }
    - Body: { title : String, content: String }
    - Cookie: authToken

  2. Output
    a. Success
      - status 200 { success: true, msg: "게시글이 수정되었습니다." }
    b. Fail
      - status 403 { success: false, msg: "유효하지 않은 사용자" || "수정 권한이 없습니다." }
      - status 404 { success: false, msg: "존재하지 않는 게시판" || "게시글을 찾을 수 없습니다." }
      - status 500 { success: false, msg: "서버 오류" }
*/
board.post("/:boardName/:index/edit", authToken, async (req, res) => {
  try {
    const { boardName, index } = req.params;
    const userId = req.user.id;
    const { title, content } = req.body;

    const board = await Board.findOne({ type: boardName, useyn: true });
    if (!board) {
      return res.status(404).json({ success: false, msg: "존재하지 않는 게시판" });
    }

    const post = await Post.findOne({
      boardType: board.type,
      index: parseInt(index),
      useyn: true,
    });
    if (!post) {
      return res.status(404).json({ success: false, msg: "게시글을 찾을 수 없습니다." });
    }

    const user = await User.findById(userId);
    if (!user || !user.useyn) {
      return res.status(403).json({ success: false, msg: "유효하지 않은 사용자" });
    }

    if (!post.regid || (post.regid.toString() !== user.id.toString() && !user.adminyn)) {
      return res.status(403).json({ success: false, msg: "수정 권한이 없습니다." });
    }

    post.title = title;
    post.content = content;
    await post.save();

    return res.status(200).json({ success: true, msg: "게시글이 수정되었습니다." });
  } catch (err) {
    return res.status(500).json({ success: false, msg: "서버 오류" });
  }
});

/*
  [POST] /api/v1/board/create
  - 게시판 생성 (관리자 권한 필요)

  1. Input
    - Body : { type, name : String }
    - Cookie : { authToken }

  2. Output
    a. Success
      - status 201 { success: true, msg: "게시판이 성공적으로 생성되었습니다." }
    b. Fail
      - status 400 { success: false, msg: "필수값 누락" }
      - status 403 { success: false, msg: "유효하지 않은 사용자" }
      - status 409 { success: false, msg: "이미 존재하는 게시판입니다." }
      - status 500 { success: false, msg: "서버 오류" }
*/
board.post("/create", authToken, async (req, res) => {
  try {
    const { type : tmp , name } = req.body;
    const userId = req.user.id;

    type = tmp.toLowerCase()

    if (!type || !name || !userId) {
      return res.status(400).json({ success: false, msg: "필수값 누락" });
    }
    const user = await User.findById(userId).select("id useyn adminyn");
    if (!user || !user.useyn ||!user.adminyn ) {
      return res.status(403).json({ success: false, msg: "유효하지 않은 사용자" });
    }

    const existing = await Board.findOne({
      $or: [{ type }, { name }]
    });

    if (existing) {
      return res.status(409).json({ success: false, msg: "이미 존재하는 게시판입니다." });
    }

    const newBoard = new Board({
      type,
      name,
      regdate: new Date()
    });

    await newBoard.save();

    res.status(201).json({ success: true, msg: "게시판이 성공적으로 생성되었습니다." });

  } catch (err) {
    res.status(500).json({ success: false, msg: "서버 오류" });
  }
});

module.exports = board;
