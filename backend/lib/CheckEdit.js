/*
  Config
*/

const Comment = require("../models/Comment");
const User = require("../models/User");

/*
    Function CheckEdit

    - 요청 작성자/관리자 확인

*/
const CheckEdit = async (boardType, postIndex, commentIndex, userId) => {
  if (!boardType || postIndex == null || commentIndex == null || !userId) {
    return { success: false, status: 400, msg: "필수 데이터 누락" };
  }

  const comment = await Comment.findOne({
    boardType,
    postindex: Number(postIndex),
    index: Number(commentIndex),
  });

  if (!comment) {
    return { success: false, status: 404, msg: "댓글을 찾을 수 없습니다." };
  }

  const user = await User.findById(userId).select(["id", "adminyn"]);
  if (!user) {
    return { success: false, status: 404, msg: "사용자를 찾을 수 없습니다." };
  }

  if (comment.regid !== user.id && user.adminyn !== true) {
    return { success: false, status: 403, msg: "권한이 없습니다." };
  }

  return { success: true, status: 200, comment };
};

module.exports = CheckEdit;
