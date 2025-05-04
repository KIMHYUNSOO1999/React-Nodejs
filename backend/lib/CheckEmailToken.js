/*
  Config
*/
const EmailAuth = require('../models/EmailAuth');

/*
    Function CheckEmailToken

    - 요청 이메일 토큰 확인

*/

async function CheckEmailToken({ token }) {

  const expireMs = 3 * 60 * 1000
  const auth = await EmailAuth.findOne({ token });

  if (!auth) {
    return { status: 404, msg: '인증 없음' };
  }

  if (auth.status) {
    return { status: 409, msg: '인증 중복' };
  }

  const now = Date.now();
  const timeDiff = now - new Date(auth.regdate).getTime();
  if (timeDiff > expireMs) {
    return { status: 410, msg: '시간 만료' };
  }

  return { status: 200, msg: '인증 유효', auth };
}

module.exports = { CheckEmailToken };
