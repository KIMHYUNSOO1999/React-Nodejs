/*
  Config
*/

const User = require('../models/user');

/*
    Function checkId

    - 요청 id <-> db.id 간 중복 확인

*/

const checkId = async (req, res, next) => {
    
    try{

        const Reqid = req.body.id;
        const user = await User.findOne({ id : Reqid }); 

        if (user) {
            return res.status(400).json({ success: false, message: "아이디 존재" });
        }

        next();

    } catch (err) {
        return res.status(500).json({ success: false, message: "서버 오류" });
    }
};

module.exports = checkId;
