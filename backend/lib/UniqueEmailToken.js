/*
  Config
*/

const crypto = require('crypto');
const EmailAuth = require('../models/EmailAuth');

/*
    Function UniqueEmailToken

    - 이메일 전송 시 토큰 중복 제거

*/

async function UniqueEmailToken() {

    let token;
    let exists = true;

    while (exists) {
        
        token = crypto.randomBytes(4).toString('hex');
        const existing = await EmailAuth.findOne({ token });

        if (!existing) {
            exists = false;
        }

    }

    return token;
}

module.exports = UniqueEmailToken;