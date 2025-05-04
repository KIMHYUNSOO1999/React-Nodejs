/*
  Config
*/

const User = require('../models/user');

/*
    Function checkPassword

    - 요청 Password <->JWT id.pw 간 일치/불일치 확인

*/

const CheckPw = async (req, res, next) => {
    
    try{

        const user = await User.findOne({ _id: req.user.id, useyn: true });
        const ReqPw = req.body.pw

        if (!user) {
            return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
        }

        if (ReqPw!=user.pw) {
            return res.status(401).json({ success: false, message: "비밀번호 불일치" });
        }

        next();

    } catch (err) {
        return res.status(500).json({ success: false, message: "서버 오류" });
    }
};

module.exports = CheckPw;
