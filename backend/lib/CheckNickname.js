/*
  Config
*/

const User = require('../models/user');

/*
    Function CheckNickname

    - 요청 nickname <-> db.nickname 간 중복 확인

*/

const CheckNickname = async (req, res, next) => {
    
    try{

        const ReqNickname = req.body.nickname;
        const user = await User.findOne({ nickname : ReqNickname, useyn : true }); 

        if (user) {
            return res.status(400).json({ success: false, message: "닉네임 존재" });
        }

        next();

    } catch (err) {
        return res.status(500).json({ success: false, message: "서버 오류" });
    }
};

module.exports = CheckNickname;
